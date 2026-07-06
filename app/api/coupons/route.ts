import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeDecimal } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { code, subtotal } = await req.json() as { code: string; subtotal: number };
    if (!code) return NextResponse.json({ success: false, error: "Coupon code required" }, { status: 400 });

    const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ success: false, error: "Invalid or expired coupon" }, { status: 400 });
    }

    const now = new Date();
    if (coupon.startsAt && coupon.startsAt > now) {
      return NextResponse.json({ success: false, error: "Coupon not yet active" }, { status: 400 });
    }
    if (coupon.expiresAt && coupon.expiresAt < now) {
      return NextResponse.json({ success: false, error: "Coupon has expired" }, { status: 400 });
    }
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json({ success: false, error: "Coupon usage limit reached" }, { status: 400 });
    }
    if (coupon.minOrderAmount && subtotal < Number(coupon.minOrderAmount)) {
      return NextResponse.json({
        success: false,
        error: `Minimum order of $${coupon.minOrderAmount} required`,
      }, { status: 400 });
    }

    // Check per-user usage
    const userUsage = await prisma.couponUsage.count({
      where: { couponId: coupon.id, userId: session.user.id },
    });
    if (userUsage >= coupon.perUserLimit) {
      return NextResponse.json({ success: false, error: "You've already used this coupon" }, { status: 400 });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.type === "PERCENTAGE") {
      discountAmount = (subtotal * Number(coupon.value)) / 100;
      if (coupon.maxDiscount) discountAmount = Math.min(discountAmount, Number(coupon.maxDiscount));
    } else if (coupon.type === "FIXED_AMOUNT") {
      discountAmount = Math.min(Number(coupon.value), subtotal);
    }

    return NextResponse.json({
      success: true,
      data: {
        coupon: serializeDecimal({
          code: coupon.code,
          type: coupon.type,
          value: coupon.value,
          minOrderAmount: coupon.minOrderAmount,
          maxDiscount: coupon.maxDiscount,
          description: coupon.description,
        }),
        discountAmount: parseFloat(discountAmount.toFixed(2)),
      },
    });
  } catch (err) {
    console.error("[coupons/POST]", err);
    return NextResponse.json({ success: false, error: "Failed to validate coupon" }, { status: 500 });
  }
}
