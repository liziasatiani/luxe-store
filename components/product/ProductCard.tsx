"use client";
import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useCartStore, useWishlistStore } from "@/store";
import { formatDiscount, getProductImageUrl, cn } from "@/lib/utils";
import { useCurrency } from "@/hooks/useCurrency";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import type { ProductCard as ProductCardType } from "@/types";
import { QuickView } from "./QuickView";
import { NotifyMe } from "./NotifyMe";

const TECH_CATS = new Set(["headphones", "cameras", "tablets", "gaming", "wearables", "smart-home", "audio", "accessories"]);
const BEAUTY_CATS = new Set(["skincare", "makeup", "hair-care", "body-care", "perfume", "beauty-tools"]);

interface ProductCardProps {
  product: ProductCardType;
  index?: number;
  priority?: boolean;
  variant?: "default" | "compact" | "horizontal";
  darkBg?: boolean;
  className?: string;
}

export function ProductCard({ product, index = 0, priority = false, variant = "default", className }: ProductCardProps) {
  const tc = useTranslations("common");
  const tp = useTranslations("product");
  const tn = useTranslations("nav");
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

  const catSlug = product.category?.slug ?? "";
  const isTech = TECH_CATS.has(catSlug);
  const isBeauty = BEAUTY_CATS.has(catSlug);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
    toast.success(tc("addedToCart"), { icon: "🛍️", style: { borderRadius: "0" } });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toggle(product.id);
    toast.success(isWishlisted ? tc("removedFromWishlist") : tc("savedToWishlist"), {
      icon: isWishlisted ? "💔" : "❤️", style: { borderRadius: "0" },
    });
  };

  if (variant === "horizontal") {
    return (
      <Link href={`/products/${product.slug}`} className="group flex gap-4 p-4 hover:bg-white/[0.02] transition-colors">
        <div className="relative w-20 h-20 shrink-0 overflow-hidden" style={{ background: "var(--s1)" }}>
          <Image src={imageUrl} alt={product.name} fill className="object-cover" sizes="80px" />
        </div>
        <div className="flex-1 min-w-0 py-1">
          <p className="text-[10px] tracking-[0.1em] uppercase mb-1" style={{ color: "var(--chalk2)" }}>{product.brand?.name}</p>
          <p className="text-sm line-clamp-2 leading-snug" style={{ color: "var(--chalk)" }}>{product.name}</p>
          <p className="text-sm font-medium mt-2" style={{ color: "var(--chalk)" }}>{format(price)}</p>
        </div>
      </Link>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: (index % 4) * 0.08 }}
        className={cn("pcard", className)}
      >
        <Link href={`/products/${product.slug}`} className="block">
          <div className="pimg">
            <Image
              src={imageUrl} alt={product.name} fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={priority}
            />

            {isTech && <span className="pbadge bt">{tn("tech")}</span>}
            {isBeauty && <span className="pbadge bb" style={isTech ? { top: 52 } : undefined}>{tn("beauty")}</span>}
            {product.isNewArrival && (
              <span className="pbadge bn" style={(isTech || isBeauty) ? { top: (isTech && isBeauty) ? 86 : 52 } : undefined}>{tc("new")}</span>
            )}
            {discount > 0 && (
              <span className="pbadge bd" style={{ top: 18 + ([isTech, isBeauty, product.isNewArrival].filter(Boolean).length) * 34 }}>
                -{discount}%
              </span>
            )}

            {product.stockStatus === "OUT_OF_STOCK" && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                <span className="text-[10px] tracking-[0.12em] uppercase bg-black text-white px-3 py-1.5">{tp("outOfStockLabel")}</span>
              </div>
            )}
          </div>

          <div className="pbody">
            {product.brand && <div className="pbrand">{product.brand.name}</div>}
            <div className="pname line-clamp-2">{product.name}</div>
            {product.description && (
              <p className="ptagline line-clamp-1">{product.description.split(/[.!?]/)[0].trim()}</p>
            )}
            <div className="prow">
              <span className="pprice">{format(price)}</span>
              {comparePrice && comparePrice > price && (
                <span className="pold">{format(comparePrice)}</span>
              )}
            </div>
            {product.stockStatus === "LOW_STOCK" && (
              <p className="text-[10px] tracking-[0.08em] uppercase text-red-500 mb-3">{tp("lowStockLabel")}</p>
            )}
            <div className="pacts">
              {product.stockStatus === "OUT_OF_STOCK" ? (
                <NotifyMe productId={product.id} compact />
              ) : (
              <button
                onClick={handleAddToCart}
                className="btn-cart"
              >
                {tp("addToCart")}
              </button>
              )}
              <button
                onClick={handleWishlist}
                aria-label={isWishlisted ? tp("removeFromWishlist") : tp("addToWishlist")}
                className={cn("btn-wish", isWishlisted && "wishlisted")}
              >
                <Heart size={15} fill={isWishlisted ? "currentColor" : "none"} />
              </button>
            </div>
          </div>
        </Link>
      </motion.div>

      {mounted && <QuickView slug={quickViewSlug} onClose={() => setQuickViewSlug(null)} />}
    </>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="pcard animate-pulse">
      <div className="pimg" style={{ background: "var(--s2)" }} />
      <div className="pbody">
        <div className="h-2.5 w-16 mb-2 rounded" style={{ background: "var(--border)" }} />
        <div className="h-5 w-full mb-1.5 rounded" style={{ background: "var(--border)" }} />
        <div className="h-5 w-2/3 mb-4 rounded" style={{ background: "var(--border)" }} />
        <div className="h-6 w-20 rounded" style={{ background: "var(--border)" }} />
      </div>
    </div>
  );
}
