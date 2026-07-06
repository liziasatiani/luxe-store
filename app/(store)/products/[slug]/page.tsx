import { notFound } from "next/navigation";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { serializeDecimal, formatPrice, formatDiscount, getStockLabel } from "@/lib/utils";
import { buildMetadata, buildProductSchema, buildBreadcrumbSchema } from "@/lib/seo";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductCard } from "@/components/product/ProductCard";
import { AddToCartSection } from "@/components/product/AddToCartSection";
import { ReviewsSection } from "@/components/product/ReviewsSection";
import { Badge, RatingStars, Container } from "@/components/ui";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import Link from "next/link";
import type { Metadata } from "next";
import type { ProductCard as ProductCardType } from "@/types";

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug, isActive: true },
    include: { images: { take: 1 }, brand: true, category: true },
  });
  if (!product) return {};
  return buildMetadata({
    title: product.name,
    description: product.shortDescription ?? product.description ?? undefined,
    image: product.images[0]?.url,
  });
}

export default async function ProductPage({ params }: Props) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug, isActive: true },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      brand: true,
      category: { include: { parent: true } },
      specifications: { orderBy: { sortOrder: "asc" } },
      variants: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
      reviews: {
        where: { isApproved: true },
        include: { user: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!product) notFound();

  const related = await prisma.product.findMany({
    where: { isActive: true, categoryId: product.categoryId, id: { not: product.id } },
    select: {
      id: true, name: true, slug: true, price: true, comparePrice: true,
      stockStatus: true, stock: true, ratingAvg: true, ratingCount: true,
      isFeatured: true, isBestSeller: true, isNewArrival: true, isOnSale: true, brandId: true,
      images: { where: { isPrimary: true }, take: 1, select: { url: true, isPrimary: true, altText: true } },
      brand: { select: { name: true, slug: true } },
      category: { select: { name: true, slug: true } },
    },
    take: 8,
    orderBy: { salesCount: "desc" },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = serializeDecimal(product) as any;
  const discount = p.comparePrice ? formatDiscount(Number(p.comparePrice), Number(p.price)) : 0;
  const stockInfo = getStockLabel(p.stock);

  const breadcrumbs = [
    { name: "Home", url: "/" },
    ...(p.category.parent ? [{ name: p.category.parent.name, url: `/${p.category.parent.slug}` }] : []),
    { name: p.category.name, url: `/${p.category.slug}` },
    { name: p.name, url: `/products/${p.slug}` },
  ];

  const relatedSerialized = serializeDecimal(related) as ProductCardType[];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildProductSchema({ ...p, brand: p.brand })) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbSchema(breadcrumbs)) }}
      />

      <Container className="py-8">
        <Breadcrumbs items={breadcrumbs} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-8">
          <ProductGallery images={p.images} productName={p.name} />

          <div className="space-y-6">
            <div className="flex items-center gap-3 flex-wrap">
              {p.brand && (
                <Link href={`/brands/${p.brand.slug}`} className="text-sm font-medium text-brand-500 hover:text-brand-600 uppercase tracking-wider">
                  {p.brand.name}
                </Link>
              )}
              {p.isNewArrival && <Badge variant="gold">New Arrival</Badge>}
              {p.isBestSeller && <Badge variant="default">Best Seller</Badge>}
              {discount > 0 && <Badge variant="error">-{discount}% Off</Badge>}
            </div>

            <h1 className="font-display text-3xl md:text-4xl text-surface-900 dark:text-white leading-tight">
              {p.name}
            </h1>

            <div className="flex items-center gap-3">
              <RatingStars rating={Number(p.ratingAvg)} count={p.ratingCount} size={16} />
              <a href="#reviews" className="text-sm text-surface-400 hover:text-brand-500 transition-colors">
                {p.ratingCount} reviews
              </a>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="font-display text-4xl text-surface-900 dark:text-white">
                {formatPrice(Number(p.price))}
              </span>
              {p.comparePrice && Number(p.comparePrice) > Number(p.price) && (
                <span className="text-xl text-surface-400 line-through">{formatPrice(Number(p.comparePrice))}</span>
              )}
            </div>

            <p className={`text-sm font-medium ${stockInfo.color}`}>{stockInfo.label}</p>

            {p.shortDescription && (
              <p className="text-surface-600 dark:text-surface-400 leading-relaxed">{p.shortDescription}</p>
            )}

            <AddToCartSection product={p} />

            {p.specifications.length > 0 && (
              <div className="rounded-2xl border border-surface-100 dark:border-surface-800 overflow-hidden">
                {p.specifications.slice(0, 4).map((spec: { name: string; value: string }, i: number) => (
                  <div key={i} className={`flex items-center gap-4 px-5 py-3 ${i % 2 === 0 ? "bg-surface-50 dark:bg-surface-800/50" : ""}`}>
                    <span className="text-sm text-surface-500 w-32 shrink-0">{spec.name}</span>
                    <span className="text-sm text-surface-900 dark:text-white font-medium">{spec.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            {p.description && (
              <div>
                <h2 className="font-display text-2xl text-surface-900 dark:text-white mb-4">About this product</h2>
                <p className="text-surface-600 dark:text-surface-400 leading-relaxed whitespace-pre-wrap">{p.description}</p>
              </div>
            )}

            {p.specifications.length > 0 && (
              <div>
                <h2 className="font-display text-2xl text-surface-900 dark:text-white mb-4">Specifications</h2>
                <div className="rounded-2xl border border-surface-100 dark:border-surface-800 overflow-hidden">
                  {p.specifications.map((spec: { name: string; value: string }, i: number) => (
                    <div key={i} className={`flex items-center gap-4 px-5 py-3.5 ${i % 2 === 0 ? "bg-surface-50 dark:bg-surface-800/50" : ""}`}>
                      <span className="text-sm text-surface-500 w-40 shrink-0">{spec.name}</span>
                      <span className="text-sm text-surface-900 dark:text-white">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-surface-100 dark:border-surface-800 p-5 space-y-3">
              {[
                { icon: "🚚", label: "Free shipping on orders over $75" },
                { icon: "↩️", label: "30-day hassle-free returns" },
                { icon: "✓",  label: "100% authentic products" },
                { icon: "🔒", label: "Secure checkout" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 text-sm text-surface-600 dark:text-surface-400">
                  <span>{item.icon}</span>
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div id="reviews" className="mt-16">
          <Suspense fallback={null}>
            <ReviewsSection
              productId={p.id}
              initialReviews={p.reviews}
              avgRating={Number(p.ratingAvg)}
              reviewCount={p.ratingCount}
            />
          </Suspense>
        </div>

        {relatedSerialized.length > 0 && (
          <div className="mt-20">
            <h2 className="font-display text-3xl text-surface-900 dark:text-white mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {relatedSerialized.map((rp, i) => (
                <ProductCard key={rp.id} product={rp} index={i} />
              ))}
            </div>
          </div>
        )}
      </Container>
    </>
  );
}
