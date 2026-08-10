import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeDecimal, parseIntParam } from "@/lib/utils";
import type { Prisma } from "@prisma/client";

/** Returns undefined for absent or non-numeric values so they drop out of `where`. */
function parseFloatParam(raw: string | null): number | undefined {
  if (raw === null || raw.trim() === "") return undefined;
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : undefined;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    // parseIntParam clamps and rejects NaN; `parseInt("abc")` previously flowed
    // into `skip`/`take` and crashed the query with a 500.
    const page     = parseIntParam(searchParams.get("page"), 1, { min: 1 });
    const limit    = parseIntParam(searchParams.get("limit"), 24, { min: 1, max: 48 });
    const skip     = (page - 1) * limit;

    const search    = searchParams.get("search") ?? searchParams.get("q") ?? "";
    const category  = searchParams.get("category") ?? "";
    const brands    = searchParams.get("brands")?.split(",").filter(Boolean) ?? [];
    const minPrice  = parseFloatParam(searchParams.get("minPrice"));
    const maxPrice  = parseFloatParam(searchParams.get("maxPrice"));
    const inStock   = searchParams.get("inStock") === "true";
    const onSale    = searchParams.get("onSale") === "true";
    const featured  = searchParams.get("featured") === "true";
    const bestSeller= searchParams.get("bestSeller") === "true";
    const newArrival= searchParams.get("newArrival") === "true";
    const sort      = searchParams.get("sort") ?? "newest";

    // Search and category each need their own OR group. Spreading two `OR` keys
    // into one object silently dropped the search terms whenever a category was
    // also selected, so filtering inside a category returned the whole category.
    const and: Prisma.ProductWhereInput[] = [];
    if (search) {
      and.push({
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { tags: { has: search.toLowerCase() } },
          { brand: { name: { contains: search, mode: "insensitive" } } },
          { category: { name: { contains: search, mode: "insensitive" } } },
        ],
      });
    }
    if (category) {
      and.push({
        OR: [
          { category: { slug: category } },
          { category: { parent: { slug: category } } },
        ],
      });
    }

    const where: Prisma.ProductWhereInput = {
      isActive: true,
      ...(and.length && { AND: and }),
      ...(brands.length && { brand: { slug: { in: brands } } }),
      // Both bounds must share a single `price` key; two separate keys would
      // silently drop the first (gte/lte collision in object spread).
      ...((minPrice !== undefined || maxPrice !== undefined) && {
        price: {
          ...(minPrice !== undefined && { gte: minPrice }),
          ...(maxPrice !== undefined && { lte: maxPrice }),
        },
      }),
      ...(inStock && { stockStatus: { not: "OUT_OF_STOCK" } }),
      ...(onSale && { isOnSale: true }),
      ...(featured && { isFeatured: true }),
      ...(bestSeller && { isBestSeller: true }),
      ...(newArrival && { isNewArrival: true }),
    };

    const orderBy: Prisma.ProductOrderByWithRelationInput =
      sort === "price-asc"     ? { price: "asc" }
      : sort === "price-desc"  ? { price: "desc" }
      : sort === "rating"      ? { ratingAvg: "desc" }
      : sort === "best-selling"? { salesCount: "desc" }
      : sort === "discount"    ? { comparePrice: "desc" }
      : sort === "oldest"      ? { createdAt: "asc" }
      :                          { createdAt: "desc" };

    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true, name: true, slug: true, price: true,
          comparePrice: true, stockStatus: true, stock: true,
          isFeatured: true, isBestSeller: true, isNewArrival: true,
          isOnSale: true, ratingAvg: true, ratingCount: true, brandId: true,
          images: {
            where: { isPrimary: true },
            select: { url: true, isPrimary: true, altText: true },
            take: 2,
          },
          brand: { select: { name: true, slug: true } },
          category: { select: { name: true, slug: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: {
          products: serializeDecimal(products),
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasNext: skip + limit < total,
          hasPrev: page > 1,
        },
      },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
    );
  } catch (err) {
    console.error("[products/GET]", err);
    return NextResponse.json({ success: false, error: "Failed to fetch products" }, { status: 500 });
  }
}
