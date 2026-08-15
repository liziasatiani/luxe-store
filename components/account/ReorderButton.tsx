"use client";
import { useState } from "react";
import { RotateCcw, Check } from "lucide-react";
import { useCartStore } from "@/store";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

interface Props {
  orderId: string;
}

export function ReorderButton({ orderId }: Props) {
  const tc = useTranslations("common");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  const handleReorder = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading || done) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();
      const items: Array<{ product?: { slug: string }; variantId?: string; quantity: number }> =
        data.data?.order?.items ?? [];

      for (const item of items) {
        if (!item.product?.slug) continue;
        const pRes = await fetch(`/api/products/${item.product.slug}`);
        if (!pRes.ok) continue;
        const pData = await pRes.json();
        const product = pData.data?.product ?? pData.product;
        if (!product || product.stockStatus === "OUT_OF_STOCK") continue;
        const variant = item.variantId
          ? product.variants?.find((v: { id: string }) => v.id === item.variantId)
          : undefined;
        addItem(product, variant);
      }
      setDone(true);
      openCart();
      setTimeout(() => setDone(false), 3000);
    } catch {
      toast.error(tc("reorderFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleReorder}
      disabled={loading}
      className="flex items-center gap-1 text-[10px] tracking-[0.08em] uppercase text-surface-500 hover:text-black dark:hover:text-white transition-colors disabled:opacity-40"
      aria-label={tc("reorder")}
    >
      {done ? <Check size={12} className="text-green-500" /> : <RotateCcw size={12} className={loading ? "animate-spin" : ""} />}
      {done ? tc("addedToCart") : tc("reorder")}
    </button>
  );
}
