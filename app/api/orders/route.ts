import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeDecimal, generateOrderNumber, calcShipping, calcTax, isValidEmail } from "@/lib/utils";
import { rateLimit, getIP, rateLimitResponse } from "@/lib/rateLimit";
import { sendOrderConfirmation } from "@/lib/email";

const SHIPPING_FIELDS = [
  "shippingFirstName", "shippingLastName", "shippingLine1", "shippingLine2",
  "shippingCity", "shippingState", "shippingPostalCode", "shippingCountry", "shippingPhone",
] as const;

function pickShippingFields(snapshot: Record<string, unknown> | null | undefined) {
  if (!snapshot) return {};
  return Object.fromEntries(
    SHIPPING_FIELDS.filter(k => k in snapshot).map(k => [k, snapshot[k]])
  );
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    const page  = Math.max(1, parseInt(req.nextUrl.searchParams.get("page")  ?? "1"));
    const limit = Math.min(50, parseInt(req.nextUrl.searchParams.get("limit") ?? "10"));
    const [orders, total] = await prisma.$transaction([
      prisma.order.findMany({ where: { userId }, include: { items: true }, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit }),
      prisma.order.count({ where: { userId } }),
    ]);
    return NextResponse.json({ success: true, data: { orders: serializeDecimal(orders), total, page, totalPages: Math.ceil(total / limit) } });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const rl = rateLimit(`orders:${getIP(req)}`, 10, 60 * 1000);
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

  try {
    const session = await auth();
    const userId = session?.user?.id;
    const body = await req.json();
    const { guest = false, guestInfo, cartItems: guestCartItems, shippingSnapshot: guestShippingSnapshot, addressId, paymentMethod = "CASH_ON_DELIVERY", couponCode, notes } = body;

    if (guest) {
      if (!guestInfo?.firstName || !guestInfo?.lastName || !guestInfo?.email) {
        return NextResponse.json({ success: false, error: "Guest information is required" }, { status: 400 });
      }
      if (!isValidEmail(guestInfo.email)) {
        return NextResponse.json({ success: false, error: "Invalid email address" }, { status: 400 });
      }
      if (!guestCartItems?.length) {
        return NextResponse.json({ success: false, error: "Cart is empty" }, { status: 400 });
      }

      const productIds = guestCartItems.map((i: { productId: string }) => i.productId);
      const products = await prisma.product.findMany({
        where: { id: { in: productIds }, isActive: true },
        select: { id: true, name: true, price: true, stock: true, stockStatus: true, trackStock: true, sku: true, images: { where: { isPrimary: true }, take: 1, select: { url: true } } },
      });

      for (const item of guestCartItems) {
        const product = products.find((p: { id: string }) => p.id === item.productId);
        if (!product) return NextResponse.json({ success: false, error: "Product not found" }, { status: 400 });
        if (product.stockStatus === "OUT_OF_STOCK") return NextResponse.json({ success: false, error: `${product.name} is out of stock` }, { status: 400 });
      }

      const subtotal = guestCartItems.reduce((sum: number, i: { productId: string; quantity: number }) => {
        const product = products.find((p: { id: string; price: unknown }) => p.id === i.productId);
        return sum + Number(product?.price ?? 0) * i.quantity;
      }, 0);

      let discountAmount = 0;
      let coupon = null;
      if (couponCode) {
        coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } });
        if (coupon?.isActive) {
          if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) coupon = null;
          else if (coupon.type === "PERCENTAGE") {
            discountAmount = (subtotal * Number(coupon.value)) / 100;
            if (coupon.maxDiscount) discountAmount = Math.min(discountAmount, Number(coupon.maxDiscount));
          } else if (coupon.type === "FIXED_AMOUNT") {
            discountAmount = Math.min(Number(coupon.value), subtotal);
          }
        }
      }

      const shippingAmount = coupon?.type === "FREE_SHIPPING" ? 0 : calcShipping(subtotal - discountAmount);
      const taxAmount = calcTax(subtotal - discountAmount + shippingAmount);
      const total = subtotal - discountAmount + shippingAmount + taxAmount;

      const order = await prisma.$transaction(async (tx) => {
        const orderData = {
          orderNumber: generateOrderNumber(),
          guestEmail: guestInfo.email,
          guestName: `${guestInfo.firstName} ${guestInfo.lastName}`,
          guestPhone: guestInfo.phone ?? null,
          paymentMethod,
          couponId: coupon?.id ?? null,
          couponCode: coupon?.code ?? null,
          notes: notes ?? null,
          subtotal, discountAmount, shippingAmount, taxAmount, total,
          ...pickShippingFields(guestShippingSnapshot),
          items: {
            create: guestCartItems.map((i: { productId: string; quantity: number; productName?: string; productImage?: string }) => {
              const product = products.find((p: { id: string; name: string; price: unknown; sku: string; images: { url: string }[] }) => p.id === i.productId);
              const unitPrice = Number(product?.price ?? 0);
              return {
                productId: i.productId,
                quantity: i.quantity,
                unitPrice,
                totalPrice: unitPrice * i.quantity,
                productName: i.productName ?? product?.name ?? "",
                productImage: i.productImage ?? product?.images[0]?.url ?? null,
                productSku: product?.sku ?? "",
              };
            }),
          },
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const newOrder = await tx.order.create({ data: orderData as any, include: { items: true } });

        for (const item of guestCartItems) {
          const product = products.find((p: { id: string; trackStock: boolean; stock: number }) => p.id === item.productId);
          if (product?.trackStock) {
            const updated = await tx.product.updateMany({
              where: { id: item.productId, stock: { gte: item.quantity } },
              data: { stock: { decrement: item.quantity }, salesCount: { increment: item.quantity } },
            });
            if (updated.count === 0) throw new Error(`${product.name} is no longer available in the requested quantity`);
            const remaining = product.stock - item.quantity;
            await tx.product.update({
              where: { id: item.productId },
              data: { stockStatus: remaining === 0 ? "OUT_OF_STOCK" : remaining <= 5 ? "LOW_STOCK" : "IN_STOCK" },
            });
          }
        }

        if (coupon) {
          await tx.coupon.update({ where: { id: coupon.id }, data: { usageCount: { increment: 1 } } });
        }

        return newOrder;
      });

      const orderWithItems = order as typeof order & { items: { productName: string; quantity: number; unitPrice: unknown; totalPrice: unknown }[] };
      void sendOrderConfirmation({
        orderNumber: order.orderNumber,
        orderId: order.id,
        recipientName: `${guestInfo.firstName} ${guestInfo.lastName}`,
        recipientEmail: guestInfo.email,
        items: orderWithItems.items.map(i => ({
          productName: i.productName,
          quantity: i.quantity,
          unitPrice: Number(i.unitPrice),
          totalPrice: Number(i.totalPrice),
        })),
        subtotal: Number(order.subtotal),
        discountAmount: Number(order.discountAmount),
        shippingAmount: Number(order.shippingAmount),
        taxAmount: Number(order.taxAmount),
        total: Number(order.total),
        shippingName: order.shippingName,
        shippingLine1: order.shippingLine1,
        shippingCity: order.shippingCity,
        shippingState: order.shippingState,
        shippingPostal: order.shippingPostal,
        shippingCountry: order.shippingCountry,
        couponCode: order.couponCode,
        isGuest: true,
      });

      return NextResponse.json({ success: true, data: { order: serializeDecimal(order) }, message: "Order placed successfully" });
    }

    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          select: { id: true, name: true, price: true, stock: true, stockStatus: true, trackStock: true, sku: true, images: { where: { isPrimary: true }, take: 1, select: { url: true } } },
        },
      },
    });

    if (cartItems.length === 0) return NextResponse.json({ success: false, error: "Cart is empty" }, { status: 400 });

    for (const item of cartItems) {
      if (item.product.stockStatus === "OUT_OF_STOCK") return NextResponse.json({ success: false, error: `${item.product.name} is out of stock` }, { status: 400 });
      if (item.product.trackStock && item.quantity > item.product.stock) return NextResponse.json({ success: false, error: `Only ${item.product.stock} of ${item.product.name} available` }, { status: 400 });
    }

    const subtotal = cartItems.reduce((sum, i) => sum + Number(i.product.price) * i.quantity, 0);

    let discountAmount = 0;
    let coupon = null;
    if (couponCode) {
      coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } });
      if (coupon?.isActive) {
        if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) coupon = null;
        else if (coupon.type === "PERCENTAGE") {
          discountAmount = (subtotal * Number(coupon.value)) / 100;
          if (coupon.maxDiscount) discountAmount = Math.min(discountAmount, Number(coupon.maxDiscount));
        } else if (coupon.type === "FIXED_AMOUNT") {
          discountAmount = Math.min(Number(coupon.value), subtotal);
        }
      }
    }

    const shippingAmount = coupon?.type === "FREE_SHIPPING" ? 0 : calcShipping(subtotal - discountAmount);
    const taxAmount = calcTax(subtotal - discountAmount + shippingAmount);
    const total = subtotal - discountAmount + shippingAmount + taxAmount;

    let shippingSnapshot = {};
    if (addressId) {
      const addr = await prisma.address.findUnique({ where: { id: addressId } });
      if (addr) {
        shippingSnapshot = {
          shippingName: `${addr.firstName} ${addr.lastName}`,
          shippingLine1: addr.line1, shippingLine2: addr.line2,
          shippingCity: addr.city, shippingState: addr.state,
          shippingPostal: addr.postalCode, shippingCountry: addr.country,
          shippingPhone: addr.phone,
        };
      }
    }

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId,
          addressId: addressId ?? null,
          paymentMethod,
          couponId: coupon?.id ?? null,
          couponCode: coupon?.code ?? null,
          notes: notes ?? null,
          subtotal, discountAmount, shippingAmount, taxAmount, total,
          ...shippingSnapshot,
          items: {
            create: cartItems.map((i) => ({
              productId: i.productId, variantId: i.variantId ?? null, quantity: i.quantity,
              unitPrice: Number(i.product.price), totalPrice: Number(i.product.price) * i.quantity,
              productName: i.product.name, productImage: i.product.images[0]?.url ?? null, productSku: i.product.sku,
            })),
          },
        },
        include: { items: true },
      });

      for (const item of cartItems) {
        if (item.product.trackStock) {
          const updated = await tx.product.updateMany({
            where: { id: item.productId, stock: { gte: item.quantity } },
            data: { stock: { decrement: item.quantity }, salesCount: { increment: item.quantity } },
          });
          if (updated.count === 0) throw new Error(`${item.product.name} is no longer available in the requested quantity`);
          const remaining = item.product.stock - item.quantity;
          await tx.product.update({
            where: { id: item.productId },
            data: { stockStatus: remaining === 0 ? "OUT_OF_STOCK" : remaining <= 5 ? "LOW_STOCK" : "IN_STOCK" },
          });
        }
      }

      await tx.cartItem.deleteMany({ where: { userId } });

      if (coupon) {
        await tx.coupon.update({ where: { id: coupon.id }, data: { usageCount: { increment: 1 } } });
        await tx.couponUsage.create({ data: { couponId: coupon.id, userId, orderId: newOrder.id } });
      }

      return newOrder;
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });

    if (user?.email) {
      void sendOrderConfirmation({
        orderNumber: order.orderNumber,
        orderId: order.id,
        recipientName: user.name ?? "Customer",
        recipientEmail: user.email,
        items: order.items.map(i => ({
          productName: i.productName,
          quantity: i.quantity,
          unitPrice: Number(i.unitPrice),
          totalPrice: Number(i.totalPrice),
        })),
        subtotal: Number(order.subtotal),
        discountAmount: Number(order.discountAmount),
        shippingAmount: Number(order.shippingAmount),
        taxAmount: Number(order.taxAmount),
        total: Number(order.total),
        shippingName: order.shippingName,
        shippingLine1: order.shippingLine1,
        shippingCity: order.shippingCity,
        shippingState: order.shippingState,
        shippingPostal: order.shippingPostal,
        shippingCountry: order.shippingCountry,
        couponCode: order.couponCode,
        isGuest: false,
      });
    }

    return NextResponse.json({ success: true, data: { order: serializeDecimal(order) }, message: "Order placed successfully" });
  } catch (err) {
    console.error("[orders/POST]", err);
    return NextResponse.json({ success: false, error: "Failed to create order" }, { status: 500 });
  }
}
