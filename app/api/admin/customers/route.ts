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

export async function PUT(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  try {
    const { id, name, email, phone, isActive } = await req.json();
    if (!id) return NextResponse.json({ success: false, error: "ID required" }, { status: 400 });

    if (email) {
      const conflict = await prisma.user.findFirst({ where: { email, NOT: { id } } });
      if (conflict) return NextResponse.json({ success: false, error: "Email already in use" }, { status: 409 });
    }

    const customer = await prisma.user.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone: phone || null }),
        ...(isActive !== undefined && { isActive }),
      },
      select: { id: true, name: true, email: true, phone: true, isActive: true },
    });
    return NextResponse.json({ success: true, data: { customer } });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to update customer" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ success: false, error: "ID required" }, { status: 400 });

    // Anonymize PII — keep the account and order history, replace personal data
    const anon = `deleted-${id.slice(-8)}`;
    await prisma.user.update({
      where: { id },
      data: {
        name: "Deleted Customer",
        email: `${anon}@deleted.invalid`,
        phone: null,
        image: null,
        passwordHash: null,
        isActive: false,
      },
    });
    // Remove saved addresses
    await prisma.address.deleteMany({ where: { userId: id } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to delete customer" }, { status: 500 });
  }
}
