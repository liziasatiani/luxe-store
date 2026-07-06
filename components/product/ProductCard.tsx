"use client";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { Badge, RatingStars } from "@/components/ui";
import { useCartStore, useWishlistStore } from "@/store";
import { formatPrice, formatDiscount, getProductImageUrl, cn } from "@/lib/utils";
import toast from "react-hot-toast";
import type { ProductCard as ProductCardType } from "@/types";

interface ProductCardProps {
  product: ProductCardType;
  index?: number;
  variant?: "default" | "compact" | "horizontal";
}

export function ProductCard({ product, index = 0, variant = "default" }: ProductCardProps) {
  const { addItem } = useCartStore();
  const { toggle, has } = useWishlistStore();
  const isWishlisted = has(product.id);
  const imageUrl = getProductImageUrl(product.images);
  const price = Number(product.price);
  const comparePrice = product.comparePrice ? Number(product.comparePrice) : null;
  const discount = comparePrice ? formatDiscount(comparePrice, price) : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
    toast.success("Added to cart", {
      icon: "🛍️",
      style: { borderRadius: "12px" },
    });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toggle(product.id);
    toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist", {
      icon: isWishlisted ? "💔" : "❤️",
      style: { borderRadius: "12px" },
    });
  };

  if (variant === "horizontal") {
    return (
      <Link href={`/products/${product.slug}`} className="group flex gap-4 p-4 rounded-2xl hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
        <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-surface-100 dark:bg-surface-800">
          <Image src={imageUrl} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="96px" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-surface-400 mb-0.5">{product.brand?.name}</p>
          <p className="font-medium text-surface-900 dark:text-white line-clamp-2 text-sm">{product.name}</p>
          <RatingStars rating={Number(product.ratingAvg)} count={product.ratingCount} size={12} />
          <div className="flex items-center gap-2 mt-1">
            <span className="font-semibold text-surface-900 dark:text-white">{formatPrice(price)}</span>
            {comparePrice && <span className="text-xs text-surface-400 line-through">{formatPrice(comparePrice)}</span>}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Link href={`/products/${product.slug}`} className="group block">
        <div className="relative overflow-hidden rounded-2xl bg-surface-50 dark:bg-surface-800 aspect-[3/4] mb-4">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />

          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.isNewArrival && <Badge variant="gold">New</Badge>}
            {discount > 0 && <Badge variant="error">-{discount}%</Badge>}
            {product.isBestSeller && <Badge variant="default">Best Seller</Badge>}
          </div>

          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
            <button
              onClick={handleWishlist}
              className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm transition-colors",
                isWishlisted
                  ? "bg-red-500 text-white"
                  : "bg-white/90 dark:bg-surface-900/90 text-surface-700 dark:text-surface-300 hover:bg-red-50 hover:text-red-500"
              )}
            >
              <Heart size={15} fill={isWishlisted ? "currentColor" : "none"} />
            </button>
            <button
              onClick={handleAddToCart}
              disabled={product.stockStatus === "OUT_OF_STOCK"}
              className="w-9 h-9 rounded-full bg-white/90 dark:bg-surface-900/90 flex items-center justify-center shadow-lg backdrop-blur-sm text-surface-700 dark:text-surface-300 hover:bg-surface-900 hover:text-white dark:hover:bg-white dark:hover:text-surface-900 transition-colors disabled:opacity-50"
            >
              <ShoppingBag size={15} />
            </button>
          </div>

          {product.stockStatus === "OUT_OF_STOCK" && (
            <div className="absolute inset-0 bg-white/60 dark:bg-surface-900/60 backdrop-blur-[1px] flex items-center justify-center">
              <span className="text-xs font-semibold text-surface-600 dark:text-surface-400 bg-white dark:bg-surface-800 px-3 py-1.5 rounded-full">
                Out of Stock
              </span>
            </div>
          )}

          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            <div className="flex items-center justify-center gap-1 bg-white/90 dark:bg-surface-900/90 backdrop-blur-sm rounded-xl py-2 text-xs font-medium text-surface-700 dark:text-surface-300">
              <Eye size={13} />
              Quick View
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          {product.brand && (
            <p className="text-xs text-surface-400 uppercase tracking-wider">{product.brand.name}</p>
          )}
          <h3 className="font-medium text-surface-900 dark:text-white line-clamp-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors text-sm leading-snug">
            {product.name}
          </h3>
          <RatingStars rating={Number(product.ratingAvg)} count={product.ratingCount} />
          <div className="flex items-center gap-2 pt-0.5">
            <span className="font-semibold text-surface-900 dark:text-white">
              {formatPrice(price)}
            </span>
            {comparePrice && comparePrice > price && (
              <span className="text-sm text-surface-400 line-through">
                {formatPrice(comparePrice)}
              </span>
            )}
          </div>
          {product.stockStatus === "LOW_STOCK" && (
            <p className="text-xs text-yellow-600 font-medium">Only a few left!</p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] rounded-2xl bg-surface-100 dark:bg-surface-800 mb-4" />
      <div className="space-y-2">
        <div className="h-3 w-16 bg-surface-100 dark:bg-surface-800 rounded-full" />
        <div className="h-4 w-full bg-surface-100 dark:bg-surface-800 rounded-full" />
        <div className="h-4 w-3/4 bg-surface-100 dark:bg-surface-800 rounded-full" />
        <div className="h-5 w-20 bg-surface-100 dark:bg-surface-800 rounded-full" />
      </div>
    </div>
  );
}
