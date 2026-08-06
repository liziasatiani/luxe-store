import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Luxury Tech & Beauty | Everything Street",
  description: "Everything Street — where premium technology meets curated beauty. Discover luxury brands, exclusive products, and same-day delivery.",
};
import { prisma } from "@/lib/prisma";
import { serializeDecimal } from "@/lib/utils";
import { HeroSection } from "@/components/home/HeroSection";
import { AnnouncementBar } from "@/components/home/AnnouncementBar";
import {
  CategoriesSection,
  BestSellersSection,
  BrandsSection,

  TheEditSection,
  HomepageRecentlyViewed,
} from "@/components/home/index";
import {
  FeaturedProductsSection,
  NewArrivalsSection,
  BestSellersSectionServer,
  ProductGridSkeleton,
} from "@/components/home/ServerSections";

export const revalidate = 3600;

export default async function HomePage() {
  type Categories = Awaited<ReturnType<typeof prisma.category.findMany<{ select: { name: true; slug: true; image: true; parent: { select: { slug: true } }; _count: { select: { products: { where: { isActive: true } } } } } }>>>;
  type Brands = Awaited<ReturnType<typeof prisma.brand.findMany<{ select: { name: true; slug: true; logo: true } }>>>;
  let categories: Categories = [];
  let brands: Brands = [];
  let bestSellersData: Awaited<ReturnType<typeof BestSellersSectionServer>> = { title: "", initialProducts: [] };

  try {
    [categories, brands, bestSellersData] = await Promise.all([
      prisma.category.findMany({
        where: { parentId: { not: null }, isActive: true },
        select: {
          name: true, slug: true, image: true,
          parent: { select: { slug: true } },
          _count: { select: { products: { where: { isActive: true } } } },
        },
        orderBy: { sortOrder: "asc" },
        take: 12,
      }),
      prisma.brand.findMany({
        where: { isFeatured: true, isActive: true },
        select: { name: true, slug: true, logo: true },
        orderBy: { sortOrder: "asc" },
        take: 18,
      }),
      BestSellersSectionServer(),
    ]);
  } catch {
    // DB unavailable — render hero and static sections; dynamic sections show empty
  }

  return (
    <>
      <HeroSection />
      <CategoriesSection categories={serializeDecimal(categories)} />
      <Suspense fallback={<div className="py-20 border-b border-black/8 dark:border-white/8"><div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8"><ProductGridSkeleton /></div></div>}>
        <FeaturedProductsSection />
      </Suspense>
      <BestSellersSection initialProducts={bestSellersData.initialProducts} />
      <TheEditSection />
      <BrandsSection brands={serializeDecimal(brands)} />
      <Suspense fallback={<div className="py-20 border-b border-black/8 dark:border-white/8"><div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8"><ProductGridSkeleton /></div></div>}>
        <NewArrivalsSection />
      </Suspense>
      <HomepageRecentlyViewed />
    </>
  );
}
