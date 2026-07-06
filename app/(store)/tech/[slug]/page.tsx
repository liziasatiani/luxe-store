import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Container } from "@/components/ui";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cat = await prisma.category.findUnique({ where: { slug: params.slug }, include: { parent: true } });
  if (!cat) return {};
  return buildMetadata({ title: cat.name, description: cat.description ?? undefined });
}

export default async function SubcategoryPage({ params }: Props) {
  const category = await prisma.category.findUnique({
    where: { slug: params.slug, isActive: true },
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
      <div className="bg-surface-50 dark:bg-surface-900/50 border-b border-surface-100 dark:border-surface-800 py-10">
        <Container>
          <Breadcrumbs items={breadcrumbs} />
          <h1 className="font-display text-4xl md:text-5xl text-surface-900 dark:text-white mt-4">{category.name}</h1>
          <p className="text-surface-500 mt-2">{category._count.products} products</p>
        </Container>
      </div>
      <Container className="py-10">
        <ProductGrid filters={{ categorySlug: params.slug }} />
      </Container>
    </>
  );
}
