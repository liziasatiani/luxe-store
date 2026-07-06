"use client";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { Container, EmptyState } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { ProductCard } from "@/components/product/ProductCard";
import { useWishlistStore } from "@/store";
import Link from "next/link";
import type { ProductCard as ProductCardType } from "@/types";

export default function WishlistPage() {
  const { ids } = useWishlistStore();
  const [products, setProducts] = useState<ProductCardType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ids.length === 0) { setLoading(false); return; }
    fetch(`/api/products?ids=${ids.join(",")}`)
      .then(r => r.json())
      .then(d => setProducts(d.data?.products ?? []))
      .finally(() => setLoading(false));
  }, [ids]);

  return (
    <Container className="py-12">
      <h1 className="font-display text-4xl text-surface-900 dark:text-white mb-8">
        My Wishlist <span className="text-surface-400 text-2xl">({ids.length} items)</span>
      </h1>

      {ids.length === 0 ? (
        <EmptyState
          icon={<Heart size={64} />}
          title="Your wishlist is empty"
          description="Save items you love and come back to them later."
          action={<Button variant="gold" size="lg" asChild><Link href="/">Start Shopping</Link></Button>}
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      )}
    </Container>
  );
}
