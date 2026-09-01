"use client";
import { useState } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import type { ProductCard as ProductCardType } from "@/types";
import Link from "next/link";

const TABS = ["All", "Beauty", "Tech"] as const;
type Tab = (typeof TABS)[number];

const BEAUTY_SLUGS = ["skincare", "makeup", "hair-care", "body-care", "perfume", "beauty-tools", "beauty"];
const TECH_SLUGS = ["headphones", "cameras", "tablets", "gaming", "wearables", "smart-home", "audio", "accessories", "tech"];

export function TheStandardClient({ products }: { products: ProductCardType[] }) {
  const [active, setActive] = useState<Tab>("All");

  const filtered = active === "All"
    ? products
    : products.filter(p => {
        const cat = p.category?.slug ?? "";
        return active === "Beauty"
          ? BEAUTY_SLUGS.some(s => cat.includes(s))
          : TECH_SLUGS.some(s => cat.includes(s));
      });

  return (
    <>
      <div className="sec-meta">
        <div className="sec-row" style={{ alignItems: "flex-end" }}>
          <div>
            <p className="sec-eyebrow">What people keep reordering</p>
            <h2 className="sec-title" style={{ marginBottom: 0 }}>The Standard</h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--border)", marginBottom: 6 }}>
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActive(tab)}
                style={{
                  height: 34,
                  padding: "0 18px",
                  fontSize: 9,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase" as const,
                  fontWeight: 500,
                  border: "none",
                  cursor: "pointer",
                  background: active === tab ? "var(--chalk)" : "transparent",
                  color: active === tab ? "var(--bg)" : "var(--chalk2)",
                  transition: "background 0.2s, color 0.2s",
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="pgrid">
        {filtered.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
      </div>
      <div style={{ textAlign: "center", marginTop: 40 }}>
        <Link
          href="/products"
          style={{
            fontSize: 9,
            fontWeight: 500,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--chalk2)",
            textDecoration: "none",
            borderBottom: "1px solid var(--border)",
            paddingBottom: 3,
          }}
        >
          See all 2,400+ products →
        </Link>
      </div>
    </>
  );
}
