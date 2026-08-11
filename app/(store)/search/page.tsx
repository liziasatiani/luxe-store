import { Suspense } from "react";
import { TrustBar } from "@/components/ui/TrustBar";
import { ProductGrid } from "@/components/product/ProductGrid";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

interface Props { searchParams: Promise<{ q?: string }> }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  const t = await getTranslations("pages.search");
  return { title: q ? `${t("resultsFor")} "${q}"` : t("title") };
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const t = await getTranslations("pages.search");
  return (
    <>
      <div className="k-page-hdr">
        <div className="wrap">
          <p className="page-hd-eyebrow">{t("title")}</p>
          <h1 className="page-hd-title">
            {q ? (
              <>{t("resultsFor")} <em style={{ color: "var(--gold)", fontStyle: "italic" }}>{q}</em></>
            ) : (
              t("title")
            )}
          </h1>
        </div>
      </div>

      <div style={{ paddingTop: 32, paddingBottom: 96 }}>
        <div className="wrap">
          <Suspense key={q ?? ""} fallback={null}>
            <ProductGrid key={q ?? ""} filters={{ search: q ?? "" }} showFilters={true} />
          </Suspense>
        </div>
      </div>

      <TrustBar />
    </>
  );
}
