import { prisma } from "@/lib/prisma";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Container } from "@/components/ui";
import { TrustBar } from "@/components/ui/TrustBar";
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
      <div className="border-b border-black/8 dark:border-white/8 py-16">
        <Container className="text-center">
          <p className="text-[10px] tracking-[0.28em] uppercase text-black/30 dark:text-white/30 mb-4">Collection</p>
          <h1 className="font-display text-5xl md:text-6xl text-black dark:text-white font-light mb-4">Tech</h1>
          <p className="text-sm text-black/40 dark:text-white/40 max-w-md mx-auto">Premium electronics and gadgets engineered for those who demand the best.</p>
        </Container>
      </div>
      <Container className="py-12">
        <div className="flex flex-wrap gap-2 mb-10">
          <Link href="/tech" className="h-9 px-5 flex items-center bg-black dark:bg-white text-white dark:text-black text-[10px] tracking-[0.12em] uppercase font-medium">All Tech</Link>
          {subcategories.map(sc => (
            <Link key={sc.slug} href={`/tech/${sc.slug}`} className="h-9 px-5 flex items-center border border-black/15 dark:border-white/15 text-[10px] tracking-[0.12em] uppercase text-black/60 dark:text-white/60 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white transition-colors">
              {sc.name} <span className="text-black/30 dark:text-white/30 ml-1.5">({sc._count.products})</span>
            </Link>
          ))}
        </div>
        <ProductGrid filters={{ categorySlug: "tech" }} />
      </Container>
      <TrustBar />
    </>
  );
}
