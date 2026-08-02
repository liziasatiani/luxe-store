import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendAbandonedCartEmail } from "@/lib/email";

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  // Find carts created > 1hr ago, not yet notified, and no order placed
  const abandoned = await prisma.abandonedCart.findMany({
    where: {
      createdAt: { lt: oneHourAgo },
      notifiedAt: null,
      orderedAt: null,
    },
    take: 50,
  });

  let sent = 0;
  for (const cart of abandoned) {
    try {
      const items = cart.cartData as Array<{ name: string; price: number; quantity: number; image?: string }>;
      await sendAbandonedCartEmail({
        email: cart.email,
        name: cart.name ?? "there",
        items,
      });
      await prisma.abandonedCart.update({
        where: { id: cart.id },
        data: { notifiedAt: new Date() },
      });
      sent++;
    } catch (err) {
      console.error(`[abandoned-cart] Failed for ${cart.email}:`, err);
    }
  }

  return NextResponse.json({ processed: abandoned.length, sent });
}
