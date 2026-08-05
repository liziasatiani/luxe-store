import { getLocale } from "next-intl/server";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const locale = await getLocale();
  return buildMetadata({ title: "About Us", description: "Everything Street — where luxury beauty and premium technology share the same address.", locale });
}

const PILLARS = [
  {
    num: "01",
    title: "Authenticity First",
    desc: "Every product we carry is sourced directly from authorized distributors and brand partners. We verify authenticity at every step — no grey market, no compromises.",
  },
  {
    num: "02",
    title: "Curated Selection",
    desc: "We don't list everything. We list the right things. Our buyers research each product category deeply so that every item on the shelf earns its place.",
  },
  {
    num: "03",
    title: "Premium Experience",
    desc: "From the moment you land to the moment your order arrives, we obsess over the details. Fast delivery, elegant packaging, and real human support.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero header */}
      <div style={{ padding: "calc(var(--nav-h) + 72px) 52px 64px", maxWidth: 1400, margin: "0 auto" }}>
        <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 28 }}>
          Our Story
        </p>
        <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(56px,8vw,112px)", fontWeight: 700, lineHeight: 0.92, letterSpacing: "-0.025em", maxWidth: 880, color: "var(--chalk)" }}>
          Where <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Beauty</em> meets<br />
          <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Technology</em>
        </h1>
      </div>

      {/* Body text */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "72px 52px" }}>
        <p style={{ fontFamily: "var(--serif)", fontSize: "clamp(19px,1.9vw,25px)", fontWeight: 400, fontStyle: "italic", color: "var(--chalk2)", lineHeight: 1.65, marginBottom: 48 }}>
          Everything Street was built on a simple conviction: that luxury shouldn't be a compromise. Premium beauty and premium technology belong together, in one place, served with the care they deserve.
        </p>
        <p style={{ fontSize: 15, color: "var(--chalk2)", lineHeight: 1.85, marginBottom: 26 }}>
          We started by asking why Tbilisi's most discerning shoppers had to choose between a dedicated beauty retailer and a tech boutique — or settle for the same mass-market shelves everyone else uses. The answer was that no one had built the alternative yet.
        </p>
        <p style={{ fontSize: 15, color: "var(--chalk2)", lineHeight: 1.85, marginBottom: 26 }}>
          Everything Street is that alternative. We carry prestige skincare, professional makeup, and niche fragrance alongside audiophile headphones, mirrorless cameras, and wearables from the world's most respected technology brands — all under one roof, all genuine, all delivered with the speed and elegance the products warrant.
        </p>
        <p style={{ fontSize: 15, color: "var(--chalk2)", lineHeight: 1.85 }}>
          Our team is small, our standards are high, and every brand we carry has been vetted by people who use these products personally. We don't stock what we wouldn't buy ourselves.
        </p>
      </div>

      {/* Pillars */}
      <div className="pillars-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, background: "var(--border)", maxWidth: 1400, margin: "0 auto" }}>
        {PILLARS.map(p => (
          <div key={p.num} style={{ padding: "44px 36px", background: "var(--s1)" }}>
            <div style={{ fontFamily: "var(--serif)", fontSize: 52, fontWeight: 700, color: "var(--border)", marginBottom: 18 }}>{p.num}</div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 19, fontWeight: 700, marginBottom: 10, color: "var(--chalk)" }}>{p.title}</div>
            <div style={{ fontSize: 13, color: "var(--chalk2)", lineHeight: 1.7 }}>{p.desc}</div>
          </div>
        ))}
      </div>
    </>
  );
}
