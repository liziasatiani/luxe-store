export const revalidate = 3600;
import { Suspense } from "react";
import { ProductGrid } from "@/components/product/ProductGrid";
import { buildMetadata } from "@/lib/seo";
import { getTranslations, getLocale } from "next-intl/server";

export async function generateMetadata() {
  const [t, locale] = await Promise.all([getTranslations("pages.featured"), getLocale()]);
  return buildMetadata({ title: t("title"), locale });
}

export default async function FeaturedPage() {
  return (
    <>
      <div style={{ padding: "calc(var(--nav-h) + 60px) 52px 48px", maxWidth: 1400, margin: "0 auto", borderBottom: "1px solid var(--border)" }}>
        <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(48px,7vw,96px)", fontWeight: 700, lineHeight: 0.95, letterSpacing: "-0.03em", color: "var(--chalk)" }}>
          <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Selected</em> for You
        </h1>
      </div>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <Suspense fallback={null}>
          <ProductGrid filters={{ isFeatured: true }} />
        </Suspense>
      </div>
    </>
  );
}
