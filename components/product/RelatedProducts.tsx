import { prisma } from "@/lib/prisma";
import { serializeDecimal } from "@/lib/utils";
import { getTranslations } from "next-intl/server";
import { ProductCard, ProductCardSkeleton } from "@/components/product/ProductCard";
import type { ProductCard as ProductCardType } from "@/types";

interface Props {
  productId: string;
  categoryId: string;
  price: number;
}

export async function RelatedProducts({ productId, categoryId, price }: Props) {
  const t = await getTranslations("product");
  const related = await prisma.product.findMany({
    where: {
      isActive: true,
      categoryId,
      id: { not: productId },
      price: { gte: price * 0.4, lte: price * 2.5 },
    },
    select: {
      id: true, name: true, slug: true, price: true, comparePrice: true,
      stockStatus: true, stock: true, ratingAvg: true, ratingCount: true,
      isFeatured: true, isBestSeller: true, isNewArrival: true, isOnSale: true, brandId: true,
      images: { where: { isPrimary: true }, take: 1, select: { url: true, isPrimary: true, altText: true } },
      brand: { select: { name: true, slug: true } },
      category: { select: { name: true, slug: true } },
    },
    take: 8,
    orderBy: [{ ratingAvg: "desc" }, { salesCount: "desc" }],
  });

  if (!related.length) return null;

  const items = serializeDecimal(related) as ProductCardType[];

  return (
    <div className="mt-20">
      <h2 className="font-display text-3xl text-surface-900 dark:text-white mb-8">{t("youMayAlsoLike")}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {items.map((rp, i) => <ProductCard key={rp.id} product={rp} index={i} />)}
      </div>
    </div>
  );
}

export function RelatedProductsSkeleton() {
  return (
    <div className="mt-20">
      <div className="h-8 w-48 bg-black/5 dark:bg-white/5 mb-8" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
      </div>
    </div>
  );
}
