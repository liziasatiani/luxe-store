import { describe, it, expect } from "vitest";
import { discountFor, calcOrderTotals, round2 } from "../../lib/pricing";
import type { Coupon } from "@prisma/client";

// Build a minimal Coupon fixture to avoid depending on the full Prisma type.
function makeCoupon(overrides: Partial<{
  type: string;
  value: number;
  maxDiscount: number | null;
}>): Coupon {
  return {
    id: "coupon-1",
    code: "TEST",
    type: (overrides.type ?? "PERCENTAGE") as Coupon["type"],
    value: overrides.value as unknown as Coupon["value"] ?? (20 as unknown as Coupon["value"]),
    maxDiscount: overrides.maxDiscount as unknown as Coupon["maxDiscount"] ?? null,
    minOrderAmount: null,
    usageLimit: null,
    usageCount: 0,
    perUserLimit: 1,
    isActive: true,
    startsAt: null,
    expiresAt: null,
    description: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as Coupon;
}

describe("round2", () => {
  it("rounds to two decimal places", () => {
    expect(round2(1.005)).toBe(1.01);
    expect(round2(2.344)).toBe(2.34);
    expect(round2(2.345)).toBe(2.35);
  });

  it("handles zero", () => {
    expect(round2(0)).toBe(0);
  });
});

describe("discountFor — PERCENTAGE", () => {
  it("applies the percentage correctly", () => {
    const coupon = makeCoupon({ type: "PERCENTAGE", value: 10 });
    expect(discountFor(coupon, 100)).toBe(10);
  });

  it("caps at maxDiscount when set", () => {
    const coupon = makeCoupon({ type: "PERCENTAGE", value: 20, maxDiscount: 5 });
    expect(discountFor(coupon, 100)).toBe(5);
  });

  it("never exceeds the subtotal", () => {
    const coupon = makeCoupon({ type: "PERCENTAGE", value: 150 });
    expect(discountFor(coupon, 50)).toBe(50);
  });

  it("never goes negative", () => {
    const coupon = makeCoupon({ type: "PERCENTAGE", value: -10 });
    expect(discountFor(coupon, 100)).toBe(0);
  });
});

describe("discountFor — FIXED_AMOUNT", () => {
  it("deducts the fixed amount", () => {
    const coupon = makeCoupon({ type: "FIXED_AMOUNT", value: 15 });
    expect(discountFor(coupon, 100)).toBe(15);
  });

  it("clamps to the subtotal when the coupon value is larger", () => {
    const coupon = makeCoupon({ type: "FIXED_AMOUNT", value: 200 });
    expect(discountFor(coupon, 50)).toBe(50);
  });
});

describe("discountFor — FREE_SHIPPING", () => {
  it("returns 0 (shipping is handled separately)", () => {
    const coupon = makeCoupon({ type: "FREE_SHIPPING", value: 0 });
    expect(discountFor(coupon, 100)).toBe(0);
  });
});

describe("calcOrderTotals", () => {
  it("computes totals correctly with no coupon", () => {
    const totals = calcOrderTotals(100, null, 0);
    // shipping is free above $75
    expect(totals.subtotal).toBe(100);
    expect(totals.discountAmount).toBe(0);
    expect(totals.shippingAmount).toBe(0);
    expect(totals.taxAmount).toBeCloseTo(8.5, 2);
    expect(totals.total).toBeCloseTo(108.5, 2);
  });

  it("applies discount before computing tax and shipping", () => {
    const coupon = makeCoupon({ type: "PERCENTAGE", value: 50 });
    const totals = calcOrderTotals(100, coupon, 50);
    expect(totals.discountAmount).toBe(50);
    // taxable base is 50; below free-shipping threshold so shipping = 9.99
    expect(totals.shippingAmount).toBe(9.99);
    expect(totals.taxAmount).toBeCloseTo((50 + 9.99) * 0.085, 2);
  });

  it("sets shipping to 0 for FREE_SHIPPING coupon", () => {
    const coupon = makeCoupon({ type: "FREE_SHIPPING", value: 0 });
    const totals = calcOrderTotals(30, coupon, 0);
    expect(totals.shippingAmount).toBe(0);
  });

  it("clamps discount that exceeds the subtotal", () => {
    // Caller supplies a discount larger than subtotal (shouldn't happen, but defensiveness)
    const totals = calcOrderTotals(20, null, 50);
    expect(totals.discountAmount).toBe(20);
    expect(totals.total).toBeGreaterThanOrEqual(0);
  });
});
