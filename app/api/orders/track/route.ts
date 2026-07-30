import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeDecimal, isValidEmail } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const orderNumber = req.nextUrl.searchParams.get("orderNumber");
    const email = req.nextUrl.searchParams.get("email");

    if (!orderNumber || !email) {
      return NextResponse.json({ success: false, error: "Order number and email required" }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ success: false, error: "Invalid email address" }, { status: 400 });
    }

    const emailClean = email.trim().toLowerCase();
    const orderNumberClean = orderNumber.trim().toUpperCase();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const order = await (prisma.order as any).findFirst({
      where: {
        orderNumber: orderNumberClean,
        OR: [
          { user: { email: { equals: emailClean, mode: "insensitive" } } },
          { guestEmail: { equals: emailClean, mode: "insensitive" } },
        ],
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
