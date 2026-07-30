import { prisma } from "@/lib/prisma";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Container, SectionHeader } from "@/components/ui";
import { buildMetadata } from "@/lib/seo";
import Link from "next/link";
import Image from "next/image";

export const metadata = buildMetadata({ title: "Beauty", description: "Shop luxury skincare, makeup, hair care, perfume and beauty tools from the world's most coveted brands." });

export default async function BeautyPage() {
  const subcategories = await prisma.category.findMany({
    where: { parent: { slug: "beauty" }, isActive: true },
    select: { name: true, slug: true, image: true, _count: { select: { products: { where: { isActive: true } } } } },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <>
      {/* Hero */}
      <div className="bg-surface-50 dark:bg-surface-900/50 border-b border-surface-100 dark:border-surface-800 py-14">
        <Container className="text-center">
          <p className="text-brand-500 text-sm font-medium uppercase tracking-widest mb-3">Collection</p>
          <h1 className="font-display text-5xl md:text-6xl text-surface-900 dark:text-white mb-4">Beauty</h1>
          <p className="text-surface-500 max-w-md mx-auto">Luxury skincare, makeup, and fragrance from the world's most coveted brands.</p>
        </Container>
      </div>

      <Container className="py-12">
        {/* Subcategory pills */}
        <div className="flex flex-wrap gap-3 mb-10">
          <Link href="/beauty" className="px-5 py-2.5 rounded-full bg-surface-900 dark:bg-white text-white dark:text-surface-900 text-sm font-medium">All Beauty</Link>
          {subcategories.map(sc => (
            <Link key={sc.slug} href={`/beauty/${sc.slug}`} className="px-5 py-2.5 rounded-full border border-surface-200 dark:border-surface-700 text-sm font-medium text-surface-700 dark:text-surface-300 hover:border-brand-500 hover:text-brand-500 transition-colors">
              {sc.name} <span className="text-surface-400 ml-1">({sc._count.products})</span>
            </Link>
          ))}
        </div>

        <ProductGrid filters={{ categorySlug: "beauty" }} />
      </Container>
    </>
  );
}
