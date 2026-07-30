import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validations";
import { slugify, serializeDecimal } from "@/lib/utils";

async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!["ADMIN", "SUPER_ADMIN"].includes(role ?? "")) return null;
  return session;
}

export async function GET(req: NextRequest) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const page = parseInt(req.nextUrl.searchParams.get("page") ?? "1");
    const limit = parseInt(req.nextUrl.searchParams.get("limit") ?? "20");
    const search = req.nextUrl.searchParams.get("search") ?? "";
    const category = req.nextUrl.searchParams.get("category") ?? "";

    const where = {
      ...(search && { OR: [{ name: { contains: search, mode: "insensitive" as const } }, { sku: { contains: search, mode: "insensitive" as const } }] }),
      ...(category && { category: { slug: category } }),
    };

    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        include: {
          images: { where: { isPrimary: true }, take: 1 },
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
  } catch (err) {
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

    const product = await prisma.product.create({
      data: {
        ...parsed.data,
        slug,
        stockStatus,
        brandId: data.brandId || null,
        images: { create: images.map((img: { url: string; altText?: string; isPrimary?: boolean }, i: number) => ({ ...img, sortOrder: i, isPrimary: i === 0 })) },
        specifications: { create: specifications.map((s: { name: string; value: string }, i: number) => ({ ...s, sortOrder: i })) },
        variants: { create: variants.map((v: { name: string; value: string; price?: number; stock?: number }, i: number) => ({ ...v, sortOrder: i })) },
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
    const { id, images = [], specifications = [], ...data } = body;
    if (!id) return NextResponse.json({ success: false, error: "Product ID required" }, { status: 400 });

    const stockStatus = data.stock === 0 ? "OUT_OF_STOCK" : data.stock <= (data.lowStockAt ?? 5) ? "LOW_STOCK" : "IN_STOCK";

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...data,
        stockStatus,
        brandId: data.brandId || null,
        images: {
          deleteMany: {},
          create: images.map((img: { url: string; altText?: string; isPrimary?: boolean }, i: number) => ({ ...img, sortOrder: i, isPrimary: i === 0 })),
        },
        specifications: {
          deleteMany: {},
          create: specifications.map((s: { name: string; value: string }, i: number) => ({ ...s, sortOrder: i })),
        },
      },
    });

    return NextResponse.json({ success: true, data: { product: serializeDecimal(product) } });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { id } = await req.json();
    await prisma.product.update({ where: { id }, data: { isActive: false } });

    return NextResponse.json({ success: true, message: "Product deactivated" });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Failed to delete product" }, { status: 500 });
  }
}
