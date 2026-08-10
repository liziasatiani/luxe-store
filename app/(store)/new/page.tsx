export const revalidate = 3600;
import { Suspense } from "react";
import { ProductGrid } from "@/components/product/ProductGrid";
import { buildMetadata } from "@/lib/seo";
import { getTranslations, getLocale } from "next-intl/server";

export async function generateMetadata() {
  const [t, locale] = await Promise.all([getTranslations("pages.newArrivals"), getLocale()]);
  return buildMetadata({ title: t("title"), locale });
}

export default async function NewArrivalsPage() {
  const t = await getTranslations("pages.newArrivals");
  return (
    <>
      {/* K .page-header */}
      <div style={{ padding: "calc(var(--nav-h) + 60px) 52px 48px", maxWidth: 1400, margin: "0 auto", borderBottom: "1px solid var(--border)" }}>
        <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(48px,7vw,96px)", fontWeight: 700, lineHeight: 0.95, letterSpacing: "-0.03em", color: "var(--chalk)" }}>
          {t("title")}
        </h1>
      </div>

      {/* Product grid — K .main-area */}
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <Suspense fallback={null}>
          <ProductGrid filters={{ isNewArrival: true, sort: "newest" }} />
        </Suspense>
      </div>
    </>
  );
}
