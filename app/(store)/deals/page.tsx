export const revalidate = 3600;
import { ProductGrid } from "@/components/product/ProductGrid";
import { getLocale, getTranslations } from "next-intl/server";
import { buildMetadata } from "@/lib/seo";
import { Tag } from "lucide-react";

export async function generateMetadata() {
  const [t, locale] = await Promise.all([getTranslations("pages.deals"), getLocale()]);
  return buildMetadata({ title: t("title"), description: t("subtitle"), locale });
}

export default async function DealsPage() {
  const t = await getTranslations("pages.deals");
  return (
    <>
      <div className="k-page-hdr">
        <div className="wrap" style={{ textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 16, padding: "4px 12px", border: "1px solid var(--crimson)", color: "var(--crimson)" }}>
            <Tag size={11} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" }}>{t("badge")}</span>
          </div>
          <p className="page-hd-eyebrow">{t("title")}</p>
          <h1 className="page-hd-title">{t("subtitle")}</h1>
          <p style={{ fontSize: 14, color: "var(--chalk3)", marginTop: 12 }}>{t("description")}</p>
        </div>
      </div>
      <div style={{ paddingTop: 48, paddingBottom: 96 }}>
        <div className="wrap">
          <ProductGrid filters={{ isOnSale: true }} />
        </div>
      </div>
    </>
  );
}
