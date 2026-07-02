import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const revalidate = 3600;
import { ProductGrid } from "@/components/product/ProductGrid";
import { Container } from "@/components/ui";
import { SubcategoryNav } from "@/components/ui/SubcategoryNav";
import { TrustBar } from "@/components/ui/TrustBar";
import { getLocale } from "next-intl/server";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = await prisma.category.findUnique({ where: { slug }, include: { parent: true } });
  if (!cat) return {};
  const locale = await getLocale();
  return buildMetadata({ title: cat.name, description: cat.description ?? undefined, locale });
}

export default async function BeautySubcategoryPage({ params }: Props) {
  const { slug } = await params;

  const [category, subcategories] = await Promise.all([
    prisma.category.findUnique({
      where: { slug, isActive: true },
      include: { parent: true, _count: { select: { products: { where: { isActive: true } } } } },
    }),
    prisma.category.findMany({
      where: { parent: { slug: "beauty" }, isActive: true },
      select: { name: true, slug: true, _count: { select: { products: { where: { isActive: true } } } } },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  if (!category) notFound();

  return (
    <>
      <div className="border-b border-black/8 dark:border-white/8 py-16">
        <Container className="text-center">
          <p className="text-[10px] tracking-[0.28em] uppercase text-black/30 dark:text-white/30 mb-4">Beauty</p>
          <h1 className="font-display text-5xl md:text-6xl text-black dark:text-white font-light mb-4">{category.name}</h1>
          <p className="text-sm text-black/40 dark:text-white/40 max-w-md mx-auto">{category._count.products} products</p>
        </Container>
      </div>

      <Container className="py-12">
        <SubcategoryNav
          basePath="/beauty"
          all={{ label: "All Beauty", href: "/beauty", active: false }}
          subcategories={subcategories.map(sc => ({ name: sc.name, slug: sc.slug, count: sc._count.products }))}
          activeSlug={slug}
        />
        <ProductGrid filters={{ categorySlug: slug }} />
      </Container>
      <TrustBar />
    </>
  );
}
