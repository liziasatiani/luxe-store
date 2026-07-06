import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeDecimal } from "@/lib/utils";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // 1. Await params to comply with Next.js 15+ requirements
    const { slug } = await params;

    const product = await prisma.product.findUnique({
      where: { 
        slug: slug, 
        isActive: true 
      },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        brand: true,
        category: { include: { parent: true } },
        specifications: { orderBy: { sortOrder: "asc" } },
        variants: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
        reviews: {
          where: { isApproved: true },
          include: { user: { select: { id: true, name: true, image: true } } },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        _count: { select: { reviews: true, wishlistItems: true } },
      },
    });

    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    // 2. Increment view count using the ID from the fetched product
    await prisma.product.update({
      where: { id: product.id },
      data: { viewCount: { increment: 1 } },
    });

    // 3. Related products
    const related = await prisma.product.findMany({
      where: {
        isActive: true,
        categoryId: product.categoryId,
        id: { not: product.id },
      },
      select: {
        id: true, name: true, slug: true, price: true,
        comparePrice: true, stockStatus: true, stock: true,
        isFeatured: true, isBestSeller: true, isNewArrival: true,
        isOnSale: true, ratingAvg: true, ratingCount: true, brandId: true,
        images: { where: { isPrimary: true }, select: { url: true, isPrimary: true, altText: true }, take: 2 },
        brand: { select: { name: true, slug: true } },
        category: { select: { name: true, slug: true } },
      },
      take: 8,
      orderBy: { salesCount: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: { 
        product: serializeDecimal(product), 
        related: serializeDecimal(related) 
      },
    });
  } catch (err) {
    console.error("[product/GET]", err);
    return NextResponse.json({ success: false, error: "Failed to fetch product" }, { status: 500 });
  }
}