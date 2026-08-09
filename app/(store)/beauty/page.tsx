export const revalidate = 3600;
import { prisma } from "@/lib/prisma";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SubcategoryNav } from "@/components/ui/SubcategoryNav";
import { TrustBar } from "@/components/ui/TrustBar";
import { getLocale, getTranslations } from "next-intl/server";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const locale = await getLocale();
  return buildMetadata({ title: "Beauty", description: "Shop luxury skincare, makeup, hair care, perfume and beauty tools from the world's most coveted brands.", locale });
}

export default async function BeautyPage() {
  const [subcategories, t, tNav] = await Promise.all([
    prisma.category.findMany({
      where: { parent: { slug: "beauty" }, isActive: true },
      select: { name: true, slug: true, _count: { select: { products: { where: { isActive: true } } } } },
      orderBy: { sortOrder: "asc" },
    }),
    getTranslations("pages.beauty"),
    getTranslations("nav"),
  ]);

  return (
    <>
      <div className="k-page-hdr">
        <div className="wrap">
          <p className="page-hd-eyebrow">{t("collection")}</p>
          <h1 className="page-hd-title">{tNav("beauty")}</h1>
          <p className="page-hd-desc">{t("desc")}</p>
        </div>
      </div>

      <div style={{ paddingTop: 32, paddingBottom: 96 }}>
        <div className="wrap">
          <SubcategoryNav
            basePath="/beauty"
            all={{ label: t("all"), href: "/beauty", active: true }}
            subcategories={subcategories.map(sc => ({ name: sc.name, slug: sc.slug, count: sc._count.products }))}
          />
          <ProductGrid filters={{ categorySlug: "beauty" }} />
        </div>
      </div>
      <TrustBar />
    </>
  );
}
