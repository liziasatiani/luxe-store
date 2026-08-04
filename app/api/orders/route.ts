import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeDecimal, generateOrderNumber, parseIntParam } from "@/lib/utils";
import { rateLimit, getIP, rateLimitResponse } from "@/lib/rateLimit";
import { sendOrderConfirmation, sendAdminNewOrderAlert } from "@/lib/email";
import { resolveCoupon, calcOrderTotals, round2 } from "@/lib/pricing";
import { createOrderSchema, type CartLineInput } from "@/lib/validations";

const LOW_STOCK_AT = 5;

class OrderConflictError extends Error {}

function stockStatusFor(remaining: number) {
  if (remaining <= 0) return "OUT_OF_STOCK" as const;
  if (remaining <= LOW_STOCK_AT) return "LOW_STOCK" as const;
  return "IN_STOCK" as const;
}

/** Collapses repeated product/variant pairs so stock is decremented once. */
function dedupeLines(lines: CartLineInput[]): CartLineInput[] {
  const merged = new Map<string, CartLineInput>();
  for (const line of lines) {
    const key = `${line.productId}::${line.variantId ?? ""}`;
    const existing = merged.get(key);
    if (existing) {
      existing.quantity = Math.min(99, existing.quantity + line.quantity);
    } else {
      merged.set(key, { ...line });
    }
  }
  return [...merged.values()];
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const page = parseIntParam(req.nextUrl.searchParams.get("page"), 1, { min: 1 });
    const limit = parseIntParam(req.nextUrl.searchParams.get("limit"), 10, { min: 1, max: 50 });

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
      data: {
        orders: serializeDecimal(orders),
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("[orders/GET]", err);
    return NextResponse.json({ success: false, error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const rl = await rateLimit(`orders:${getIP(req)}`, 10, 60 * 1000);
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

  try {
    const session = await auth();
    const userId = session?.user?.id ?? null;

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 });
    }

    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }
    const input = parsed.data;

    if (!input.guest && !userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const isGuest = input.guest === true;

    // ─── Resolve products and derive prices server-side ──────────────────
    const lines = dedupeLines(input.cartItems);
    const productIds = [...new Set(lines.map((l) => l.productId))];

    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
      select: {
        id: true, name: true, price: true, stock: true, stockStatus: true,
        trackStock: true, sku: true,
        images: { where: { isPrimary: true }, take: 1, select: { url: true } },
      },
    });
    const byId = new Map(products.map((p) => [p.id, p]));

    for (const line of lines) {
      const product = byId.get(line.productId);
      if (!product) {
        return NextResponse.json(
          { success: false, error: "One or more items are no longer available" },
          { status: 400 }
        );
      }
      if (product.stockStatus === "OUT_OF_STOCK") {
        return NextResponse.json(
          { success: false, error: `${product.name} is out of stock` },
          { status: 400 }
        );
      }
      if (product.trackStock && line.quantity > product.stock) {
        return NextResponse.json(
          { success: false, error: `Only ${product.stock} of ${product.name} available` },
          { status: 400 }
        );
      }
    }

    // Prices come from the database, never from the client payload.
    const subtotal = round2(
      lines.reduce((sum, l) => sum + Number(byId.get(l.productId)!.price) * l.quantity, 0)
    );

    // ─── Coupon (same rule set as the preview endpoint) ──────────────────
    const { coupon, discountAmount, error: couponError } = await resolveCoupon(
      input.couponCode,
      subtotal,
      userId
    );
    if (couponError) {
      return NextResponse.json({ success: false, error: couponError }, { status: 400 });
    }

    const totals = calcOrderTotals(subtotal, coupon, discountAmount);

    // ─── Shipping snapshot ───────────────────────────────────────────────
    let shipping: {
      shippingName: string | null;
      shippingLine1: string | null;
      shippingLine2?: string | null;
      shippingCity: string | null;
      shippingState: string | null;
      shippingPostal: string | null;
      shippingCountry: string;
      shippingPhone?: string | null;
    };

    if (isGuest) {
      // Guest supplies the shipping snapshot directly — no DB address record.
      const snap = (input as Extract<typeof input, { guest: true }>).shippingSnapshot;
      shipping = {
        shippingName: snap.shippingName,
        shippingLine1: snap.shippingLine1,
        shippingLine2: snap.shippingLine2 ?? null,
        shippingCity: snap.shippingCity,
        shippingState: snap.shippingState,
        shippingPostal: snap.shippingPostal,
        shippingCountry: snap.shippingCountry,
        shippingPhone: snap.shippingPhone ?? null,
      };
    } else {
      // Scoped by userId: looking the address up by id alone let any signed-in
      // user snapshot another customer's address onto their own order.
      const addr = await prisma.address.findFirst({
        where: {
          id: (input as Extract<typeof input, { guest: false }>).addressId,
          userId: userId!,
        },
      });
      if (!addr) {
        return NextResponse.json(
          { success: false, error: "Shipping address not found" },
          { status: 400 }
        );
      }
      shipping = {
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

    // ─── Persist ─────────────────────────────────────────────────────────
    const order = await prisma.$transaction(async (tx) => {
      const guestInfo = isGuest
        ? (input as Extract<typeof input, { guest: true }>).guestInfo
        : null;

      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId: userId ?? null,
          guestEmail: guestInfo ? guestInfo.email : null,
          guestName: guestInfo ? `${guestInfo.firstName} ${guestInfo.lastName}` : null,
          guestPhone: guestInfo?.phone ?? null,
          addressId: isGuest ? null : (input as Extract<typeof input, { guest: false }>).addressId,
          paymentMethod: input.paymentMethod,
          couponId: coupon?.id ?? null,
          couponCode: coupon?.code ?? null,
          notes: input.notes ?? null,
          ...totals,
          ...shipping,
          items: {
            create: lines.map((l) => {
              const product = byId.get(l.productId)!;
              const unitPrice = round2(Number(product.price));
              return {
                productId: l.productId,
                variantId: l.variantId ?? null,
                quantity: l.quantity,
                unitPrice,
                totalPrice: round2(unitPrice * l.quantity),
                productName: product.name,
                productImage: product.images[0]?.url ?? null,
                productSku: product.sku,
              };
            }),
          },
        },
        include: { items: true },
      });

      for (const line of lines) {
        const product = byId.get(line.productId)!;
        if (!product.trackStock) continue;

        // Conditional update is the concurrency guard: if a racing order took
        // the last units, `count` is 0 and the whole transaction rolls back.
        const updated = await tx.product.updateMany({
          where: { id: line.productId, stock: { gte: line.quantity } },
          data: {
            stock: { decrement: line.quantity },
            salesCount: { increment: line.quantity },
          },
        });
        if (updated.count === 0) {
          throw new OrderConflictError(
            `${product.name} is no longer available in the requested quantity`
          );
        }
        // `product.stock` is the snapshot read before the transaction, so
        // deriving the status from it writes a stale value whenever a
        // concurrent order also moved stock — the conditional updateMany above
        // guards the decrement but not this follow-up write. Read the real
        // post-decrement figure instead.
        const fresh = await tx.product.findUnique({
          where: { id: line.productId },
          select: { stock: true },
        });
        await tx.product.update({
          where: { id: line.productId },
          data: { stockStatus: stockStatusFor(fresh?.stock ?? 0) },
        });
      }

      // Guest cart lives in client-side state only — no DB record to clear.
      if (!isGuest && userId) {
        await tx.cartItem.deleteMany({ where: { userId } });
      }

      if (coupon) {
        // `resolveCoupon` checks usageCount against usageLimit outside the
        // transaction, so N concurrent orders all read the same pre-increment
        // count and every one of them passes — a limited coupon could be
        // redeemed an unbounded number of times. Re-assert the ceiling as a
        // conditional write; 0 rows means the limit was taken in the interim
        // and the whole order rolls back.
        const claimed = await tx.coupon.updateMany({
          where: {
            id: coupon.id,
            ...(coupon.usageLimit !== null && { usageCount: { lt: coupon.usageLimit } }),
          },
          data: { usageCount: { increment: 1 } },
        });
        if (claimed.count === 0) {
          throw new OrderConflictError("This coupon has just reached its usage limit");
        }
        if (userId) {
          await tx.couponUsage.create({
            data: { couponId: coupon.id, userId, orderId: newOrder.id },
          });
        }
      }

      return newOrder;
    });

    // ─── Confirmation email (never blocks or fails the order) ────────────
    const recipient = isGuest
      ? (() => {
          const gi = (input as Extract<typeof input, { guest: true }>).guestInfo;
          return { name: `${gi.firstName} ${gi.lastName}`, email: gi.email };
        })()
      : await prisma.user
          .findUnique({ where: { id: userId! }, select: { name: true, email: true } })
          .then((u) => (u?.email ? { name: u.name ?? "Customer", email: u.email } : null));

    // Mark any abandoned cart for this email as ordered
    if (recipient) {
      void prisma.abandonedCart.updateMany({
        where: { email: recipient.email, orderedAt: null },
        data: { orderedAt: new Date() },
      }).catch(() => {});
    }

    if (recipient) {
      void Promise.resolve(
        sendOrderConfirmation({
          orderNumber: order.orderNumber,
          orderId: order.id,
          recipientName: recipient.name,
          recipientEmail: recipient.email,
          items: order.items.map((i) => ({
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
          isGuest,
        })
      ).catch((err) => console.error("[orders/POST] confirmation email failed", err));

      sendAdminNewOrderAlert({
        orderNumber: order.orderNumber,
        orderId: order.id,
        customerName: recipient.name,
        customerEmail: recipient.email,
        total: Number(order.total),
        itemCount: order.items.length,
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      data: { order: serializeDecimal(order) },
      message: "Order placed successfully",
    });
  } catch (err) {
    if (err instanceof OrderConflictError) {
      return NextResponse.json({ success: false, error: err.message }, { status: 409 });
    }
    console.error("[orders/POST]", err);
    return NextResponse.json({ success: false, error: "Failed to create order" }, { status: 500 });
  }
}
