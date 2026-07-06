import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCheckoutSession, STRIPE_ENABLED } from "@/lib/stripe";
import { serializeDecimal } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    if (!STRIPE_ENABLED) {
      return NextResponse.json({ success: false, error: "Stripe is disabled" }, { status: 400 });
    }

    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { orderId } = await req.json();

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: session.user.id },
      include: { items: true },
    });

    if (!order) return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });

    const lineItems = order.items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.productName,
          images: item.productImage ? [item.productImage] : [],
        },
        unit_amount: Math.round(Number(item.unitPrice) * 100),
      },
      quantity: item.quantity,
    }));

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const stripeSession = await createCheckoutSession({
      lineItems,
      successUrl: `${baseUrl}/checkout/success?orderId=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/checkout?cancelled=true`,
      customerEmail: session.user.email ?? undefined,
      metadata: { orderId: order.id, userId: session.user.id },
    });

    // Save stripe session id
    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: stripeSession.id },
    });

    return NextResponse.json({ success: true, data: { url: stripeSession.url, sessionId: stripeSession.id } });
  } catch (err) {
    console.error("[stripe/checkout]", err);
    return NextResponse.json({ success: false, error: "Failed to create checkout session" }, { status: 500 });
  }
}
