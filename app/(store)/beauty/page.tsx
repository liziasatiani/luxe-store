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
      <div className="border-b border-black/8 dark:border-white/8 py-16">
        <Container className="text-center">
          <p className="text-[10px] tracking-[0.28em] uppercase text-black/30 dark:text-white/30 mb-4">Collection</p>
          <h1 className="font-display text-5xl md:text-6xl text-black dark:text-white font-light mb-4">Beauty</h1>
          <p className="text-sm text-black/40 dark:text-white/40 max-w-md mx-auto">Luxury skincare, makeup, and fragrance from the world&apos;s most coveted brands.</p>
        </Container>
      </div>

      <Container className="py-12">
        <div className="flex flex-wrap gap-2 mb-10">
          <Link href="/beauty" className="h-9 px-5 flex items-center bg-black dark:bg-white text-white dark:text-black text-[10px] tracking-[0.12em] uppercase font-medium">All Beauty</Link>
          {subcategories.map(sc => (
            <Link key={sc.slug} href={`/beauty/${sc.slug}`} className="h-9 px-5 flex items-center border border-black/15 dark:border-white/15 text-[10px] tracking-[0.12em] uppercase text-black/60 dark:text-white/60 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white transition-colors">
              {sc.name} <span className="text-black/30 dark:text-white/30 ml-1.5">({sc._count.products})</span>
            </Link>
          ))}
        </div>

        <ProductGrid filters={{ categorySlug: "beauty" }} />
      </Container>
    </>
  );
}
