import { prisma } from "@/lib/prisma";
import { serializeDecimal } from "@/lib/utils";
import { HeroSection } from "@/components/home/HeroSection";
import {
  CategoriesSection,
  FeaturedProductsSection,
  FlashSaleSection,
  BestSellersSection,
  BrandsSection,
  TestimonialsSection,
  NewsletterSection,
  NewArrivalsSection,
} from "@/components/home/index";

export const revalidate = 3600; // ISR every hour

export default async function HomePage() {
  const [categories, brands] = await Promise.all([
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
  ]);

  return (
    <>
      <HeroSection />
      <CategoriesSection categories={serializeDecimal(categories)} />
      <FeaturedProductsSection />
      <FlashSaleSection />
      <BestSellersSection />
      <BrandsSection brands={serializeDecimal(brands)} />
      <NewArrivalsSection />
      <TestimonialsSection />
      <NewsletterSection />
    </>
  );
}
