import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const revalidate = 3600;
import { ProductGrid } from "@/components/product/ProductGrid";
import { Container } from "@/components/ui";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = await prisma.category.findUnique({ where: { slug }, include: { parent: true } });
  if (!cat) return {};
  return buildMetadata({ title: cat.name, description: cat.description ?? undefined });
}

export default async function BeautySubcategoryPage({ params }: Props) {
  const { slug } = await params;

  const category = await prisma.category.findUnique({
    where: { slug, isActive: true },
    include: { parent: true, _count: { select: { products: { where: { isActive: true } } } } },
  });
  if (!category) notFound();

  const breadcrumbs = [
    { name: "Home", url: "/" },
    ...(category.parent ? [{ name: category.parent.name, url: `/${category.parent.slug}` }] : []),
    { name: category.name, url: `/${category.slug}` },
  ];

  return (
    <>
      <div className="border-b border-black/8 dark:border-white/8 py-12">
        <Container>
          <Breadcrumbs items={breadcrumbs} />
          <h1 className="font-display text-4xl md:text-5xl text-black dark:text-white font-light mt-4">{category.name}</h1>
          <p className="text-[11px] tracking-[0.08em] uppercase text-black/40 dark:text-white/40 mt-2">{category._count.products} products</p>
        </Container>
      </div>
      <Container className="py-10">
        <ProductGrid filters={{ categorySlug: slug }} />
      </Container>
    </>
  );
}
