import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeDecimal } from "@/lib/utils";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ success: true, data: { items: [] } });

    const items = await prisma.wishlistItem.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          select: {
            id: true, name: true, slug: true, price: true, comparePrice: true,
            stock: true, stockStatus: true, ratingAvg: true, ratingCount: true,
            isFeatured: true, isBestSeller: true, isNewArrival: true, isOnSale: true, brandId: true,
            images: { where: { isPrimary: true }, take: 1 },
            brand: { select: { name: true, slug: true } },
            category: { select: { name: true, slug: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: { items: serializeDecimal(items) } });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Failed to fetch wishlist" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { productId } = await req.json();

    const existing = await prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId: session.user.id, productId } },
    });

    if (existing) {
      await prisma.wishlistItem.delete({ where: { id: existing.id } });
      return NextResponse.json({ success: true, data: { action: "removed" } });
    } else {
      await prisma.wishlistItem.create({ data: { userId: session.user.id, productId } });
      return NextResponse.json({ success: true, data: { action: "added" } });
    }
  } catch (err) {
    return NextResponse.json({ success: false, error: "Failed to update wishlist" }, { status: 500 });
  }
}
