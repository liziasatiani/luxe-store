"use client";
import { useEffect } from "react";
import { useRecentlyViewedStore } from "@/store";
import type { ProductCard } from "@/types";

export function TrackView({ product }: { product: ProductCard }) {
  const { add } = useRecentlyViewedStore();
  useEffect(() => { add(product); }, [product.id]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
