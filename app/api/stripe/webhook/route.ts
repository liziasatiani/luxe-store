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
          const existing = await prisma.order.findUnique({
            where: { id: orderId },
            select: { paymentStatus: true },
          });
          if (existing?.paymentStatus === "PAID") break;

          await prisma.order.update({
            where: { id: orderId },
            data: {
              status: "CONFIRMED",
              paymentStatus: "PAID",
              stripeSessionId: session.id,
            },
          });

          const order = await prisma.order.findUnique({ where: { id: orderId } });
          if (order?.userId) {
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
          include: { items: { select: { productId: true, quantity: true } } },
        });
        if (!order) break;

        // Only act on orders that haven't already been paid or refunded,
        // so a late-arriving webhook can't double-restore stock.
        if (order.paymentStatus === "PAID" || order.paymentStatus === "REFUNDED") break;

        await prisma.$transaction(async (tx) => {
          await tx.order.update({
            where: { id: order.id },
            data: { paymentStatus: "FAILED", status: "CANCELLED", cancelledAt: new Date() },
          });

          // Restore stock for every line item and recompute stockStatus so the
          // product is immediately purchasable again without a manual admin action.
          for (const item of order.items) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            });

            const fresh = await tx.product.findUnique({
              where: { id: item.productId },
              select: { stock: true, lowStockAt: true },
            });
            if (fresh) {
              const stockStatus =
                fresh.stock <= 0
                  ? "OUT_OF_STOCK"
                  : fresh.stock <= fresh.lowStockAt
                    ? "LOW_STOCK"
                    : "IN_STOCK";
              await tx.product.update({
                where: { id: item.productId },
                data: { stockStatus },
              });
            }
          }

          // Notify the customer so they can retry with a different payment method.
          const notifyUserId = order.userId;
          if (notifyUserId) {
            await tx.notification.create({
              data: {
                userId: notifyUserId,
                type: "ORDER_CANCELLED",
                title: "Payment failed",
                message: `Payment for order #${order.orderNumber} was declined. Please try again with a different payment method.`,
                link: `/account/orders/${order.id}`,
              },
            });
          }
        });
        break;
      }
    }
  } catch (err) {
    // Returning 200 here told Stripe the event was handled, so a transient
    // database failure permanently lost the payment confirmation: the order
    // stayed PENDING/unpaid with no retry and no alert. Signal failure so
    // Stripe redelivers. The handlers above are already idempotent (the
    // paymentStatus === "PAID" short-circuit), which is what makes retry safe.
    console.error("[stripe/webhook] handler error:", err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
