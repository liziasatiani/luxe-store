import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { serializeDecimal } from "@/lib/utils";
import { HeroSection } from "@/components/home/HeroSection";
import { PressBar } from "@/components/home/PressBar";
import {
  CategoriesSection,
  FlashSaleSection,
  BestSellersSection,
  BrandsSection,
  TestimonialsSection,
  NewsletterSection,
} from "@/components/home/index";
import {
  FeaturedProductsSection,
  NewArrivalsSection,
  BestSellersSectionServer,
  ProductGridSkeleton,
} from "@/components/home/ServerSections";

export const revalidate = 3600;

export default async function HomePage() {
  const [categories, brands, bestSellersData] = await Promise.all([
    prisma.category.findMany({
      where: { parentId: { not: null }, isActive: true },
      select: {
        name: true, slug: true, image: true,
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

  return (
    <>
      <HeroSection />
      <PressBar />
      <CategoriesSection categories={serializeDecimal(categories)} />
      <Suspense fallback={<div className="py-20 border-b border-black/8 dark:border-white/8"><div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8"><ProductGridSkeleton /></div></div>}>
        <FeaturedProductsSection />
      </Suspense>
      <FlashSaleSection />
      <BestSellersSection initialProducts={bestSellersData.initialProducts} />
      <BrandsSection brands={serializeDecimal(brands)} />
      <Suspense fallback={<div className="py-20 border-b border-black/8 dark:border-white/8"><div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8"><ProductGridSkeleton /></div></div>}>
        <NewArrivalsSection />
      </Suspense>
      <TestimonialsSection />
      <NewsletterSection />
    </>
  );
}
