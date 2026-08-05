import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseIntParam } from "@/lib/utils";

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
