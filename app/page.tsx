import type { Metadata } from "next";
import { Suspense } from "react";
import { HeroSection } from "@/components/home/HeroSection";
import { StatsSection } from "@/components/home/StatsSection";
import { TheEditSection } from "@/components/home/TheEditSection";
import { BrandStatement } from "@/components/home/BrandStatement";
import { TheHousesSection } from "@/components/home/TheHousesSection";
import { EditorialPanels } from "@/components/home/EditorialPanels";
import { BeautyEditorial } from "@/components/home/BeautyEditorial";
import { NewsletterK } from "@/components/home/NewsletterK";
import {
  FeaturedProductsSection,
  NewArrivalsSection,
  TheStandardSection,
  ProductGridSkeleton,
} from "@/components/home/ServerSections";

export const metadata: Metadata = {
  title: "Luxury Tech & Beauty | Everything Street",
  description: "Everything Street — where premium technology meets curated beauty. Discover luxury brands, exclusive products, and same-day delivery.",
};

export const revalidate = 3600;

export default async function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <TheEditSection />
      <BrandStatement />
      <Suspense fallback={
        <div className="py-20" style={{ borderBottom: "1px solid rgba(239,233,218,0.08)" }}>
          <div className="max-w-[1400px] mx-auto px-[52px]"><ProductGridSkeleton /></div>
        </div>
      }>
        <TheStandardSection />
      </Suspense>
      <TheHousesSection />
      <Suspense fallback={
        <div className="py-20" style={{ borderBottom: "1px solid rgba(239,233,218,0.08)" }}>
          <div className="max-w-[1400px] mx-auto px-[52px]"><ProductGridSkeleton /></div>
        </div>
      }>
        <NewArrivalsSection />
      </Suspense>
      <EditorialPanels />
      <Suspense fallback={
        <div className="py-20" style={{ borderBottom: "1px solid rgba(239,233,218,0.08)" }}>
          <div className="max-w-[1400px] mx-auto px-[52px]"><ProductGridSkeleton /></div>
        </div>
      }>
        <FeaturedProductsSection />
      </Suspense>
      <BeautyEditorial />
      <NewsletterK />
    </>
  );
}
