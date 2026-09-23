import { prisma } from "@/lib/prisma";
import { serializeDecimal } from "@/lib/utils";
import { ProductCard, ProductCardSkeleton } from "@/components/product/ProductCard";
import { TheStandardClient } from "@/components/home/TheStandardClient";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import type { ProductCard as ProductCardType } from "@/types";

function SectionHeader({ eyebrow, title, viewAllHref, viewAllLabel }: {
  eyebrow: string; title: string; viewAllHref?: string; viewAllLabel?: string;
}) {
  return (
    <div className="sec-meta">
      <div className="sec-row">
        <div>
          <p className="sec-eyebrow">{eyebrow}</p>
          <h2 className="sec-title">{title}</h2>
        </div>
        {viewAllHref && (
          <Link href={viewAllHref} className="see-all hidden sm:flex">
            {viewAllLabel ?? "View All"}
          </Link>
        )}
      </div>
    </div>
  );
}

const PRODUCT_SELECT = {
  id: true, name: true, slug: true, description: true, price: true, comparePrice: true,
  stockStatus: true, stock: true, ratingAvg: true, ratingCount: true,
  isFeatured: true, isBestSeller: true, isNewArrival: true, isOnSale: true, brandId: true,
  images: { where: { isPrimary: true }, take: 1, select: { url: true, isPrimary: true, altText: true } },
  brand: { select: { name: true, slug: true } },
  category: { select: { name: true, slug: true } },
} as const;

export async function NewArrivalsSection() {
  const [tNA, tc] = await Promise.all([
    getTranslations("pages.newArrivals"),
    getTranslations("common"),
  ]);
  let products: ProductCardType[] = [];
  try {
    const rows = await prisma.product.findMany({
      where: { isActive: true, isNewArrival: true },
      select: PRODUCT_SELECT,
      orderBy: { createdAt: "desc" },
      take: 8,
    });
    products = serializeDecimal(rows) as ProductCardType[];
  } catch {
    return null;
  }

  return (
    <section className="section" style={{ borderBottom: "1px solid var(--border)" }}>
      <div className="wrap">
        <SectionHeader eyebrow={tNA("eyebrow")} title={tNA("sectionTitle")} viewAllHref="/new" viewAllLabel={tc("viewAll")} />
        <div className="pgrid">
          {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </div>
    </section>
  );
}

export async function TheStandardSection() {
  let products: ProductCardType[] = [];
  try {
    const rows = await prisma.product.findMany({
      where: { isActive: true, isBestSeller: true },
      select: PRODUCT_SELECT,
      orderBy: [{ salesCount: "desc" }, { ratingAvg: "desc" }],
      take: 8,
    });
    if (rows.length < 4) {
      const ids = rows.map(p => p.id);
      const fallback = await prisma.product.findMany({
        where: {
          isActive: true,
          stockStatus: { not: "OUT_OF_STOCK" },
          NOT: { AND: [{ ratingCount: { equals: 0 } }, { salesCount: { equals: 0 } }] },
          brand: { name: { not: "Generic" } },
          ...(ids.length ? { id: { notIn: ids } } : {}),
        },
        select: PRODUCT_SELECT,
        orderBy: { salesCount: "desc" },
        take: 8 - rows.length,
      });
      products = serializeDecimal([...rows, ...fallback]) as ProductCardType[];
    } else {
      products = serializeDecimal(rows) as ProductCardType[];
    }
  } catch {
    return null;
  }

  if (products.length === 0) return null;

  return (
    <section className="section" style={{ borderBottom: "1px solid var(--border)" }}>
      <div className="wrap">
        <TheStandardClient products={products} />
      </div>
    </section>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="pgrid">
      {Array.from({ length: count }).map((_, i) => <ProductCardSkeleton key={i} />)}
    </div>
  );
}
