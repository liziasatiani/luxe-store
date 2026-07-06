import { prisma } from "@/lib/prisma";
import { Container, SectionHeader } from "@/components/ui";
import { buildMetadata } from "@/lib/seo";
import Link from "next/link";

export const metadata = buildMetadata({ title: "Brands", description: "Explore all luxury beauty and premium tech brands at Luxe Store." });

export default async function BrandsPage() {
  const brands = await prisma.brand.findMany({
    where: { isActive: true },
    select: { name: true, slug: true, description: true, logo: true, website: true, _count: { select: { products: { where: { isActive: true } } } } },
    orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
  });

  const beautyBrands = brands.filter(b => ["La Mer","Charlotte Tilbury","Drunk Elephant","NARS","Tatcha","Dior Beauty","Chanel Beauty","YSL Beauty","Tom Ford Beauty","Sulwhasoo","Sisley Paris","Augustinus Bader","Dyson Beauty","FOREO","GHD","Creed","Jo Malone","Maison Margiela"].includes(b.name));
  const techBrands = brands.filter(b => !beautyBrands.includes(b));

  return (
    <Container className="py-16">
      <SectionHeader title="All Brands" subtitle="Curated from the world's finest houses" />
      
      {[{ title: "Beauty Brands", items: beautyBrands }, { title: "Tech Brands", items: techBrands }].map(group => (
        <div key={group.title} className="mb-14">
          <h2 className="font-display text-2xl text-surface-900 dark:text-white mb-6 pb-3 border-b border-surface-100 dark:border-surface-800">{group.title}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {group.items.map(brand => (
              <Link
                key={brand.slug}
                href={`/brands/${brand.slug}`}
                className="group flex flex-col items-center gap-2 p-5 rounded-2xl border border-surface-100 dark:border-surface-800 bg-white dark:bg-surface-900 hover:border-brand-200 dark:hover:border-brand-700 hover:shadow-luxury transition-all text-center"
              >
                <div className="w-12 h-12 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-lg font-display font-bold text-surface-600 dark:text-surface-400 group-hover:text-brand-500 transition-colors">
                  {brand.name[0]}
                </div>
                <div>
                  <p className="font-medium text-sm text-surface-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{brand.name}</p>
                  <p className="text-xs text-surface-400">{brand._count.products} products</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </Container>
  );
}
