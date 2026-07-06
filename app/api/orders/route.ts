import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeDecimal, generateOrderNumber, calcShipping, calcTax } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const page = parseInt(req.nextUrl.searchParams.get("page") ?? "1");
    const limit = parseInt(req.nextUrl.searchParams.get("limit") ?? "10");

    const [orders, total] = await prisma.$transaction([
      prisma.order.findMany({
        where: { userId },
        include: { items: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where: { userId } }),
    ]);

    return NextResponse.json({
      success: true,
      data: { orders: serializeDecimal(orders), total, page, totalPages: Math.ceil(total / limit) },
    });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { addressId, paymentMethod = "STRIPE", couponCode, notes } = body;

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true, name: true, price: true, stock: true,
            stockStatus: true, trackStock: true, sku: true,
            images: { where: { isPrimary: true }, take: 1, select: { url: true } },
          },
        },
      },
    });

    if (cartItems.length === 0) {
      return NextResponse.json({ success: false, error: "Cart is empty" }, { status: 400 });
    }

    for (const item of cartItems) {
      if (item.product.stockStatus === "OUT_OF_STOCK") {
        return NextResponse.json({ success: false, error: `${item.product.name} is out of stock` }, { status: 400 });
      }
      if (item.product.trackStock && item.quantity > item.product.stock) {
        return NextResponse.json({ success: false, error: `Only ${item.product.stock} of ${item.product.name} available` }, { status: 400 });
      }
    }

    const subtotal = cartItems.reduce((sum, i) => sum + Number(i.product.price) * i.quantity, 0);

    let discountAmount = 0;
    let coupon = null;
    if (couponCode) {
      coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } });
      if (coupon?.isActive) {
        if (coupon.type === "PERCENTAGE") {
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
          shippingLine1: addr.line1,
          shippingLine2: addr.line2,
          shippingCity: addr.city,
          shippingState: addr.state,
          shippingPostal: addr.postalCode,
          shippingCountry: addr.country,
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
          subtotal,
          discountAmount,
          shippingAmount,
          taxAmount,
          total,
          ...shippingSnapshot,
          items: {
            create: cartItems.map((i) => ({
              productId: i.productId,
              variantId: i.variantId ?? null,
              quantity: i.quantity,
              unitPrice: Number(i.product.price),
              totalPrice: Number(i.product.price) * i.quantity,
              productName: i.product.name,
              productImage: i.product.images[0]?.url ?? null,
              productSku: i.product.sku,
            })),
          },
        },
        include: { items: true },
      });

      for (const item of cartItems) {
        if (item.product.trackStock) {
          const newStock = Math.max(0, item.product.stock - item.quantity);
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: newStock,
              stockStatus: newStock === 0 ? "OUT_OF_STOCK" : newStock <= 5 ? "LOW_STOCK" : "IN_STOCK",
              salesCount: { increment: item.quantity },
            },
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

    return NextResponse.json({
      success: true,
      data: { order: serializeDecimal(order) },
      message: "Order placed successfully",
    });
  } catch (err) {
    console.error("[orders/POST]", err);
    return NextResponse.json({ success: false, error: "Failed to create order" }, { status: 500 });
  }
}
