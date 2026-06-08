import { NextRequest, NextResponse } from "next/server";
import { constructWebhookEvent, STRIPE_ENABLED } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  if (!STRIPE_ENABLED) return NextResponse.json({ received: false });

  const payload = await req.text();
  const signature = req.headers.get("stripe-signature") ?? "";

  let event;
  try {
    event = await constructWebhookEvent(payload, signature);
  } catch (err) {
    console.error("[stripe/webhook] signature error:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const orderId = session.metadata?.orderId;
        if (orderId) {
          await prisma.order.update({
            where: { id: orderId },
            data: {
              status: "CONFIRMED",
              paymentStatus: "PAID",
              stripeSessionId: session.id,
            },
          });

          // Send notification
          const order = await prisma.order.findUnique({ where: { id: orderId } });
          if (order) {
            await prisma.notification.create({
              data: {
                userId: order.userId,
                type: "ORDER_PLACED",
                title: "Order Confirmed!",
                message: `Your order #${order.orderNumber} has been confirmed.`,
                link: `/account/orders/${order.id}`,
              },
            });
          }
        }
        break;
      }
      case "payment_intent.payment_failed": {
        const pi = event.data.object;
        const order = await prisma.order.findFirst({
          where: { stripePaymentIntentId: pi.id },
        });
        if (order) {
          await prisma.order.update({
            where: { id: order.id },
            data: { paymentStatus: "FAILED" },
          });
        }
        break;
      }
    }
  } catch (err) {
    console.error("[stripe/webhook] handler error:", err);
  }

  return NextResponse.json({ received: true });
}
