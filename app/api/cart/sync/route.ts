import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { items } = await req.json() as {
      items: Array<{ productId: string; variantId?: string | null; quantity: number }>;
    };

    for (const item of items) {
      if (!item.productId || !item.quantity) continue;
      const product = await prisma.product.findUnique({ where: { id: item.productId }, select: { id: true } });
      if (!product) continue;

      const variantId = item.variantId ?? null;

      try {
        await prisma.cartItem.upsert({
          where: {
            userId_productId_variantId: { userId, productId: item.productId, variantId: variantId ?? "" },
          },
          update: { quantity: item.quantity },
          create: { userId, productId: item.productId, variantId, quantity: item.quantity },
        });
      } catch { /* skip constraint issues */ }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[cart/sync]", err);
    return NextResponse.json({ success: false, error: "Sync failed" }, { status: 500 });
  }
}
