import { Suspense } from "react";
import { Container, Spinner } from "@/components/ui";
import { ProductGrid } from "@/components/product/ProductGrid";
import { buildMetadata } from "@/lib/seo";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("pages.newArrivals");
  return buildMetadata({ title: t("title") });
}

export default async function NewArrivalsPage() {
  const t = await getTranslations("pages.newArrivals");
  return (
    <>
      <div className="bg-surface-50 dark:bg-surface-900/50 border-b border-surface-100 dark:border-surface-800 py-14">
        <Container className="text-center">
          <div className="text-sm text-brand-500 font-medium uppercase tracking-widest mb-3">{t("badge")}</div>
          <h1 className="font-display text-5xl md:text-6xl text-surface-900 dark:text-white mb-4">{t("title")}</h1>
          <p className="text-surface-500 max-w-md mx-auto">{t("subtitle")}</p>
        </Container>
      </div>
      <Container className="py-12">
        <Suspense fallback={<div className="flex justify-center py-20"><Spinner size={32} /></div>}>
          <ProductGrid filters={{ isNewArrival: true, sort: "newest" }} />
        </Suspense>
      </Container>
    </>
  );
}
