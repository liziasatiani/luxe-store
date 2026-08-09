import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const GEL_RATE = 2.77; // 1 USD = 2.77 GEL

export function formatPrice(
  amount: number | string | null | undefined,
  currency = "USD",
  locale = "en-US"
): string {
  const num = typeof amount === "string" ? parseFloat(amount) : (amount ?? 0);
  if (isNaN(num)) return new Intl.NumberFormat(locale, { style: "currency", currency, minimumFractionDigits: 2 }).format(0);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(num);
}

export function formatGEL(amount: number | string | null | undefined): string {
  const num = typeof amount === "string" ? parseFloat(amount) : (amount ?? 0);
  if (isNaN(num)) return "₾0.00";
  return "₾" + (num * GEL_RATE).toFixed(2);
}

export function formatDiscount(original: number, sale: number): number {
  if (!original || original <= sale) return 0;
  return Math.round(((original - sale) / original) * 100);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatDate(
  date: Date | string | null | undefined,
  opts: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" }
): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-US", opts).format(new Date(date));
}

export function formatRelativeTime(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const mins = Math.floor(seconds / 60);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 30) return formatDate(d);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return "just now";
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function getStockLabel(stock: number, lowAt = 5) {
  if (stock === 0) return { label: "Out of Stock", color: "text-red-500" };
  if (stock <= lowAt) return { label: `Only ${stock} left`, color: "text-yellow-500" };
  return { label: "In Stock", color: "text-green-600" };
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `LXS-${timestamp}-${random}`;
}


export function getProductImageUrl(
  images: Array<{ url: string; isPrimary?: boolean }> | undefined,
  width = 600,
  quality = 80
): string {
  if (!images || images.length === 0)
    return "/placeholder.png";
  const primary = images.find((i) => i.isPrimary);
  const url = primary?.url ?? images[0]?.url ?? "/placeholder.png";
  if (url.includes("supabase") && url.includes("/storage/")) {
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}width=${width}&quality=${quality}&format=webp`;
  }
  // Only add params not already present to avoid duplicates in stored URLs
  if (url.includes("unsplash.com")) {
    const parsed = new URL(url);
    if (!parsed.searchParams.has("w")) parsed.searchParams.set("w", String(width));
    if (!parsed.searchParams.has("q")) parsed.searchParams.set("q", String(quality));
    if (!parsed.searchParams.has("auto")) parsed.searchParams.set("auto", "format");
    if (!parsed.searchParams.has("fit")) parsed.searchParams.set("fit", "crop");
    return parsed.toString();
  }
  return url;
}



export const FREE_SHIPPING_THRESHOLD = 75;
const FLAT_SHIPPING_RATE = 9.99;

export function calcShipping(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_RATE;
}

export function calcTax(amount: number, rate = 0.085): number {
  return parseFloat((amount * rate).toFixed(2));
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


type DecimalLike = { toNumber(): number };

// Maps Prisma Decimal → number throughout a type tree; leaves Date, primitives, and other objects intact.
export type Serialized<T> =
  T extends null | undefined ? T :
  T extends Date ? T :
  T extends DecimalLike ? number :
  T extends readonly (infer U)[] ? Serialized<U>[] :
  T extends object ? { [K in keyof T]: Serialized<T[K]> } :
  T;

// Dates are returned untouched — spreading them through Object.entries collapses them to {}.
export function serializeDecimal<T>(obj: T): Serialized<T> {
  if (obj === null || obj === undefined) return obj as Serialized<T>;
  if (typeof obj !== "object") return obj as Serialized<T>;
  if (Array.isArray(obj)) return obj.map(serializeDecimal) as Serialized<T>;
  if (obj instanceof Date) return obj as Serialized<T>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (typeof (obj as any).toNumber === "function") return (obj as any).toNumber() as Serialized<T>;
  const proto = Object.getPrototypeOf(obj);
  if (proto !== Object.prototype && proto !== null) return obj as Serialized<T>;
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, serializeDecimal(v)])
  ) as Serialized<T>;
}

/** Parses a positive integer query param, falling back when absent or invalid. */
export function parseIntParam(
  raw: string | null,
  fallback: number,
  { min = 1, max = Number.MAX_SAFE_INTEGER }: { min?: number; max?: number } = {}
): number {
  const n = Number.parseInt(raw ?? "", 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

/**
 * Serialises a value for embedding in a `<script>` tag via
 * `dangerouslySetInnerHTML`.
 *
 * `JSON.stringify` does not escape `<`, so a product name containing
 * `</script><script>…` breaks out of a JSON-LD block and executes. Product
 * names are writable through the admin CSV import, which makes this a stored
 * XSS path rather than a theoretical one. U+2028/U+2029 are also escaped: they
 * are valid in JSON but are line terminators in JavaScript source.
 */
export function jsonLdSafe(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

/** Canonical form used for storing and looking up email addresses. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
