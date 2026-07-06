import type { Product, ProductImage, Brand, Category, ProductSpec, ProductVariant, Review, User } from "@prisma/client";

// ─── Extended Product types ───────────────────────────────────
export type ProductWithRelations = Product & {
  images: ProductImage[];
  brand: Brand | null;
  category: Category;
  specifications: ProductSpec[];
  variants: ProductVariant[];
  reviews?: ReviewWithUser[];
};

export type ProductCard = Pick<
  Product,
  | "id" | "name" | "slug" | "price" | "comparePrice"
  | "isFeatured" | "isBestSeller" | "isNewArrival" | "isOnSale"
  | "stockStatus" | "stock" | "ratingAvg" | "ratingCount" | "brandId"
> & {
  images: Pick<ProductImage, "url" | "isPrimary" | "altText">[];
  brand: Pick<Brand, "name" | "slug"> | null;
  category: Pick<Category, "name" | "slug">;
};

export type ReviewWithUser = Review & {
  user: Pick<User, "id" | "name" | "image">;
};

// ─── Cart ────────────────────────────────────────────────────
export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  product: ProductCard;
  variant?: { name: string; value: string; price?: number | null };
}

export interface CartState {
  items: CartItem[];
  coupon: CouponInfo | null;
  isOpen: boolean;
}

export interface CouponInfo {
  code: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING";
  value: number;
  minOrderAmount?: number | null;
  maxDiscount?: number | null;
}

// ─── Order summary ────────────────────────────────────────────
export interface OrderSummary {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
}

// ─── Filters ─────────────────────────────────────────────────
export interface ProductFilters {
  search?: string;
  categorySlug?: string;
  brandSlugs?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isOnSale?: boolean;
  isFeatured?: boolean;
  tags?: string[];
  sort?: SortOption;
  page?: number;
  limit?: number;
}

export type SortOption =
  | "newest"
  | "oldest"
  | "price-asc"
  | "price-desc"
  | "rating"
  | "best-selling"
  | "discount";

// ─── Pagination ───────────────────────────────────────────────
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ─── API responses ────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ─── Admin analytics ─────────────────────────────────────────
export interface AnalyticsSummary {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueChange: number;
  ordersChange: number;
  customersChange: number;
  avgOrderValue: number;
}

export interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
}

// ─── Navigation ───────────────────────────────────────────────
export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
  badge?: string;
}

// ─── Session user ─────────────────────────────────────────────
export interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}

// ─── Notification ────────────────────────────────────────────
export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  link?: string | null;
  createdAt: Date;
}

// ─── Search ──────────────────────────────────────────────────
export interface SearchResult {
  products: ProductCard[];
  categories: Pick<Category, "id" | "name" | "slug">[];
  brands: Pick<Brand, "id" | "name" | "slug">[];
  total: number;
}
