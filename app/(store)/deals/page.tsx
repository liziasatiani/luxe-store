import { Container } from "@/components/ui";
import { ProductGrid } from "@/components/product/ProductGrid";
import { buildMetadata } from "@/lib/seo";
import { Tag } from "lucide-react";

export const metadata = buildMetadata({ title: "Deals & Sales", description: "Shop the best deals on luxury beauty and premium tech. Limited time offers updated daily." });

export default function DealsPage() {
  return (
    <>
      <div className="bg-gradient-to-r from-surface-950 via-surface-900 to-surface-950 py-14">
        <Container className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/20 border border-brand-500/30 mb-5">
            <Tag size={14} className="text-brand-400" />
            <span className="text-sm text-brand-300 font-medium">Limited Time Offers</span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl text-white mb-4">Deals & Sales</h1>
          <p className="text-surface-400 max-w-md mx-auto">Luxury at a price you'll love. New deals added every day.</p>
        </Container>
      </div>
      <Container className="py-12">
        <ProductGrid filters={{ isOnSale: true }} />
      </Container>
    </>
  );
}
