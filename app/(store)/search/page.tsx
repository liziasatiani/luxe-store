import { Suspense } from "react";
import { Container } from "@/components/ui";
import { ProductGrid } from "@/components/product/ProductGrid";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

interface Props { searchParams: { q?: string } }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  return buildMetadata({ title: searchParams.q ? `Search: ${searchParams.q}` : "Search", noIndex: true });
}

export default function SearchPage({ searchParams }: Props) {
  const q = searchParams.q ?? "";
  return (
    <Container className="py-12">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-surface-900 dark:text-white">
          {q ? <>Results for "<span className="text-brand-500">{q}</span>"</> : "Search"}
        </h1>
      </div>
      <Suspense fallback={null}>
        <ProductGrid filters={{ search: q }} showFilters={true} />
      </Suspense>
    </Container>
  );
}
