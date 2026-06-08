import { Suspense } from "react";
import { Container } from "@/components/ui";
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
    <Container className="py-12">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-surface-900 dark:text-white">
          {q ? <>{t("resultsFor")} "<span className="text-brand-500">{q}</span>"</> : t("title")}
        </h1>
      </div>
      <Suspense fallback={null}>
        <ProductGrid filters={{ search: q ?? "" }} showFilters={true} />
      </Suspense>
    </Container>
  );
}
