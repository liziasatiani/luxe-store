import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const parent = req.nextUrl.searchParams.get("parent");
    const tree = req.nextUrl.searchParams.get("tree") === "true";

    if (tree) {
      const categories = await prisma.category.findMany({
        where: { parentId: null, isActive: true },
        include: {
          children: {
            where: { isActive: true },
            include: { _count: { select: { products: { where: { isActive: true } } } } },
            orderBy: { sortOrder: "asc" },
          },
        },
        orderBy: { sortOrder: "asc" },
      });
      return NextResponse.json({ success: true, data: { categories } });
    }

    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
        ...(parent ? { parent: { slug: parent } } : {}),
      },
      include: {
        _count: { select: { products: { where: { isActive: true } } } },
        children: { where: { isActive: true }, select: { name: true, slug: true } },
      },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ success: true, data: { categories } });
  } catch (err) {
    console.error("[categories/GET]", err);
    return NextResponse.json({ success: false, error: "Failed to fetch categories" }, { status: 500 });
  }
}
