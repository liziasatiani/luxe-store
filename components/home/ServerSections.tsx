import { prisma } from "@/lib/prisma";
import { serializeDecimal } from "@/lib/utils";
import { ProductCard, ProductCardSkeleton } from "@/components/product/ProductCard";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import type { ProductCard as ProductCardType } from "@/types";

function KSectionHeader({ eyebrow, title, viewAllHref, viewAllLabel }: {
  eyebrow: string; title: string; viewAllHref?: string; viewAllLabel?: string;
}) {
  return (
    <div className="flex items-end justify-between mb-[60px]" style={{ paddingBottom: "0" }}>
      <div>
        <p className="text-[10px] font-semibold tracking-[0.22em] uppercase mb-3" style={{ color: "#C9A44A" }}>{eyebrow}</p>
        <h2 className="font-display font-bold leading-[1.05] tracking-[-0.01em]"
          style={{ fontSize: "clamp(32px,3.5vw,52px)", color: "#EFE9DA" }}>{title}</h2>
      </div>
      {viewAllHref && (
        <Link href={viewAllHref}
          className="hidden sm:flex items-center gap-2 text-[11px] font-medium tracking-[0.15em] uppercase mb-1 transition-opacity hover:opacity-70"
          style={{ color: "#C9A44A", borderBottom: "1px solid rgba(201,164,74,0.4)", paddingBottom: "3px" }}>
          {viewAllLabel ?? "View All"} →
        </Link>
      )}
    </div>
  );
}

export async function FeaturedProductsSection() {
  const t = await getTranslations("home.featured");
  let products: ProductCardType[] = [];
  try {
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
    products = serializeDecimal(rows) as ProductCardType[];
  } catch {
    return null;
  }

  return (
    <section className="py-24" style={{ borderBottom: "1px solid rgba(239,233,218,0.08)" }}>
      <div className="max-w-[1400px] mx-auto px-[52px] max-md:px-5">
        <KSectionHeader eyebrow="Featured" title="Selected for You" viewAllHref="/featured" viewAllLabel="View All" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px" style={{ background: "rgba(239,233,218,0.08)" }}>
          {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} priority={i < 4} />)}
        </div>
      </div>
    </section>
  );
}

export async function NewArrivalsSection() {
  const t = await getTranslations("pages.newArrivals");
  const tCommon = await getTranslations("common");
  let products: ProductCardType[] = [];
  try {
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
    products = serializeDecimal(rows) as ProductCardType[];
  } catch {
    return null;
  }

  return (
    <section className="py-24" style={{ borderBottom: "1px solid rgba(239,233,218,0.08)" }}>
      <div className="max-w-[1400px] mx-auto px-[52px] max-md:px-5">
        <KSectionHeader eyebrow="New In" title="Latest Arrivals" viewAllHref="/new" viewAllLabel={tCommon("seeAll")} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px" style={{ background: "rgba(239,233,218,0.08)" }}>
          {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </div>
    </section>
  );
}

export async function BestSellersSectionServer() {
  const t = await getTranslations("pages.bestSellers");
  try {
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
  } catch {
    return { title: t("title"), initialProducts: [] };
  }
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-px" style={{ background: "rgba(239,233,218,0.08)" }}>
      {Array.from({ length: count }).map((_, i) => <ProductCardSkeleton key={i} />)}
    </div>
  );
}
