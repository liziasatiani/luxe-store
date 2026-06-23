"use client";
import { useEffect, useState, useRef } from "react";
import { Heart } from "lucide-react";
import { Container, EmptyState, Spinner } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { ProductCard, ProductCardSkeleton } from "@/components/product/ProductCard";
import { useWishlistStore } from "@/store";
import Link from "next/link";
import type { ProductCard as ProductCardType } from "@/types";

export default function WishlistPage() {
  const { ids, clear } = useWishlistStore();
  const [products, setProducts] = useState<ProductCardType[]>([]);
  const [loading, setLoading] = useState(false);
  const fetchedKey = useRef("");

  const uniqueIds = [...new Set(ids)];
  const idsKey = uniqueIds.slice().sort().join(",");

  useEffect(() => {
    if (idsKey === fetchedKey.current) return;
    fetchedKey.current = idsKey;

    if (uniqueIds.length === 0) {
      setProducts([]);
      return;
    }

    setLoading(true);
    fetch(`/api/wishlist/products?ids=${uniqueIds.join(",")}`)
      .then(r => r.json())
      .then(d => {
        const seen = new Set<string>();
        const deduped = (d.data?.products ?? []).filter((p: ProductCardType) => {
          if (seen.has(p.id)) return false;
          seen.add(p.id);
          return true;
        });
        setProducts(deduped);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey]);

  return (
    <Container className="py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-4xl text-surface-900 dark:text-white">
          My Wishlist{" "}
          <span className="text-surface-400 text-2xl font-normal">({uniqueIds.length})</span>
        </h1>
        {uniqueIds.length > 0 && (
          <button onClick={clear} className="text-sm text-surface-400 hover:text-red-500 transition-colors">
            Clear all
          </button>
        )}
      </div>

      {uniqueIds.length === 0 ? (
        <EmptyState
          icon={<Heart size={56} strokeWidth={1} />}
          eyebrow="Wishlist"
          title="Nothing saved yet"
          description="Tap the heart on any product to save it here. No account needed."
          action={
            <Button variant="gold" size="lg" asChild>
              <Link href="/">Start Shopping</Link>
            </Button>
          }
        />
      ) : loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {uniqueIds.map(id => <ProductCardSkeleton key={id} />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <Spinner size={28} className="mx-auto mb-4" />
          <p className="text-surface-400 text-sm">Loading your wishlist...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
          <div className="mt-8 p-4 rounded-2xl bg-surface-50 dark:bg-surface-800/50 text-center">
            <p className="text-sm text-surface-500">
              Your wishlist is saved on this device.{" "}
              <Link href="/login" className="text-brand-500 hover:text-brand-600 font-medium">Sign in</Link>
              {" "}to sync across devices.
            </p>
          </div>
        </>
      )}
    </Container>
  );
}
