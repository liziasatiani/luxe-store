import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { serializeDecimal } from "@/lib/utils";

export async function GET(req: NextRequest) {
  if (!await requireAdmin()) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (id) {
    try {
      const customer = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true, name: true, email: true, image: true, phone: true,
          createdAt: true, isActive: true,
          addresses: {
            orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
            select: { id: true, label: true, firstName: true, lastName: true, line1: true, line2: true, city: true, state: true, postalCode: true, country: true, phone: true, isDefault: true },
          },
          orders: {
            orderBy: { createdAt: "desc" },
            select: { id: true, orderNumber: true, status: true, paymentStatus: true, total: true, createdAt: true, items: { select: { productName: true, quantity: true, unitPrice: true } } },
          },
        },
      });
      if (!customer) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
      return NextResponse.json({ success: true, data: { customer: serializeDecimal(customer) } });
    } catch {
      return NextResponse.json({ success: false, error: "Failed to fetch customer" }, { status: 500 });
    }
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
