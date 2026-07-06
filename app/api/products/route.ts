import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeDecimal } from "@/lib/utils";
import type { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const page     = Math.max(1, parseInt(searchParams.get("page")  ?? "1"));
    const limit    = Math.min(48, parseInt(searchParams.get("limit") ?? "24"));
    const skip     = (page - 1) * limit;

    const search    = searchParams.get("search") ?? searchParams.get("q") ?? "";
    const category  = searchParams.get("category") ?? "";
    const brands    = searchParams.get("brands")?.split(",").filter(Boolean) ?? [];
    const minPrice  = searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice")!) : undefined;
    const maxPrice  = searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : undefined;
    const inStock   = searchParams.get("inStock") === "true";
    const onSale    = searchParams.get("onSale") === "true";
    const featured  = searchParams.get("featured") === "true";
    const bestSeller= searchParams.get("bestSeller") === "true";
    const newArrival= searchParams.get("newArrival") === "true";
    const sort      = searchParams.get("sort") ?? "newest";

    const where: Prisma.ProductWhereInput = {
      isActive: true,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { tags: { has: search.toLowerCase() } },
          { brand: { name: { contains: search, mode: "insensitive" } } },
          { category: { name: { contains: search, mode: "insensitive" } } },
        ],
      }),
      ...(category && {
        OR: [
          { category: { slug: category } },
          { category: { parent: { slug: category } } },
        ],
      }),
      ...(brands.length && { brand: { slug: { in: brands } } }),
      ...(minPrice !== undefined && { price: { gte: minPrice } }),
      ...(maxPrice !== undefined && { price: { lte: maxPrice } }),
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

    return NextResponse.json({
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
    });
  } catch (err) {
    console.error("[products/GET]", err);
    return NextResponse.json({ success: false, error: "Failed to fetch products" }, { status: 500 });
  }
}
