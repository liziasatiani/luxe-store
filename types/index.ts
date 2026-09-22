import type { Product, ProductImage, Brand, Category } from "@prisma/client";

// All numeric fields are plain numbers — Decimal is always serialized before reaching the client.
export interface ProductCard {
  id: string;
  name: string;
  slug: string;
  description: string | null;
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
