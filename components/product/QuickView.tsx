"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, ShoppingBag, Heart, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Badge, RatingStars, Spinner } from "@/components/ui";
import { useCartStore, useWishlistStore } from "@/store";
import { formatPrice, getProductImageUrl, cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface QuickViewProps {
  slug: string | null;
  onClose: () => void;
}

// Product type is intentionally loose to avoid coupling to Prisma output shape
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyProduct = any;

export function QuickView({ slug, onClose }: QuickViewProps) {
  const [product, setProduct] = useState<AnyProduct>(null);
  const [loading, setLoading] = useState(false);
  const [qty, setQty] = useState(1);
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
    toast.success("Added to cart", { icon: "🛍️" });
    onClose();
  };

  return (
    <AnimatePresence>
      {slug && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-label="Quick view"
            className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-surface-900 rounded-2xl shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
            >
              <X size={18} />
            </button>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Spinner size={32} />
              </div>
            ) : product ? (
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="relative aspect-square rounded-tl-2xl rounded-bl-2xl overflow-hidden bg-surface-50 dark:bg-surface-800">
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
                      {formatPrice(Number(product.price))}
                    </span>
                    {product.comparePrice && Number(product.comparePrice) > Number(product.price) && (
                      <span className="text-base text-surface-400 line-through">
                        {formatPrice(Number(product.comparePrice))}
                      </span>
                    )}
                  </div>
                  {product.shortDescription && (
                    <p className="text-sm text-surface-500 leading-relaxed">
                      {product.shortDescription}
                    </p>
                  )}
                  <div>
                    <p className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Qty</p>
                    <div className="flex items-center gap-1 w-fit rounded-xl border border-surface-200 dark:border-surface-700 overflow-hidden">
                      <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-9 h-9 flex items-center justify-center hover:bg-surface-50 dark:hover:bg-surface-800 text-surface-600">−</button>
                      <span className="w-10 text-center text-sm font-medium">{qty}</span>
                      <button onClick={() => setQty(q => q + 1)} className="w-9 h-9 flex items-center justify-center hover:bg-surface-50 dark:hover:bg-surface-800 text-surface-600">+</button>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={handleAddToCart}
                      disabled={product.stockStatus === "OUT_OF_STOCK"}
                      variant="gold" size="md" fullWidth
                      leftIcon={<ShoppingBag size={16} />}
                    >
                      {product.stockStatus === "OUT_OF_STOCK" ? "Out of Stock" : "Add to Cart"}
                    </Button>
                    <button
                      onClick={() => { toggle(product.id); toast.success(isWishlisted ? "Removed" : "Wishlisted"); }}
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
                    View full details <ExternalLink size={13} />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-20">
                <p className="text-surface-400">Product not found</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
