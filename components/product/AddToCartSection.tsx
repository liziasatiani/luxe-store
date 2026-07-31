"use client";
import { useState, useRef, useEffect } from "react";
import { Heart, Share2, ShoppingBag, Zap } from "lucide-react";
import { useCartStore, useWishlistStore } from "@/store";
import { cn, formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import type { ProductCard } from "@/types";

interface Variant {
  id: string;
  name: string;
  value: string;
  price?: number | null;
  stock: number;
}

interface Props {
  product: ProductCard & {
    variants?: Variant[];
  };
}

export function AddToCartSection({ product }: Props) {
  const [qty, setQty] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [stickyVisible, setStickyVisible] = useState(false);
  const { addItem, openCart } = useCartStore();
  const { toggle, has } = useWishlistStore();
  const router = useRouter();
  const isWishlisted = has(product.id);
  const outOfStock = product.stockStatus === "OUT_OF_STOCK";
  const buttonsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = buttonsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setStickyVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const variantGroups = (product.variants ?? []).reduce<Record<string, Variant[]>>((acc, v) => {
    if (!acc[v.name]) acc[v.name] = [];
    acc[v.name].push(v);
    return acc;
  }, {});

  const handleAddToCart = () => {
    addItem(
      product,
      qty,
      selectedVariant
        ? { name: selectedVariant.name, value: selectedVariant.value, price: selectedVariant.price }
        : undefined
    );
    toast.success(`${product.name} added to cart`, { icon: "🛍️" });
    openCart();
  };

  const handleBuyNow = () => {
    addItem(
      product,
      qty,
      selectedVariant
        ? { name: selectedVariant.name, value: selectedVariant.value, price: selectedVariant.price }
        : undefined
    );
    router.push("/checkout");
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: product.name, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  return (
    <div className="space-y-5">
      {Object.entries(variantGroups).map(([groupName, variants]) => (
        <div key={groupName}>
          <p className="text-[10px] tracking-[0.12em] uppercase text-black/50 dark:text-white/50 mb-2">
            {groupName}: <span className="text-black dark:text-white">{selectedVariant?.name === groupName ? selectedVariant.value : "Select"}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => (
              <button
                key={v.id}
                onClick={() => setSelectedVariant(v)}
                disabled={v.stock === 0}
                className={cn(
                  "px-4 py-2 text-sm border transition-colors",
                  selectedVariant?.id === v.id
                    ? "border-black dark:border-white bg-black dark:bg-white text-white dark:text-black"
                    : "border-black/15 dark:border-white/15 text-black dark:text-white hover:border-black/40 dark:hover:border-white/40",
                  v.stock === 0 && "opacity-40 cursor-not-allowed line-through"
                )}
              >
                {v.value}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div>
        <p className="text-[10px] tracking-[0.12em] uppercase text-black/50 dark:text-white/50 mb-2">Quantity</p>
        <div className="flex items-center w-fit border border-black/15 dark:border-white/15">
          <button
            onClick={() => setQty(q => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
            className="w-11 h-11 flex items-center justify-center text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >−</button>
          <span className="w-12 text-center text-sm text-black dark:text-white border-x border-black/15 dark:border-white/15" aria-live="polite" aria-atomic="true">{qty}</span>
          <button
            onClick={() => setQty(q => Math.min(product.stock, q + 1))}
            disabled={qty >= product.stock}
            aria-label="Increase quantity"
            className="w-11 h-11 flex items-center justify-center text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors disabled:opacity-40"
          >+</button>
        </div>
      </div>

      <div ref={buttonsRef} className="flex gap-3">
        <button
          onClick={handleAddToCart}
          disabled={outOfStock}
          className="flex-1 h-12 flex items-center justify-center gap-2 border border-black dark:border-white text-black dark:text-white text-[11px] tracking-[0.14em] uppercase font-medium hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors disabled:opacity-40"
        >
          <ShoppingBag size={16} />
          {outOfStock ? "Out of Stock" : "Add to Cart"}
        </button>
        <button
          onClick={handleBuyNow}
          disabled={outOfStock}
          className="flex-1 h-12 flex items-center justify-center gap-2 bg-black dark:bg-white text-white dark:text-black text-[11px] tracking-[0.14em] uppercase font-medium hover:bg-black/80 dark:hover:bg-white/80 transition-colors disabled:opacity-40"
        >
          <Zap size={16} />
          Buy Now
        </button>
      </div>

      {/* Sticky mobile add-to-cart bar — visible only when main buttons scroll off screen */}
      {stickyVisible && (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white dark:bg-black border-t border-black/10 dark:border-white/10 px-4 py-3 flex items-center gap-3 safe-area-inset-bottom">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] tracking-[0.1em] uppercase text-black/40 dark:text-white/40 truncate">{product.name}</p>
            <p className="text-sm font-medium text-black dark:text-white">
              {formatPrice(selectedVariant?.price ?? Number(product.price))}
            </p>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={outOfStock}
            className="h-11 px-5 flex items-center gap-2 border border-black dark:border-white text-black dark:text-white text-[10px] tracking-[0.14em] uppercase font-medium disabled:opacity-40"
          >
            <ShoppingBag size={14} />
            {outOfStock ? "Out of Stock" : "Add to Cart"}
          </button>
          <button
            onClick={handleBuyNow}
            disabled={outOfStock}
            className="h-11 px-5 flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black text-[10px] tracking-[0.14em] uppercase font-medium disabled:opacity-40"
          >
            Buy Now
          </button>
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={() => { toggle(product.id); toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist"); }}
          className={cn(
            "flex items-center gap-2 text-sm transition-colors",
            isWishlisted ? "text-red-500" : "text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white"
          )}
        >
          <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
          {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
        </button>
        <span className="text-black/20 dark:text-white/20">|</span>
        <button onClick={handleShare} className="flex items-center gap-2 text-sm text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors">
          <Share2 size={16} />
          Share
        </button>
      </div>
    </div>
  );
}
