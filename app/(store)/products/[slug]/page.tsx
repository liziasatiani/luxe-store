import { notFound } from "next/navigation";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { serializeDecimal, formatDiscount, jsonLdSafe } from "@/lib/utils";
import { getLocale, getTranslations } from "next-intl/server";
import { buildMetadata, buildProductSchema, buildBreadcrumbSchema } from "@/lib/seo";
import { ProductGallery } from "@/components/product/ProductGallery";
import { RelatedProducts, RelatedProductsSkeleton } from "@/components/product/RelatedProducts";
import { AddToCartSection } from "@/components/product/AddToCartSection";
import { ReviewsSection } from "@/components/product/ReviewsSection";
import { RecentlyViewed } from "@/components/product/RecentlyViewed";
import { TrackView } from "@/components/product/TrackView";
import { RatingStars } from "@/components/ui";
import { Price } from "@/components/ui";
import Link from "next/link";
import { ProductBreadcrumb } from "@/components/product/ProductBreadcrumb";
import type { Metadata } from "next";

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: { images: { take: 1 }, brand: true, category: true },
  });
  if (!product) return {};
  const locale = await getLocale();
  return buildMetadata({
    title: product.name,
    description: product.shortDescription ?? product.description ?? undefined,
    image: product.images[0]?.url,
    locale,
  });
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
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

  const _p = serializeDecimal(product);
  const p = _p as typeof _p & {
    howToUse?: string | null; ingredients?: string | null; inTheBox?: string | null;
    description_ka?: string | null; description_fr?: string | null; description_es?: string | null;
    howToUse_ka?: string | null; howToUse_fr?: string | null; howToUse_es?: string | null;
    inTheBox_ka?: string | null; inTheBox_fr?: string | null; inTheBox_es?: string | null;
  };
  const discount = p.comparePrice ? formatDiscount(Number(p.comparePrice), Number(p.price)) : 0;

  const locale = await getLocale();
  const tProduct = await getTranslations("product");
  const tCommon = await getTranslations("common");

  const localizedDescription = (locale === "ka" ? p.description_ka : locale === "fr" ? p.description_fr : locale === "es" ? p.description_es : null) ?? p.shortDescription ?? p.description;
  const localizedHowToUse = (locale === "ka" ? p.howToUse_ka : locale === "fr" ? p.howToUse_fr : locale === "es" ? p.howToUse_es : null) ?? p.howToUse;
  const localizedInTheBox = (locale === "ka" ? p.inTheBox_ka : locale === "fr" ? p.inTheBox_fr : locale === "es" ? p.inTheBox_es : null) ?? p.inTheBox;

  const breadcrumbs = [
    { name: tCommon("home"), url: "/" },
    ...(p.category.parent ? [{ name: p.category.parent.name, url: `/${p.category.parent.slug}` }] : []),
    { name: p.category.name, url: `/${p.category.slug}` },
    { name: p.name, url: `/products/${p.slug}` },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSafe(buildProductSchema({ ...p, brand: p.brand, reviews: p.reviews })) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSafe(buildBreadcrumbSchema(breadcrumbs)) }} />

      {/* K .dlayout — 2-col grid, full viewport */}
      <div className="dlayout" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", maxWidth: 1400, margin: "0 auto", paddingTop: "var(--nav-h)", minHeight: "calc(100vh - var(--nav-h))" }}>

        {/* Left: sticky gallery */}
        <ProductGallery images={p.images} productName={p.name} />

        {/* Right: .dinfo — scrollable info panel */}
        <div style={{ padding: "60px 56px", overflowY: "auto", borderLeft: "1px solid var(--border)" }}>

          {/* .dcrumb */}
          <ProductBreadcrumb crumbs={breadcrumbs} />

          {/* .dbrand */}
          {p.brand && (
            <Link href={`/brands/${p.brand.slug}`} style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 12 }}>
              {p.brand.name}
            </Link>
          )}

          {/* .dname */}
          <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(26px,2.5vw,40px)", fontWeight: 700, lineHeight: 1.1, marginBottom: 22, color: "var(--chalk)", whiteSpace: "pre-line" }}>
            {p.name}
          </h1>

          {/* Rating */}
          <div style={{ marginBottom: 5 }}>
            <RatingStars rating={Number(p.ratingAvg)} count={p.ratingCount} size={13} />
          </div>
          <a href="#reviews" style={{ fontSize: 12, color: "var(--chalk2)", display: "block", marginBottom: 32, transition: "color 0.2s" }}>
            {p.ratingCount} {tProduct("reviews")}
          </a>

          {/* .dprice */}
          <div style={{ fontFamily: "var(--sans)", fontSize: 38, fontWeight: 500, marginBottom: 7, color: "var(--chalk)" }}>
            <Price amount={Number(p.price)} />
          </div>
          {p.comparePrice && Number(p.comparePrice) > Number(p.price) && (
            <div style={{ fontSize: 16, color: "var(--chalk2)", textDecoration: "line-through", marginBottom: 36 }}>
              <Price amount={Number(p.comparePrice)} />
            </div>
          )}

          {/* Badges */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 32 }}>
            {p.isNewArrival && (
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", padding: "5px 12px", background: "var(--gold)", color: "#000", borderRadius: 1 }}>New</span>
            )}
            {discount > 0 && (
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", padding: "5px 12px", background: "#dc2626", color: "#fff", borderRadius: 1 }}>-{discount}%</span>
            )}
          </div>

          <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "0 0 32px" }} />

          {/* Add to cart section */}
          <AddToCartSection product={p} />

          <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "32px 0" }} />

          {/* Description */}
          {localizedDescription && (
            <div style={{ marginBottom: 32 }}>
              <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--chalk2)", marginBottom: 12 }}>{tProduct("aboutProduct")}</p>
              <p style={{ fontSize: 14, color: "var(--chalk2)", lineHeight: 1.75, whiteSpace: "pre-line" }}>
                {localizedDescription}
              </p>
            </div>
          )}

          {/* How to Use — beauty */}
          {localizedHowToUse && (
            <div style={{ marginBottom: 32 }}>
              <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--chalk2)", marginBottom: 12 }}>{tProduct("howToUse")}</p>
              <p style={{ fontSize: 14, color: "var(--chalk2)", lineHeight: 1.75, whiteSpace: "pre-line" }}>{localizedHowToUse}</p>
            </div>
          )}

          {/* Ingredients — beauty (INCI names are universal, always shown in English) */}
          {p.ingredients && (
            <div style={{ marginBottom: 32 }}>
              <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--chalk2)", marginBottom: 12 }}>{tProduct("ingredients")}</p>
              <p style={{ fontSize: 13, color: "var(--chalk2)", lineHeight: 1.8, opacity: 0.85, whiteSpace: "pre-line" }}>{p.ingredients}</p>
            </div>
          )}

          {/* What's in the Box — tech */}
          {localizedInTheBox && (
            <div style={{ marginBottom: 32 }}>
              <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--chalk2)", marginBottom: 12 }}>{tProduct("inTheBox")}</p>
              <p style={{ fontSize: 14, color: "var(--chalk2)", lineHeight: 1.75, whiteSpace: "pre-line" }}>{localizedInTheBox}</p>
            </div>
          )}

          {/* Info strip — always shown */}
          <div style={{ marginBottom: 32 }}>
            {[
              { label: tProduct("brand"),        value: p.brand?.name },
              { label: tProduct("category"),     value: p.category?.name ?? p.category.name },
              { label: tProduct("availability"), value: p.stockStatus === "IN_STOCK" ? tProduct("inStock") : p.stockStatus === "LOW_STOCK" ? "Low Stock" : tProduct("outOfStockLabel"), gold: p.stockStatus !== "OUT_OF_STOCK" },
              { label: tProduct("returnPolicy"), value: tProduct("returnPolicyValue") },
            ].filter(r => r.value).map((row, i) => (
              <div key={i} style={{ display: "flex", padding: "13px 0", borderBottom: "1px solid var(--border)", gap: 16 }}>
                <span style={{ fontSize: 12, color: "var(--chalk2)", minWidth: 130, flexShrink: 0 }}>{row.label}</span>
                <span style={{ fontSize: 13, color: row.gold ? "var(--gold)" : "var(--chalk)" }}>{row.value}</span>
              </div>
            ))}
          </div>

          {/* Specifications */}
          {p.specifications.length > 0 && (
            <div>
              <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--chalk2)", marginBottom: 16 }}>{tProduct("specifications")}</p>
              {p.specifications.map((spec: { name: string; value: string }, i: number) => (
                <div key={i} style={{ display: "flex", padding: "13px 0", borderBottom: "1px solid var(--border)", gap: 16 }}>
                  <span style={{ fontSize: 12, color: "var(--chalk2)", minWidth: 130, flexShrink: 0 }}>{spec.name}</span>
                  <span style={{ fontSize: 13, fontWeight: 400, color: "var(--chalk)", whiteSpace: "pre-line" }}>{spec.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reviews + related — full width below the grid */}
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "80px 52px", borderTop: "1px solid var(--border)" }}>
        <div id="reviews">
          <Suspense fallback={null}>
            <ReviewsSection productId={p.id} initialReviews={p.reviews} avgRating={Number(p.ratingAvg)} reviewCount={p.ratingCount} />
          </Suspense>
        </div>
        <Suspense fallback={<RelatedProductsSkeleton />}>
          <RelatedProducts productId={p.id} categoryId={p.categoryId} price={Number(p.price)} />
        </Suspense>
      </div>

      <TrackView product={p} />
      <RecentlyViewed currentProductId={p.id} />
    </>
  );
}
