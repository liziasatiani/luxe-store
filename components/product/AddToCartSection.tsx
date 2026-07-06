"use client";
import { useState } from "react";
import { Heart, Share2, ShoppingBag, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCartStore, useWishlistStore } from "@/store";
import { cn } from "@/lib/utils";
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
  const { addItem, openCart } = useCartStore();
  const { toggle, has } = useWishlistStore();
  const router = useRouter();
  const isWishlisted = has(product.id);
  const outOfStock = product.stockStatus === "OUT_OF_STOCK";

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
          <p className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
            {groupName}: <span className="text-surface-500">{selectedVariant?.name === groupName ? selectedVariant.value : "Select"}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => (
              <button
                key={v.id}
                onClick={() => setSelectedVariant(v)}
                disabled={v.stock === 0}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm border transition-all",
                  selectedVariant?.id === v.id
                    ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400"
                    : "border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300 hover:border-surface-400",
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
        <p className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Quantity</p>
        <div className="flex items-center gap-1 w-fit rounded-xl border border-surface-200 dark:border-surface-700 overflow-hidden">
          <button
            onClick={() => setQty(q => Math.max(1, q - 1))}
            className="w-10 h-10 flex items-center justify-center text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
          >−</button>
          <span className="w-12 text-center text-sm font-medium text-surface-900 dark:text-white">{qty}</span>
          <button
            onClick={() => setQty(q => Math.min(product.stock, q + 1))}
            disabled={qty >= product.stock}
            className="w-10 h-10 flex items-center justify-center text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors disabled:opacity-40"
          >+</button>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={handleAddToCart}
          disabled={outOfStock}
          variant="secondary"
          size="lg"
          fullWidth
          leftIcon={<ShoppingBag size={18} />}
        >
          {outOfStock ? "Out of Stock" : "Add to Cart"}
        </Button>
        <Button
          onClick={handleBuyNow}
          disabled={outOfStock}
          variant="gold"
          size="lg"
          fullWidth
          leftIcon={<Zap size={18} />}
        >
          Buy Now
        </Button>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={() => { toggle(product.id); toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist"); }}
          className={cn(
            "flex items-center gap-2 text-sm transition-colors",
            isWishlisted ? "text-red-500" : "text-surface-500 hover:text-surface-700 dark:hover:text-surface-300"
          )}
        >
          <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
          {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
        </button>
        <span className="text-surface-200 dark:text-surface-700">|</span>
        <button onClick={handleShare} className="flex items-center gap-2 text-sm text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 transition-colors">
          <Share2 size={16} />
          Share
        </button>
      </div>
    </div>
  );
}
