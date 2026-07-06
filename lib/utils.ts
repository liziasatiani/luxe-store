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

export function truncate(str: string, len = 100): string {
  if (str.length <= len) return str;
  return str.slice(0, len).trimEnd() + "…";
}

export function getProductImageUrl(
  images: Array<{ url: string; isPrimary?: boolean }> | undefined
): string {
  if (!images || images.length === 0)
    return "https://via.placeholder.com/600x600?text=No+Image";
  const primary = images.find((i) => i.isPrimary);
  return primary?.url ?? images[0]?.url ?? "https://via.placeholder.com/600x600?text=No+Image";
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay = 300
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function chunk<T>(arr: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );
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

export function randomId(len = 8): string {
  return Math.random().toString(36).substring(2, 2 + len);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function serializeDecimal(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "object" && "toNumber" in obj) return obj.toNumber();
  if (Array.isArray(obj)) return obj.map(serializeDecimal);
  if (typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, serializeDecimal(v)])
    );
  }
  return obj;
}
