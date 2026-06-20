"use client";
import { useEffect, useState } from "react";
import { useRecentlyViewedStore } from "@/store";
import { ProductCard } from "@/components/product/ProductCard";
import { Container } from "@/components/ui";
import type { ProductCard as ProductCardType } from "@/types";

interface Props {
  currentProductId: string;
}

export function RecentlyViewed({ currentProductId }: Props) {
  const { items } = useRecentlyViewedStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const filtered = items.filter((p) => p.id !== currentProductId).slice(0, 4);
  if (!filtered.length) return null;

  return (
    <div className="mt-20 border-t border-black/8 dark:border-white/8 pt-16">
      <Container>
        <h2 className="font-display text-3xl text-surface-900 dark:text-white mb-8">Recently Viewed</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {filtered.map((p, i) => (
            <ProductCard key={p.id} product={p as ProductCardType} index={i} />
          ))}
        </div>
      </Container>
    </div>
  );
}
