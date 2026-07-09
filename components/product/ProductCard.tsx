"use client";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { RatingStars } from "@/components/ui";
import { useCartStore, useWishlistStore } from "@/store";
import { formatDiscount, getProductImageUrl, cn } from "@/lib/utils";
import { useCurrency } from "@/hooks/useCurrency";
import toast from "react-hot-toast";
import type { ProductCard as ProductCardType } from "@/types";
import { QuickView } from "./QuickView";

interface ProductCardProps {
  product: ProductCardType;
  index?: number;
  priority?: boolean;
  variant?: "default" | "compact" | "horizontal";
  darkBg?: boolean;
}

export function ProductCard({ product, index = 0, priority = false, variant = "default", darkBg = false }: ProductCardProps) {
  const t = useTranslations("product");
  const { addItem } = useCartStore();
  const { toggle, has } = useWishlistStore();
  const [quickViewSlug, setQuickViewSlug] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const isWishlisted = has(product.id);
  const imageUrl = getProductImageUrl(product.images);
  const { format } = useCurrency();
  const price = Number(product.price);
  const comparePrice = product.comparePrice ? Number(product.comparePrice) : null;
  const discount = comparePrice ? formatDiscount(comparePrice, price) : 0;

  const textMuted = darkBg ? "text-white/40" : "text-black/40 dark:text-white/40";
  const textMain  = darkBg ? "text-white"    : "text-black dark:text-white";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
    toast.success(t("addToCart"), { icon: "🛍️", style: { borderRadius: "0" } });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toggle(product.id);
    toast.success(isWishlisted ? t("wishlisted") : t("addToWishlist"), {
      icon: isWishlisted ? "💔" : "❤️", style: { borderRadius: "0" },
    });
  };

  if (variant === "horizontal") {
    return (
      <Link href={`/products/${product.slug}`} className="group flex gap-4 p-4 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
        <div className="relative w-20 h-20 shrink-0 bg-black/5 dark:bg-white/5 overflow-hidden">
          <Image src={imageUrl} alt={product.name} fill className="object-cover" sizes="80px" />
        </div>
        <div className="flex-1 min-w-0 py-1">
          <p className={cn("text-[10px] tracking-[0.1em] uppercase mb-1", textMuted)}>{product.brand?.name}</p>
          <p className={cn("text-sm line-clamp-2 leading-snug", textMain)}>{product.name}</p>
          <p className={cn("text-sm font-medium mt-2", textMain)}>{format(price)}</p>
        </div>
      </Link>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: index * 0.04 }}
        className={cn("group", darkBg ? "bg-black" : "bg-surface-50 dark:bg-black border border-surface-200 dark:border-white/8")}
      >
        <Link href={`/products/${product.slug}`} className="block">
          {/* Image */}
          <div className="relative overflow-hidden aspect-[3/4] bg-stone-100 dark:bg-zinc-900">
            <Image
              src={imageUrl} alt={product.name} fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={priority}
              className="object-cover transition-transform duration-700 group-hover:scale-105 img-plate"
            />
            {/* Depth gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1">
              {product.isNewArrival && (
                <span className="bg-black text-white text-[9px] tracking-[0.14em] uppercase px-2 py-0.5">{t("newArrival")}</span>
              )}
              {discount > 0 && (
                <span className="bg-red-600 text-white text-[9px] tracking-[0.14em] uppercase px-2 py-0.5">-{discount}%</span>
              )}
              {product.isBestSeller && (
                <span className="bg-white text-black text-[9px] tracking-[0.14em] uppercase px-2 py-0.5">{t("bestSeller")}</span>
              )}
              {product.isBestSeller && (
                <span className="bg-black/70 text-white text-[9px] tracking-[0.1em] uppercase px-2 py-0.5 flex items-center gap-1">
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 4l2 2 4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Authentic
                </span>
              )}
            </div>

            {/* Action icons */}
            <div className="absolute top-3 right-3 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={handleWishlist}
                aria-label={isWishlisted ? t("wishlisted") : t("addToWishlist")}
                className={cn("w-11 h-11 flex items-center justify-center transition-colors",
                  isWishlisted
                    ? "bg-red-600 text-white"
                    : "bg-white dark:bg-black text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                )}>
                <Heart size={14} fill={isWishlisted ? "currentColor" : "none"} />
              </button>
              <button
                onClick={handleAddToCart}
                disabled={product.stockStatus === "OUT_OF_STOCK"}
                aria-label={t("addToCart")}
                className="w-11 h-11 bg-white dark:bg-black flex items-center justify-center text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors disabled:opacity-40">
                <ShoppingBag size={14} />
              </button>
            </div>

            {/* Out of stock overlay */}
            {product.stockStatus === "OUT_OF_STOCK" && (
              <div className="absolute inset-0 bg-white/70 dark:bg-black/70 flex items-center justify-center">
                <span className="text-[10px] tracking-[0.12em] uppercase bg-white dark:bg-black text-black dark:text-white px-3 py-1.5">{t("outOfStock")}</span>
              </div>
            )}

            {/* Quick view bar */}
            <button
              onClick={(e) => { e.preventDefault(); setQuickViewSlug(product.slug); }}
              aria-label={t("quickView")}
              className="absolute bottom-0 left-0 right-0 h-11 opacity-0 group-hover:opacity-100 translate-y-full group-hover:translate-y-0 transition-all duration-300 flex items-center justify-center gap-1.5 bg-black/90 text-white text-[10px] tracking-[0.12em] uppercase"
            >
              <Eye size={12} /> {t("quickView")}
            </button>
          </div>

          {/* Info */}
          <div className="px-4 pt-3 pb-5">
            {product.brand && (
              <p className={cn("text-[10px] tracking-[0.14em] uppercase mb-1.5", textMuted)}>{product.brand.name}</p>
            )}
            <h3 className={cn("font-serif text-sm leading-snug line-clamp-2 mb-2", textMain)}>
              {product.name}
            </h3>
            <RatingStars rating={Number(product.ratingAvg)} count={product.ratingCount} size={11} />
            <div className="flex items-center gap-2 mt-2.5">
              <span className={cn("text-sm font-medium", textMain)}>{format(price)}</span>
              {comparePrice && comparePrice > price && (
                <span className={cn("text-xs line-through", textMuted)}>{format(comparePrice)}</span>
              )}
            </div>
            {product.stockStatus === "LOW_STOCK" && (
              <p className="text-[10px] tracking-[0.08em] uppercase text-red-500 mt-1">{t("lowStock")}</p>
            )}
          </div>
        </Link>
      </motion.div>

      {mounted && <QuickView slug={quickViewSlug} onClose={() => setQuickViewSlug(null)} />}
    </>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse bg-white dark:bg-black">
      <div className="aspect-[3/4] bg-black/5 dark:bg-white/5" />
      <div className="px-4 py-4 space-y-2">
        <div className="h-2.5 w-16 bg-black/8 dark:bg-white/8" />
        <div className="h-3.5 w-full bg-black/8 dark:bg-white/8" />
        <div className="h-3.5 w-2/3 bg-black/8 dark:bg-white/8" />
        <div className="h-4 w-20 bg-black/8 dark:bg-white/8 mt-1" />
      </div>
    </div>
  );
}
