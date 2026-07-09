import type { Coupon } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { calcShipping, calcTax } from "@/lib/utils";

export interface CouponResolution {
  coupon: Coupon | null;
  discountAmount: number;
  /** Set when a code was supplied but rejected. Null when no code was given. */
  error: string | null;
}

/**
 * Single source of truth for coupon eligibility and discount maths.
 *
 * Previously the `/api/coupons` preview endpoint enforced the full rule set
 * while order creation re-implemented a weaker subset, so a client could bypass
 * `minOrderAmount`, `usageLimit`, `startsAt` and `perUserLimit` simply by
 * posting the code straight to `/api/orders`.
 */
export async function resolveCoupon(
  code: string | null | undefined,
  subtotal: number,
  userId: string | null
): Promise<CouponResolution> {
  const none: CouponResolution = { coupon: null, discountAmount: 0, error: null };
  if (!code?.trim()) return none;

  const coupon = await prisma.coupon.findUnique({
    where: { code: code.trim().toUpperCase() },
  });

  const reject = (error: string): CouponResolution => ({
    coupon: null,
    discountAmount: 0,
    error,
  });

  if (!coupon || !coupon.isActive) return reject("Invalid or expired coupon");

  const now = new Date();
  if (coupon.startsAt && coupon.startsAt > now) return reject("Coupon not yet active");
  if (coupon.expiresAt && coupon.expiresAt < now) return reject("Coupon has expired");
  if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
    return reject("Coupon usage limit reached");
  }
  if (coupon.minOrderAmount && subtotal < Number(coupon.minOrderAmount)) {
    return reject(`Minimum order of ₾${Number(coupon.minOrderAmount).toFixed(2)} required`);
  }

  // Per-user limits are only enforceable for identified users. Guests are
  // bounded by the global usageLimit above.
  if (userId) {
    const used = await prisma.couponUsage.count({
      where: { couponId: coupon.id, userId },
    });
    if (used >= coupon.perUserLimit) return reject("You've already used this coupon");
  }

  return { coupon, discountAmount: discountFor(coupon, subtotal), error: null };
}

/** Discount in currency units for a validated coupon against a subtotal. */
export function discountFor(coupon: Coupon, subtotal: number): number {
  let discount = 0;
  if (coupon.type === "PERCENTAGE") {
    discount = (subtotal * Number(coupon.value)) / 100;
    if (coupon.maxDiscount) discount = Math.min(discount, Number(coupon.maxDiscount));
  } else if (coupon.type === "FIXED_AMOUNT") {
    discount = Number(coupon.value);
  }
  return round2(Math.min(Math.max(discount, 0), subtotal));
}

export interface OrderTotals {
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  taxAmount: number;
  total: number;
}

/**
 * Derives the authoritative order totals. Callers must pass a subtotal computed
 * from database prices — never from client-supplied unit prices.
 */
export function calcOrderTotals(
  subtotal: number,
  coupon: Coupon | null,
  discountAmount: number
): OrderTotals {
  const sub = round2(subtotal);
  const discount = round2(Math.min(discountAmount, sub));
  const taxable = sub - discount;
  const shippingAmount =
    coupon?.type === "FREE_SHIPPING" ? 0 : round2(calcShipping(taxable));
  const taxAmount = round2(calcTax(taxable + shippingAmount));
  return {
    subtotal: sub,
    discountAmount: discount,
    shippingAmount,
    taxAmount,
    total: round2(taxable + shippingAmount + taxAmount),
  };
}

/** Currency values must not carry floating-point dust into a Decimal column. */
export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
