export const revalidate = 3600;
import { ProductGrid } from "@/components/product/ProductGrid";
import { getLocale } from "next-intl/server";
import { buildMetadata } from "@/lib/seo";
import { Tag } from "lucide-react";

export async function generateMetadata() {
  const locale = await getLocale();
  return buildMetadata({ title: "Deals & Sales", description: "Shop the best deals on luxury beauty and premium tech. Limited time offers updated daily.", locale });
}

export default function DealsPage() {
  return (
    <>
      <div className="k-page-hdr">
        <div className="wrap" style={{ textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 16, padding: "4px 12px", border: "1px solid var(--crimson)", color: "var(--crimson)" }}>
            <Tag size={11} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" }}>Limited Time Offers</span>
          </div>
          <p className="page-hd-eyebrow">Deals &amp; Sales</p>
          <h1 className="page-hd-title">Luxury at a price you&apos;ll love</h1>
          <p style={{ fontSize: 14, color: "var(--chalk3)", marginTop: 12 }}>New deals added every day.</p>
        </div>
      </div>
      <div style={{ paddingTop: 48, paddingBottom: 96 }}>
        <div className="wrap">
          <ProductGrid filters={{ isOnSale: true }} />
        </div>
      </div>
    </>
  );
}
