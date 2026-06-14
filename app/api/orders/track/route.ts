import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeDecimal, isValidEmail, normalizeEmail } from "@/lib/utils";
import { rateLimit, getIP, rateLimitResponse } from "@/lib/rateLimit";

export async function GET(req: NextRequest) {
  // This is the only unauthenticated endpoint that returns personal data (full
  // recipient name, street address, postal code, order contents). It had no
  // throttle at all, so `orderNumber` + `email` pairs could be guessed at line
  // speed. The previous audit edited this file and left that untouched.
  const rl = await rateLimit(`track:${getIP(req)}`, 10, 60 * 1000);
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

  try {
    const orderNumber = req.nextUrl.searchParams.get("orderNumber");
    const email = req.nextUrl.searchParams.get("email");

    if (!orderNumber || !email) {
      return NextResponse.json({ success: false, error: "Order number and email required" }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ success: false, error: "Invalid email address" }, { status: 400 });
    }

    const emailClean = normalizeEmail(email);
    const orderNumberClean = orderNumber.trim().toUpperCase();

    // Orders are always attached to a user: `Order` has no guest columns, so the
    // previous `guestEmail` branch referenced a column that does not exist and
    // made every lookup throw. The `as any` cast is what hid it from the compiler.
    const order = await prisma.order.findFirst({
      where: {
        orderNumber: orderNumberClean,
        user: { email: { equals: emailClean, mode: "insensitive" } },
      },
      include: {
        items: { select: { productName: true, quantity: true, totalPrice: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found. Please check your order number and email." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        order: serializeDecimal({
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          total: order.total,
          createdAt: order.createdAt,
          shippedAt: order.shippedAt,
          deliveredAt: order.deliveredAt,
          trackingNumber: order.trackingNumber,
          trackingUrl: order.trackingUrl,
          items: order.items,
          shippingName: order.shippingName,
          shippingLine1: order.shippingLine1,
          shippingCity: order.shippingCity,
          shippingState: order.shippingState,
          shippingPostal: order.shippingPostal,
        }),
      },
    });
  } catch (err) {
    console.error("[orders/track]", err);
    return NextResponse.json({ success: false, error: "Failed to track order" }, { status: 500 });
  }
}
