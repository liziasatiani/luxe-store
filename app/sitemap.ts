import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://everythingstreet.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL,                 lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
    { url: `${BASE_URL}/beauty`,     lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE_URL}/tech`,       lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE_URL}/brands`,     lastModified: new Date(), changeFrequency: "weekly",  priority: 0.7 },
    { url: `${BASE_URL}/deals`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/new`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/best`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/featured`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/about`,      lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/contact`,    lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/faq`,        lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/shipping`,   lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/returns`,    lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/privacy`,    lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/terms`,      lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ];

  let productPages: MetadataRoute.Sitemap = [];
  let categoryPages: MetadataRoute.Sitemap = [];
  let brandPages: MetadataRoute.Sitemap = [];

  try {
    const [products, categories, brands] = await Promise.all([
      prisma.product.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true }, orderBy: { updatedAt: "desc" } }),
      prisma.category.findMany({ where: { isActive: true, parentId: { not: null } }, select: { slug: true, updatedAt: true, parent: { select: { slug: true } } } }),
      prisma.brand.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
    ]);
    productPages = products.map(p => ({ url: `${BASE_URL}/products/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 }));
    categoryPages = categories.map(c => ({ url: `${BASE_URL}/${c.parent?.slug ?? "beauty"}/${c.slug}`, lastModified: c.updatedAt, changeFrequency: "weekly" as const, priority: 0.7 }));
    brandPages = brands.map(b => ({ url: `${BASE_URL}/brands/${b.slug}`, lastModified: b.updatedAt, changeFrequency: "weekly" as const, priority: 0.6 }));
  } catch {
    // DB timeout during build — return static pages only
  }

  return [...staticPages, ...productPages, ...categoryPages, ...brandPages];
}
