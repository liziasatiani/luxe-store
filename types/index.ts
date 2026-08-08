import type { Product, ProductImage, Brand, Category, ProductSpec, ProductVariant, Review, User } from "@prisma/client";

export type ProductWithRelations = Product & {
  images: ProductImage[];
  brand: Brand | null;
  category: Category;
  specifications: ProductSpec[];
  variants: ProductVariant[];
  reviews?: ReviewWithUser[];
};

// All numeric fields are plain numbers — Decimal is always serialized before reaching the client.
export interface ProductCard {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice: number | null;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  isOnSale: boolean;
  stockStatus: Product["stockStatus"];
  stock: number;
  ratingAvg: number;
  ratingCount: number;
  brandId: string | null;
  images: Pick<ProductImage, "url" | "isPrimary" | "altText">[];
  brand: Pick<Brand, "name" | "slug"> | null;
  category: Pick<Category, "name" | "slug">;
}

export type ReviewWithUser = Review & {
  user: Pick<User, "id" | "name" | "image">;
};

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  product: ProductCard;
  variant?: { name: string; value: string; price?: number | null };
}

export interface CouponInfo {
  code: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING";
  value: number;
  minOrderAmount?: number | null;
  maxDiscount?: number | null;
}

export interface ProductFilters {
  search?: string;
  categorySlug?: string;
  brandSlugs?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isOnSale?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  isFeatured?: boolean;
  tags?: string[];
  sort?: SortOption;
  page?: number;
  limit?: number;
}

export type SortOption = "newest" | "oldest" | "price-asc" | "price-desc" | "rating" | "best-selling" | "discount";

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

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

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
  badge?: string;
}

export interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  link?: string | null;
  createdAt: Date;
}

export interface SearchResult {
  products: ProductCard[];
  categories: Pick<Category, "id" | "name" | "slug">[];
  brands: Pick<Brand, "id" | "name" | "slug">[];
  total: number;
}
