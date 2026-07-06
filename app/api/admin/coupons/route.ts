import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeDecimal } from "@/lib/utils";

async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  return ["ADMIN", "SUPER_ADMIN"].includes(role ?? "");
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ success: true, data: { coupons: serializeDecimal(coupons) } });
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const coupon = await prisma.coupon.create({
    data: {
      code: body.code.toUpperCase(),
      type: body.type,
      value: parseFloat(body.value),
      minOrderAmount: body.minOrderAmount,
      maxDiscount: body.maxDiscount,
      usageLimit: body.usageLimit,
      perUserLimit: body.perUserLimit ?? 1,
      description: body.description,
      isActive: true,
    },
  });
  return NextResponse.json({ success: true, data: { coupon: serializeDecimal(coupon) } }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const { id, ...data } = await req.json();
  const coupon = await prisma.coupon.update({ where: { id }, data });
  return NextResponse.json({ success: true, data: { coupon: serializeDecimal(coupon) } });
}

export async function DELETE(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  await prisma.coupon.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
