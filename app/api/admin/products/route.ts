import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validations";
import { slugify, serializeDecimal, parseIntParam } from "@/lib/utils";
import { requireAdmin } from "@/lib/adminAuth";
import { sendRestockNotifications } from "@/lib/email";

export async function GET(req: NextRequest) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const id = req.nextUrl.searchParams.get("id");
    if (id) {
      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          images: { orderBy: { sortOrder: "asc" } },
          specifications: { orderBy: { sortOrder: "asc" } },
          brand: { select: { id: true, name: true } },
          category: { select: { id: true, name: true, slug: true } },
        },
      });
      if (!product) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
      return NextResponse.json({ success: true, data: { product: serializeDecimal(product) } });
    }

    const page = parseIntParam(req.nextUrl.searchParams.get("page"), 1, { min: 1 });
    const limit = parseIntParam(req.nextUrl.searchParams.get("limit"), 20, { min: 1, max: 100 });
    const search = req.nextUrl.searchParams.get("search") ?? "";
    const category = req.nextUrl.searchParams.get("category") ?? "";
    const stock = req.nextUrl.searchParams.get("stock") ?? "";

    const where = {
      ...(search && { OR: [{ name: { contains: search, mode: "insensitive" as const } }, { sku: { contains: search, mode: "insensitive" as const } }] }),
      ...(category && { category: { slug: category } }),
      ...(stock && { stockStatus: stock as "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" }),
    };

    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        include: {
          images: { orderBy: { sortOrder: "asc" } },
          brand: { select: { name: true } },
          category: { select: { name: true, slug: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({ success: true, data: { products: serializeDecimal(products), total, page, totalPages: Math.ceil(total / limit) } });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });

    const { images = [], specifications = [], variants = [], ...data } = body;

    const baseSlug = slugify(data.name);
    const existing = await prisma.product.findUnique({ where: { slug: baseSlug } });
    const slug = existing ? `${baseSlug}-${Date.now()}` : baseSlug;

    const stockStatus = data.stock === 0 ? "OUT_OF_STOCK" : data.stock <= (data.lowStockAt ?? 5) ? "LOW_STOCK" : "IN_STOCK";
    const isOnSale = data.comparePrice != null && Number(data.comparePrice) > Number(data.price);

    const product = await prisma.product.create({
      data: {
        ...parsed.data,
        slug,
        stockStatus,
        isOnSale,
        brandId: data.brandId || null,
        images: { create: images.map((img: { url: string; altText?: string; isPrimary?: boolean }, i: number) => ({ url: img.url, altText: img.altText, isPrimary: i === 0, sortOrder: i })) },
        specifications: { create: specifications.map((s: { name: string; value: string }, i: number) => ({ name: s.name, value: s.value, sortOrder: i })) },
        variants: { create: variants.map((v: { name: string; value: string; price?: number; stock?: number }, i: number) => ({ name: v.name, value: v.value, price: v.price, stock: v.stock, sortOrder: i })) },
      },
      include: { images: true, specifications: true },
    });

    return NextResponse.json({ success: true, data: { product: serializeDecimal(product) } }, { status: 201 });
  } catch (err) {
    console.error("[admin/products POST]", err);
    return NextResponse.json({ success: false, error: "Failed to create product" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { id, images = [], specifications = [], ...rest } = body;
    if (!id) return NextResponse.json({ success: false, error: "Product ID required" }, { status: 400 });

    const parsed = productSchema.partial().safeParse(rest);
    if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    const data = parsed.data;

    // Only recompute stockStatus when stock is explicitly included in the update.
    const stockStatusUpdate = data.stock !== undefined
      ? { stockStatus: (data.stock === 0 ? "OUT_OF_STOCK" : data.stock <= (data.lowStockAt ?? 5) ? "LOW_STOCK" : "IN_STOCK") as "OUT_OF_STOCK" | "LOW_STOCK" | "IN_STOCK" }
      : {};

    const isOnSaleUpdate = data.comparePrice !== undefined || data.price !== undefined
      ? { isOnSale: data.comparePrice != null && Number(data.comparePrice) > Number(data.price) }
      : {};

    const prevStatus = stockStatusUpdate.stockStatus
      ? (await prisma.product.findUnique({ where: { id }, select: { stockStatus: true } }))?.stockStatus
      : null;

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...data,
        ...stockStatusUpdate,
        ...isOnSaleUpdate,
        brandId: data.brandId || null,
        images: {
          deleteMany: {},
          create: images.map((img: { url: string; altText?: string; isPrimary?: boolean }, i: number) => ({ url: img.url, altText: img.altText, isPrimary: img.isPrimary ?? i === 0, sortOrder: i })),
        },
        specifications: {
          deleteMany: {},
          create: specifications.map((s: { name: string; value: string }, i: number) => ({ name: s.name, value: s.value, sortOrder: i })),
        },
      },
    });

    if (prevStatus === "OUT_OF_STOCK" && stockStatusUpdate.stockStatus !== "OUT_OF_STOCK") {
      prisma.$queryRawUnsafe<Array<{ email: string }>>(
        `SELECT email FROM "stock_notifications" WHERE "productId" = $1 AND "notifiedAt" IS NULL`,
        id
      ).then(async rows => {
        if (!rows.length) return;
        await sendRestockNotifications(rows.map(r => r.email), product.name, product.slug);
        await prisma.$executeRawUnsafe(
          `UPDATE "stock_notifications" SET "notifiedAt" = NOW() WHERE "productId" = $1 AND "notifiedAt" IS NULL`,
          id
        );
      }).catch(err => console.error("[restock notifications]", err));
    }

    return NextResponse.json({ success: true, data: { product: serializeDecimal(product) } });
  } catch (err) {
    console.error("[admin/products PUT]", err);
    return NextResponse.json({ success: false, error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { id } = await req.json();
    await prisma.product.update({ where: { id }, data: { isActive: false } });

    return NextResponse.json({ success: true, message: "Product deactivated" });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to delete product" }, { status: 500 });
  }
}
