"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, ShoppingBag, Heart, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Badge, RatingStars, Spinner } from "@/components/ui";
import { useCartStore, useWishlistStore } from "@/store";
import { getProductImageUrl, cn } from "@/lib/utils";
import type { ProductCard } from "@/types";
import { useCurrency } from "@/hooks/useCurrency";
import { useTranslations, useLocale } from "next-intl";
import toast from "react-hot-toast";

interface QuickViewProps {
  slug: string | null;
  onClose: () => void;
}

type QuickViewProduct = ProductCard & {
  description?: string | null;
  description_ka?: string | null;
  description_fr?: string | null;
  description_es?: string | null;
  variants?: Array<{ id: string; name: string; value: string; price?: number | null; stock: number }>;
}

export function QuickView({ slug, onClose }: QuickViewProps) {
  const [product, setProduct] = useState<QuickViewProduct | null>(null);
  const [loading, setLoading] = useState(false);
  const [qty, setQty] = useState(1);
  const { format } = useCurrency();
  const t = useTranslations("product");
  const tc = useTranslations("common");
  const locale = useLocale();
  const { addItem } = useCartStore();
  const { toggle, has } = useWishlistStore();

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setProduct(null);
    setQty(1);
    fetch(`/api/products/${slug}`)
      .then(r => r.json())
      .then(d => setProduct(d.data?.product ?? null))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!slug) return null;

  const isWishlisted = product ? has(product.id) : false;
  const img = product ? getProductImageUrl(product.images ?? []) : "";

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, qty);
    toast.success(t("addToCart"), { icon: "🛍️" });
    onClose();
  };

  return (
    <AnimatePresence>
      {slug && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 300 }}
            style={{ willChange: "transform" }}
            role="dialog"
            aria-modal="true"
            aria-label={t("quickView")}
            className="relative w-full sm:max-w-3xl sm:mx-auto max-h-[92vh] sm:max-h-[90vh] overflow-y-auto bg-white dark:bg-surface-900 rounded-t-2xl sm:rounded-2xl shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="sm:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-surface-200 dark:bg-surface-700" />
            </div>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-11 h-11 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
            >
              <X size={18} />
            </button>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Spinner size={32} />
              </div>
            ) : product ? (
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="relative aspect-square sm:rounded-tl-2xl sm:rounded-bl-2xl overflow-hidden bg-surface-50 dark:bg-surface-800">
                  <Image src={img} alt={product.name} fill className="object-cover" sizes="400px" />
                  {product.isNewArrival && (
                    <div className="absolute top-3 left-3">
                      <Badge variant="gold">New</Badge>
                    </div>
                  )}
                </div>
                <div className="p-6 space-y-4">
                  {product.brand && (
                    <p className="text-xs text-brand-500 font-semibold uppercase tracking-wider">
                      {product.brand.name}
                    </p>
                  )}
                  <h2 className="font-display text-2xl text-surface-900 dark:text-white leading-tight">
                    {product.name}
                  </h2>
                  <RatingStars rating={Number(product.ratingAvg)} count={product.ratingCount} size={14} />
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl font-bold text-surface-900 dark:text-white">
                      {format(Number(product.price))}
                    </span>
                    {product.comparePrice && Number(product.comparePrice) > Number(product.price) && (
                      <span className="text-base text-surface-400 line-through">
                        {format(Number(product.comparePrice))}
                      </span>
                    )}
                  </div>
                  {(() => {
                    const localizedDescription = (locale === "ka" ? product.description_ka : locale === "fr" ? product.description_fr : locale === "es" ? product.description_es : null) ?? product.description;
                    return localizedDescription ? (
                      <p className="text-sm text-surface-500 leading-relaxed whitespace-pre-line">
                        {localizedDescription}
                      </p>
                    ) : null;
                  })()}
                  <div>
                    <p className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">{t("qty")}</p>
                    <div className="flex items-center gap-1 w-fit rounded-xl border border-surface-200 dark:border-surface-700 overflow-hidden">
                      <button onClick={() => setQty(q => Math.max(1, q - 1))} aria-label={t("decreaseQty")} className="w-11 h-11 flex items-center justify-center hover:bg-surface-50 dark:hover:bg-surface-800 text-surface-600">−</button>
                      <span className="w-10 text-center text-sm font-medium" aria-live="polite" aria-atomic="true">{qty}</span>
                      <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} disabled={qty >= product.stock} aria-label={t("increaseQty")} className="w-11 h-11 flex items-center justify-center hover:bg-surface-50 dark:hover:bg-surface-800 text-surface-600 disabled:opacity-40">+</button>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={handleAddToCart}
                      disabled={product.stockStatus === "OUT_OF_STOCK"}
                      variant="gold" size="md" fullWidth
                      leftIcon={<ShoppingBag size={16} />}
                    >
                      {product.stockStatus === "OUT_OF_STOCK" ? t("outOfStock") : t("addToCart")}
                    </Button>
                    <button
                      onClick={() => { toggle(product.id); toast.success(isWishlisted ? tc("removedFromWishlist") : tc("savedToWishlist")); }}
                      className={cn(
                        "w-11 h-11 rounded-xl border flex items-center justify-center transition-colors shrink-0",
                        isWishlisted ? "bg-red-500 border-red-500 text-white" : "border-surface-200 dark:border-surface-700 text-surface-500 hover:text-red-500"
                      )}
                    >
                      <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
                    </button>
                  </div>
                  <Link
                    href={`/products/${product.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-1.5 text-sm text-brand-500 hover:text-brand-600 font-medium"
                  >
                    {t("viewFullDetails")} <ExternalLink size={13} />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-20">
                <p className="text-surface-400">{t("notFound")}</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
