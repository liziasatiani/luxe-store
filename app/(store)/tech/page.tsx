import { prisma } from "@/lib/prisma";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Container } from "@/components/ui";
import { buildMetadata } from "@/lib/seo";
import Link from "next/link";

export const metadata = buildMetadata({ title: "Tech", description: "Shop premium headphones, cameras, tablets, gaming gear, wearables and smart home devices." });

export default async function TechPage() {
  const subcategories = await prisma.category.findMany({
    where: { parent: { slug: "tech" }, isActive: true },
    select: { name: true, slug: true, _count: { select: { products: { where: { isActive: true } } } } },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <>
      <div className="bg-surface-950 text-white py-14">
        <Container className="text-center">
          <p className="text-brand-400 text-sm font-medium uppercase tracking-widest mb-3">Collection</p>
          <h1 className="font-display text-5xl md:text-6xl mb-4">Tech</h1>
          <p className="text-surface-400 max-w-md mx-auto">Premium electronics and gadgets engineered for those who demand the best.</p>
        </Container>
      </div>
      <Container className="py-12">
        <div className="flex flex-wrap gap-3 mb-10">
          <Link href="/tech" className="px-5 py-2.5 rounded-full bg-surface-900 dark:bg-white text-white dark:text-surface-900 text-sm font-medium">All Tech</Link>
          {subcategories.map(sc => (
            <Link key={sc.slug} href={`/tech/${sc.slug}`} className="px-5 py-2.5 rounded-full border border-surface-200 dark:border-surface-700 text-sm font-medium text-surface-700 dark:text-surface-300 hover:border-brand-500 hover:text-brand-500 transition-colors">
              {sc.name} <span className="text-surface-400 ml-1">({sc._count.products})</span>
            </Link>
          ))}
        </div>
        <ProductGrid filters={{ categorySlug: "tech" }} />
      </Container>
    </>
  );
}
