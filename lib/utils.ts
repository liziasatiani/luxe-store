import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(
  amount: number | string | null | undefined,
  currency = "USD",
  locale = "en-US"
): string {
  const num = typeof amount === "string" ? parseFloat(amount) : (amount ?? 0);
  if (isNaN(num)) return "$0.00";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(num);
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
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 30) return formatDate(d);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
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
  images: Array<{ url: string; isPrimary?: boolean }> | undefined
): string {
  if (!images || images.length === 0)
    return "/placeholder.jpg";
  const primary = images.find((i) => i.isPrimary);
  return primary?.url ?? images[0]?.url ?? "/placeholder.jpg";
}



export function calcShipping(subtotal: number): number {
  const FREE_THRESHOLD = 75;
  const FLAT_RATE = 9.99;
  return subtotal >= FREE_THRESHOLD ? 0 : FLAT_RATE;
}

export function calcTax(amount: number, rate = 0.085): number {
  return parseFloat((amount * rate).toFixed(2));
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


/**
 * Recursively converts Prisma `Decimal` values to plain numbers so results can
 * cross the server/client boundary.
 *
 * Anything that is not a plain object or array is returned untouched. This
 * matters for `Date`: it is an object with no own enumerable properties, so
 * naively spreading it through `Object.entries` collapses it to `{}` and
 * destroys every timestamp in the payload.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function serializeDecimal(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(serializeDecimal);
  if (obj instanceof Date) return obj;
  if (typeof obj.toNumber === "function") return obj.toNumber();
  // Only walk plain objects; leave class instances (Buffer, Map, …) intact.
  const proto = Object.getPrototypeOf(obj);
  if (proto !== Object.prototype && proto !== null) return obj;
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, serializeDecimal(v)])
  );
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
