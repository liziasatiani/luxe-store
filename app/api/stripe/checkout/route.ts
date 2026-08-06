import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCheckoutSession, STRIPE_ENABLED } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    if (!STRIPE_ENABLED) {
      return NextResponse.json({ success: false, error: "Stripe is disabled" }, { status: 400 });
    }

    const { orderId, guestEmail } = await req.json();
    const session = await auth();

    const where = session?.user?.id
      ? { id: orderId, userId: session.user.id }
      : { id: orderId };

    const order = await prisma.order.findFirst({
      where,
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
    const customerEmail = guestEmail ?? session?.user?.email ?? undefined;

    const stripeSession = await createCheckoutSession({
      lineItems,
      successUrl: `${baseUrl}/checkout/success?orderId=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/checkout?cancelled=true`,
      customerEmail,
      metadata: { orderId: order.id, userId: order.userId ?? "" },
    });

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
