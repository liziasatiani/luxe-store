import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { ids } = await req.json() as { ids: unknown[] };
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: true, data: { ids: [] } });
    }

    const stringIds = ids.filter((id): id is string => typeof id === "string");

    const validProducts = await prisma.product.findMany({
      where: { id: { in: stringIds.slice(0, 200) }, isActive: true },
      select: { id: true },
    });
    const validIds = validProducts.map(p => p.id);

    if (validIds.length > 0) {
      await prisma.wishlistItem.createMany({
        data: validIds.map(productId => ({ userId: session.user!.id!, productId })),
        skipDuplicates: true,
      });
    }

    const dbItems = await prisma.wishlistItem.findMany({
      where: { userId: session.user.id },
      select: { productId: true },
    });

    return NextResponse.json({ success: true, data: { ids: dbItems.map(i => i.productId) } });
  } catch (err) {
    console.error("[wishlist/sync]", err);
    return NextResponse.json({ success: false, error: "Failed to sync wishlist" }, { status: 500 });
  }
}
