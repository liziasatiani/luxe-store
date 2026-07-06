import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Container } from "@/components/ui";
import { buildMetadata } from "@/lib/seo";
import { ExternalLink } from "lucide-react";
import type { Metadata } from "next";

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const brand = await prisma.brand.findUnique({ where: { slug: params.slug } });
  if (!brand) return {};
  return buildMetadata({ title: brand.name, description: brand.description ?? `Shop all ${brand.name} products at Luxe Store.` });
}

export default async function BrandPage({ params }: Props) {
  const brand = await prisma.brand.findUnique({
    where: { slug: params.slug, isActive: true },
    include: { _count: { select: { products: { where: { isActive: true } } } } },
  });
  if (!brand) notFound();

  return (
    <>
      <div className="bg-surface-50 dark:bg-surface-900/50 border-b border-surface-100 dark:border-surface-800 py-14">
        <Container className="text-center">
          <div className="w-20 h-20 rounded-full bg-white dark:bg-surface-800 shadow-luxury flex items-center justify-center mx-auto mb-5 text-3xl font-display font-bold text-surface-700 dark:text-surface-300">
            {brand.name[0]}
          </div>
          <h1 className="font-display text-4xl md:text-5xl text-surface-900 dark:text-white mb-3">{brand.name}</h1>
          {brand.description && <p className="text-surface-500 max-w-lg mx-auto mb-4">{brand.description}</p>}
          <div className="flex items-center justify-center gap-4">
            <span className="text-sm text-surface-400">{brand._count.products} products</span>
            {brand.website && (
              <a href={brand.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-brand-500 hover:text-brand-600">
                Visit Brand <ExternalLink size={14} />
              </a>
            )}
          </div>
        </Container>
      </div>
      <Container className="py-12">
        <ProductGrid filters={{ brandSlugs: [params.slug] }} />
      </Container>
    </>
  );
}
