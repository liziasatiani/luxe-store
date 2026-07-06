import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeDecimal } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get("q") ?? "";
    const limit = parseInt(req.nextUrl.searchParams.get("limit") ?? "10");

    if (!q.trim()) {
      return NextResponse.json({ success: true, data: { products: [], categories: [], brands: [], total: 0 } });
    }

    const [products, categories, brands] = await prisma.$transaction([
      prisma.product.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            { brand: { name: { contains: q, mode: "insensitive" } } },
            { category: { name: { contains: q, mode: "insensitive" } } },
            { tags: { has: q.toLowerCase() } },
          ],
        },
        select: {
          id: true, name: true, slug: true, price: true, comparePrice: true,
          stockStatus: true, stock: true, isFeatured: true, isBestSeller: true,
          isNewArrival: true, isOnSale: true, ratingAvg: true, ratingCount: true, brandId: true,
          images: { where: { isPrimary: true }, select: { url: true, isPrimary: true, altText: true }, take: 1 },
          brand: { select: { name: true, slug: true } },
          category: { select: { name: true, slug: true } },
        },
        take: limit,
        orderBy: [{ isFeatured: "desc" }, { salesCount: "desc" }],
      }),
      prisma.category.findMany({
        where: { name: { contains: q, mode: "insensitive" }, isActive: true },
        select: { id: true, name: true, slug: true },
        take: 3,
      }),
      prisma.brand.findMany({
        where: { name: { contains: q, mode: "insensitive" }, isActive: true },
        select: { id: true, name: true, slug: true },
        take: 3,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        products: serializeDecimal(products),
        categories,
        brands,
        total: products.length + categories.length + brands.length,
      },
    });
  } catch (err) {
    console.error("[search/GET]", err);
    return NextResponse.json({ success: false, error: "Search failed" }, { status: 500 });
  }
}
