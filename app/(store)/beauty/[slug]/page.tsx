import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const revalidate = 3600;
import { ProductGrid } from "@/components/product/ProductGrid";
import { SubcategoryNav } from "@/components/ui/SubcategoryNav";
import { TrustBar } from "@/components/ui/TrustBar";
import { getLocale, getTranslations } from "next-intl/server";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = await prisma.category.findUnique({ where: { slug }, include: { parent: true } });
  if (!cat) return {};
  const locale = await getLocale();
  return buildMetadata({ title: cat.name, description: cat.description ?? undefined, locale });
}

export default async function BeautySubcategoryPage({ params }: Props) {
  const { slug } = await params;

  const [category, subcategories, t, tNav, tCommon] = await Promise.all([
    prisma.category.findUnique({
      where: { slug, isActive: true },
      include: { parent: true, _count: { select: { products: { where: { isActive: true } } } } },
    }),
    prisma.category.findMany({
      where: { parent: { slug: "beauty" }, isActive: true },
      select: { name: true, slug: true, _count: { select: { products: { where: { isActive: true } } } } },
      orderBy: { sortOrder: "asc" },
    }),
    getTranslations("pages.beauty"),
    getTranslations("nav"),
    getTranslations("common"),
  ]);

  if (!category) notFound();

  return (
    <>
      <div className="k-page-hdr">
        <div className="wrap">
          <p className="page-hd-eyebrow">{tNav("beauty")}</p>
          <h1 className="page-hd-title">{category.name}</h1>
          <p className="page-hd-desc">{category._count.products} {tCommon("products")}</p>
        </div>
      </div>

      <div style={{ paddingTop: 32, paddingBottom: 96 }}>
        <div className="wrap">
          <SubcategoryNav
            basePath="/beauty"
            all={{ label: t("all"), href: "/beauty", active: false }}
            subcategories={subcategories.map(sc => ({ name: sc.name, slug: sc.slug, count: sc._count.products }))}
            activeSlug={slug}
          />
          <ProductGrid filters={{ categorySlug: slug }} />
        </div>
      </div>
      <TrustBar />
    </>
  );
}
