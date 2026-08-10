export const revalidate = 3600;
import { prisma } from "@/lib/prisma";
import { ProductGrid } from "@/components/product/ProductGrid";
import { TrustBar } from "@/components/ui/TrustBar";
import { getLocale, getTranslations } from "next-intl/server";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const locale = await getLocale();
  return buildMetadata({ title: "Tech", description: "Shop premium headphones, cameras, tablets, gaming gear, wearables and smart home devices.", locale });
}

export default async function TechPage() {
  const [subcategories, t, tNav] = await Promise.all([
    prisma.category.findMany({
      where: { parent: { slug: "tech" }, isActive: true },
      select: { name: true, slug: true, _count: { select: { products: { where: { isActive: true } } } } },
      orderBy: { sortOrder: "asc" },
    }),
    getTranslations("pages.tech"),
    getTranslations("nav"),
  ]);

  return (
    <>
      <div className="k-page-hdr">
        <div className="wrap">
          <p className="page-hd-eyebrow">{t("collection")}</p>
          <h1 className="page-hd-title">{tNav("tech")}</h1>
          <p className="page-hd-desc">{t("desc")}</p>
        </div>
      </div>

      <div style={{ paddingTop: 32, paddingBottom: 96 }}>
        <div className="wrap">
          <ProductGrid
            filters={{ categorySlug: "tech" }}
            subcategories={subcategories.map(sc => ({ name: sc.name, slug: sc.slug, count: sc._count.products }))}
            subcategoryBasePath="/tech"
            allCategoryLabel={t("all")}
            allCategoryHref="/tech"
          />
        </div>
      </div>
      <TrustBar />
    </>
  );
}
