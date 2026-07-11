import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeDecimal } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const ids = req.nextUrl.searchParams.get("ids")?.split(",").filter(Boolean) ?? [];
    if (ids.length === 0) return NextResponse.json({ success: true, data: { products: [] } });
    const products = await prisma.product.findMany({
      where: { id: { in: ids.slice(0, 100) }, isActive: true },
      select: {
        id: true, name: true, slug: true, price: true, comparePrice: true,
        stockStatus: true, stock: true, ratingAvg: true, ratingCount: true,
        isFeatured: true, isBestSeller: true, isNewArrival: true, isOnSale: true, brandId: true,
        images: { where: { isPrimary: true }, take: 1, select: { url: true, isPrimary: true, altText: true } },
        brand: { select: { name: true, slug: true } },
        category: { select: { name: true, slug: true } },
      },
    });
    return NextResponse.json({ success: true, data: { products: serializeDecimal(products) } });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to load wishlist products" }, { status: 500 });
  }
}
