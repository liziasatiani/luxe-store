import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseIntParam } from "@/lib/utils";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  try {
    const limit = parseIntParam(req.nextUrl.searchParams.get("limit"), 50, { min: 1, max: 100 });
    const featured = req.nextUrl.searchParams.get("featured") === "true";

    const brands = await prisma.brand.findMany({
      where: { isActive: true, ...(featured && { isFeatured: true }) },
      select: {
        id: true, name: true, slug: true, logo: true, description: true,
        isFeatured: true, website: true,
        _count: { select: { products: { where: { isActive: true } } } },
      },
      orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
      take: limit,
    });

    return NextResponse.json({ success: true, data: { brands } }, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
    });
  } catch (err) {
    console.error("[brands/GET]", err);
    return NextResponse.json({ success: false, error: "Failed to fetch brands" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    const { name } = await req.json();
    if (!name?.trim()) {
      return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 });
    }
    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const brand = await prisma.brand.create({
      data: { name: name.trim(), slug },
      select: { id: true, name: true, slug: true },
    });
    return NextResponse.json({ success: true, data: { brand } });
  } catch (err) {
    console.error("[brands/POST]", err);
    return NextResponse.json({ success: false, error: "Failed to create brand" }, { status: 500 });
  }
}
