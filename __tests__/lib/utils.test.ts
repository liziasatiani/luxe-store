import { describe, it, expect } from "vitest";
import {
  formatPrice,
  formatDiscount,
  slugify,
  serializeDecimal,
  parseIntParam,
  calcShipping,
  calcTax,
  isValidEmail,
  normalizeEmail,
  jsonLdSafe,
  generateOrderNumber,
} from "../../lib/utils";

describe("formatPrice", () => {
  it("formats a plain number", () => {
    expect(formatPrice(9.99)).toBe("$9.99");
  });

  it("formats a string number", () => {
    expect(formatPrice("49.5")).toBe("$49.50");
  });

  it("returns $0.00 for null", () => {
    expect(formatPrice(null)).toBe("$0.00");
  });

  it("returns $0.00 for undefined", () => {
    expect(formatPrice(undefined)).toBe("$0.00");
  });

  it("returns $0.00 for NaN string", () => {
    expect(formatPrice("not-a-number")).toBe("$0.00");
  });

  it("supports other currencies", () => {
    expect(formatPrice(10, "GBP", "en-GB")).toMatch("10.00");
  });
});

describe("formatDiscount", () => {
  it("returns 0 if original equals sale price", () => {
    expect(formatDiscount(100, 100)).toBe(0);
  });

  it("returns 0 if sale is higher", () => {
    expect(formatDiscount(80, 100)).toBe(0);
  });

  it("calculates percentage correctly", () => {
    expect(formatDiscount(100, 75)).toBe(25);
  });

  it("rounds to nearest integer", () => {
    expect(formatDiscount(3, 2)).toBe(33);
  });
});

describe("slugify", () => {
  it("lowercases and replaces spaces with hyphens", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("strips non-word characters", () => {
    expect(slugify("Beauty & Skincare!")).toBe("beauty-skincare");
  });

  it("collapses multiple hyphens", () => {
    expect(slugify("a  --  b")).toBe("a-b");
  });
});

describe("serializeDecimal", () => {
  it("returns primitives unchanged", () => {
    expect(serializeDecimal(42)).toBe(42);
    expect(serializeDecimal("hello")).toBe("hello");
    expect(serializeDecimal(null)).toBeNull();
  });

  it("converts Decimal-like objects via toNumber()", () => {
    const decimal = { toNumber: () => 12.5 };
    expect(serializeDecimal(decimal)).toBe(12.5);
  });

  it("preserves Date instances", () => {
    const d = new Date("2024-01-01");
    expect(serializeDecimal(d)).toBeInstanceOf(Date);
    expect(serializeDecimal(d).getTime()).toBe(d.getTime());
  });

  it("recursively converts nested decimals", () => {
    const decimal = { toNumber: () => 9.99 };
    const result = serializeDecimal({ price: decimal, name: "Widget" });
    expect(result).toEqual({ price: 9.99, name: "Widget" });
  });

  it("handles arrays", () => {
    const decimal = { toNumber: () => 1.5 };
    expect(serializeDecimal([decimal, 2])).toEqual([1.5, 2]);
  });

  it("leaves non-plain class instances intact", () => {
    class Foo { x = 1; }
    const foo = new Foo();
    expect(serializeDecimal(foo)).toBe(foo);
  });
});

describe("parseIntParam", () => {
  it("parses a valid integer string", () => {
    expect(parseIntParam("5", 1)).toBe(5);
  });

  it("returns fallback for null", () => {
    expect(parseIntParam(null, 10)).toBe(10);
  });

  it("returns fallback for non-numeric string", () => {
    expect(parseIntParam("abc", 3)).toBe(3);
  });

  it("clamps to min", () => {
    expect(parseIntParam("-5", 1, { min: 1 })).toBe(1);
  });

  it("clamps to max", () => {
    expect(parseIntParam("999", 1, { max: 50 })).toBe(50);
  });
});

describe("calcShipping", () => {
  it("is free above the threshold", () => {
    expect(calcShipping(75)).toBe(0);
    expect(calcShipping(200)).toBe(0);
  });

  it("charges a flat rate below the threshold", () => {
    expect(calcShipping(74.99)).toBe(9.99);
    expect(calcShipping(0)).toBe(9.99);
  });
});

describe("calcTax", () => {
  it("applies the default 8.5% rate", () => {
    expect(calcTax(100)).toBeCloseTo(8.5, 2);
  });

  it("accepts a custom rate", () => {
    expect(calcTax(200, 0.1)).toBeCloseTo(20, 2);
  });
});

describe("isValidEmail", () => {
  it("accepts valid addresses", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
  });

  it("rejects addresses without @", () => {
    expect(isValidEmail("notanemail")).toBe(false);
  });

  it("rejects addresses with spaces", () => {
    expect(isValidEmail("user @example.com")).toBe(false);
  });
});

describe("normalizeEmail", () => {
  it("lowercases and trims", () => {
    expect(normalizeEmail("  User@EXAMPLE.COM  ")).toBe("user@example.com");
  });
});

describe("jsonLdSafe", () => {
  it("escapes < and > to prevent script injection", () => {
    const out = jsonLdSafe({ name: "</script><script>alert(1)</script>" });
    expect(out).not.toContain("</script>");
    expect(out).toContain("\\u003c");
    expect(out).toContain("\\u003e");
  });

  it("escapes &", () => {
    expect(jsonLdSafe({ v: "a&b" })).toContain("\\u0026");
  });
});

describe("generateOrderNumber", () => {
  it("starts with LXS-", () => {
    expect(generateOrderNumber()).toMatch(/^LXS-/);
  });

  it("generates unique values", () => {
    const a = generateOrderNumber();
    const b = generateOrderNumber();
    expect(a).not.toBe(b);
  });
});
