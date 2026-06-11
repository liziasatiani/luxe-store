import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { serializeDecimal } from "@/lib/utils";
import { rateLimit, getIP, rateLimitResponse } from "@/lib/rateLimit";
import { resolveCoupon } from "@/lib/pricing";

/**
 * Previews a coupon against a subtotal. This is advisory only — the authoritative
 * validation runs again in `/api/orders` via the same `resolveCoupon` helper.
 */
export async function POST(req: NextRequest) {
  const rl = rateLimit(`coupons:${getIP(req)}`, 20, 60 * 1000);
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

  try {
    const session = await auth();
    const userId = session?.user?.id ?? null;

    const body = await req.json().catch(() => null);
    const code = typeof body?.code === "string" ? body.code : "";
    const subtotal = Number(body?.subtotal);

    if (!code.trim()) {
      return NextResponse.json({ success: false, error: "Coupon code required" }, { status: 400 });
    }
    if (!Number.isFinite(subtotal) || subtotal < 0) {
      return NextResponse.json({ success: false, error: "Invalid subtotal" }, { status: 400 });
    }

    const { coupon, discountAmount, error } = await resolveCoupon(code, subtotal, userId);
    if (error || !coupon) {
      return NextResponse.json(
        { success: false, error: error ?? "Invalid or expired coupon" },
        { status: 400 }
      );
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
        discountAmount,
      },
    });
  } catch (err) {
    console.error("[coupons/POST]", err);
    return NextResponse.json({ success: false, error: "Failed to validate coupon" }, { status: 500 });
  }
}
