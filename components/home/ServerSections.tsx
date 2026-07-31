import { prisma } from "@/lib/prisma";
import { serializeDecimal } from "@/lib/utils";
import { ProductCard, ProductCardSkeleton } from "@/components/product/ProductCard";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui";
import type { ProductCard as ProductCardType } from "@/types";

function EditorialHeader({ title, subtitle, viewAllHref, viewAllLabel }: {
  title: string; subtitle?: string; viewAllHref?: string; viewAllLabel?: string;
}) {
  return (
    <div className="flex items-baseline justify-between mb-10">
      <div>
        <h2 className="font-display text-2xl md:text-3xl text-black dark:text-white font-light">{title}</h2>
        {subtitle && <p className="text-[11px] tracking-[0.08em] uppercase text-black/40 dark:text-white/40 mt-1">{subtitle}</p>}
      </div>
      {viewAllHref && (
        <Link href={viewAllHref} className="hidden sm:flex items-center gap-1 text-[11px] tracking-[0.1em] uppercase text-black dark:text-white hover:opacity-50 transition-opacity">
          {viewAllLabel ?? "View All"} <ArrowRight size={12} />
        </Link>
      )}
    </div>
  );
}

export async function FeaturedProductsSection() {
  const t = await getTranslations("home.featured");
  const rows = await prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    select: {
      id: true, name: true, slug: true, price: true, comparePrice: true,
      stockStatus: true, stock: true, ratingAvg: true, ratingCount: true,
      isFeatured: true, isBestSeller: true, isNewArrival: true, isOnSale: true, brandId: true,
      images: { where: { isPrimary: true }, take: 1, select: { url: true, isPrimary: true, altText: true } },
      brand: { select: { name: true, slug: true } },
      category: { select: { name: true, slug: true } },
    },
    orderBy: [{ salesCount: "desc" }, { createdAt: "desc" }],
    take: 8,
  });
  const products = serializeDecimal(rows) as ProductCardType[];

  return (
    <section className="py-20 border-b border-black/8 dark:border-white/8">
      <Container>
        <EditorialHeader title={t("title")} subtitle={t("subtitle")} viewAllHref="/featured" viewAllLabel={t("viewAll")} />
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y divide-black/8 dark:divide-white/8 border border-black/8 dark:border-white/8">
          {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} priority={i < 4} />)}
        </div>
      </Container>
    </section>
  );
}

export async function NewArrivalsSection() {
  const t = await getTranslations("pages.newArrivals");
  const tCommon = await getTranslations("common");
  const rows = await prisma.product.findMany({
    where: { isActive: true, isNewArrival: true },
    select: {
      id: true, name: true, slug: true, price: true, comparePrice: true,
      stockStatus: true, stock: true, ratingAvg: true, ratingCount: true,
      isFeatured: true, isBestSeller: true, isNewArrival: true, isOnSale: true, brandId: true,
      images: { where: { isPrimary: true }, take: 1, select: { url: true, isPrimary: true, altText: true } },
      brand: { select: { name: true, slug: true } },
      category: { select: { name: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 8,
  });
  const products = serializeDecimal(rows) as ProductCardType[];

  return (
    <section className="py-20 border-b border-black/8 dark:border-white/8">
      <Container>
        <EditorialHeader title={t("title")} subtitle={t("subtitle")} viewAllHref="/new" viewAllLabel={tCommon("seeAll")} />
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y divide-black/8 dark:divide-white/8 border border-black/8 dark:border-white/8">
          {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </Container>
    </section>
  );
}

export async function BestSellersSectionServer() {
  const t = await getTranslations("pages.bestSellers");
  const rows = await prisma.product.findMany({
    where: { isActive: true, isBestSeller: true },
    select: {
      id: true, name: true, slug: true, price: true, comparePrice: true,
      stockStatus: true, stock: true, ratingAvg: true, ratingCount: true,
      isFeatured: true, isBestSeller: true, isNewArrival: true, isOnSale: true, brandId: true,
      images: { where: { isPrimary: true }, take: 1, select: { url: true, isPrimary: true, altText: true } },
      brand: { select: { name: true, slug: true } },
      category: { select: { name: true, slug: true } },
    },
    orderBy: [{ ratingAvg: "desc" }, { salesCount: "desc" }],
    take: 8,
  });
  const initialProducts = serializeDecimal(rows) as ProductCardType[];

  return { title: t("title"), initialProducts };
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y divide-black/8 dark:divide-white/8 border border-black/8 dark:border-white/8">
      {Array.from({ length: count }).map((_, i) => <ProductCardSkeleton key={i} />)}
    </div>
  );
}
