import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  if (!await requireAdmin()) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const page = parseInt(req.nextUrl.searchParams.get("page") ?? "1");
    const limit = parseInt(req.nextUrl.searchParams.get("limit") ?? "20");
    const search = req.nextUrl.searchParams.get("search") ?? "";

    const where = {
      role: "USER" as const,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    const [customers, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        select: {
          id: true, name: true, email: true, image: true, createdAt: true, isActive: true,
          _count: { select: { orders: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({ success: true, data: { customers, total, page, totalPages: Math.ceil(total / limit) } });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch customers" }, { status: 500 });
  }
}
