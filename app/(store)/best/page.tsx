export const revalidate = 3600;
import { Suspense } from "react";
import { Spinner } from "@/components/ui";
import { ProductGrid } from "@/components/product/ProductGrid";
import { buildMetadata } from "@/lib/seo";
import { getTranslations, getLocale } from "next-intl/server";

export async function generateMetadata() {
  const [t, locale] = await Promise.all([getTranslations("pages.bestSellers"), getLocale()]);
  return buildMetadata({ title: t("title"), locale });
}

export default async function BestSellersPage() {
  const t = await getTranslations("pages.bestSellers");
  return (
    <>
      <div className="k-page-hdr">
        <div className="wrap">
          <p className="page-hd-eyebrow">{t("badge")}</p>
          <h1 className="page-hd-title">{t("title")}</h1>
          <p style={{ fontSize: 14, color: "var(--chalk3)", marginTop: 12, maxWidth: 400, margin: "12px auto 0" }}>{t("subtitle")}</p>
        </div>
      </div>
      <div style={{ paddingTop: 48, paddingBottom: 96 }}>
        <div className="wrap">
          <Suspense fallback={<div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}><Spinner size={32} /></div>}>
            <ProductGrid filters={{ isBestSeller: true, sort: "best-selling" }} />
          </Suspense>
        </div>
      </div>
    </>
  );
}
