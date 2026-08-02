export const revalidate = 3600;
import { prisma } from "@/lib/prisma";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Container } from "@/components/ui";
import { SubcategoryNav } from "@/components/ui/SubcategoryNav";
import { TrustBar } from "@/components/ui/TrustBar";
import { getLocale } from "next-intl/server";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const locale = await getLocale();
  return buildMetadata({ title: "Tech", description: "Shop premium headphones, cameras, tablets, gaming gear, wearables and smart home devices.", locale });
}

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
        <SubcategoryNav
          basePath="/tech"
          all={{ label: "All Tech", href: "/tech", active: true }}
          subcategories={subcategories.map(sc => ({ name: sc.name, slug: sc.slug, count: sc._count.products }))}
        />
        <ProductGrid filters={{ categorySlug: "tech" }} />
      </Container>
      <TrustBar />
    </>
  );
}
