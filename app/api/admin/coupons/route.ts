import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeDecimal } from "@/lib/utils";
import { couponSchema } from "@/lib/validations";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  try {
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ success: true, data: { coupons: serializeDecimal(coupons) } });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch coupons" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const parsed = couponSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }
    const coupon = await prisma.coupon.create({ data: parsed.data });
    return NextResponse.json({ success: true, data: { coupon: serializeDecimal(coupon) } }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to create coupon" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  try {
    const { id, ...body } = await req.json();
    if (!id) return NextResponse.json({ success: false, error: "Coupon ID required" }, { status: 400 });
    const parsed = couponSchema.partial().safeParse(body);
    if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    const coupon = await prisma.coupon.update({ where: { id }, data: parsed.data });
    return NextResponse.json({ success: true, data: { coupon: serializeDecimal(coupon) } });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to update coupon" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ success: false, error: "Coupon ID required" }, { status: 400 });
    await prisma.couponUsage.deleteMany({ where: { couponId: id } });
    await prisma.order.updateMany({ where: { couponId: id }, data: { couponId: null } });
    await prisma.coupon.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/coupons DELETE]", err);
    return NextResponse.json({ success: false, error: "Failed to delete coupon" }, { status: 500 });
  }
}
