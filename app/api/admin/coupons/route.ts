import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeDecimal } from "@/lib/utils";
import { couponSchema } from "@/lib/validations";

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
  const parsed = couponSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
  }
  const coupon = await prisma.coupon.create({ data: parsed.data });
  return NextResponse.json({ success: true, data: { coupon: serializeDecimal(coupon) } }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const { id, ...body } = await req.json();
  if (!id) return NextResponse.json({ success: false, error: "Coupon ID required" }, { status: 400 });
  const parsed = couponSchema.partial().safeParse(body);
  if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
  const coupon = await prisma.coupon.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ success: true, data: { coupon: serializeDecimal(coupon) } });
}

export async function DELETE(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  await prisma.coupon.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
