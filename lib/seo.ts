import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://everythingstreet.com";
const PRICE_VALID_DAYS = 30;
const SITE_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "Everything Street";

const OG_LOCALE: Record<string, string> = {
  en: "en_US",
  fr: "fr_FR",
  es: "es_ES",
  ka: "ka_GE",
};

interface SeoProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
  noIndex?: boolean;
  locale?: string;
}

export function buildMetadata({
  title,
  description = "Shop luxury beauty, skincare, cosmetics and premium tech. Free shipping on orders over $75.",
  image = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&q=80&auto=format",
  url = BASE_URL,
  type = "website",
  noIndex = false,
  locale = "en",
}: SeoProps = {}): Metadata {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Luxury Beauty & Tech`;

  return {
    title: fullTitle,
    description,
    metadataBase: new URL(BASE_URL),
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true } },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      images: [{ url: image, width: 1200, height: 630, alt: fullTitle }],
      type,
      locale: OG_LOCALE[locale] ?? "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
      creator: "@everythingstreet",
    },
  };
}

export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${BASE_URL}/#organization`,
        name: SITE_NAME,
        url: BASE_URL,
        logo: { "@type": "ImageObject", url: `${BASE_URL}/favicon.svg` },
        sameAs: [],
      },
      {
        "@type": "WebSite",
        "@id": `${BASE_URL}/#website`,
        url: BASE_URL,
        name: SITE_NAME,
        publisher: { "@id": `${BASE_URL}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: `${BASE_URL}/search?q={search_term_string}` },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };
}

export function buildProductSchema(product: {
  name: string;
  description?: string | null;
  price: number;
  comparePrice?: number | null;
  images: Array<{ url: string }>;
  brand?: { name: string } | null;
  ratingAvg: number;
  ratingCount: number;
  stock: number;
  sku: string;
  reviews?: Array<{ rating: number; body: string | null; createdAt: string | Date; user?: { name: string | null } | null }>;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? "",
    image: product.images.map((i) => i.url),
    sku: product.sku,
    brand: product.brand
      ? { "@type": "Brand", name: product.brand.name }
      : undefined,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "USD",
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      priceValidUntil: new Date(Date.now() + PRICE_VALID_DAYS * 86400000)
        .toISOString()
        .split("T")[0],
      seller: { "@type": "Organization", name: SITE_NAME },
    },
    aggregateRating:
      product.ratingCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.ratingAvg,
            reviewCount: product.ratingCount,
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
    review: product.reviews?.slice(0, 5).map((r) => ({
      "@type": "Review",
      reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
      author: { "@type": "Person", name: r.user?.name ?? "Verified Buyer" },
      reviewBody: r.body ?? "",
      datePublished: new Date(r.createdAt).toISOString().split("T")[0],
    })),
  };
}

export function buildBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${BASE_URL}${item.url}`,
    })),
  };
}

