"use client";
import { useEffect, useState, useRef } from "react";
import { Heart, X } from "lucide-react";
import { ProductCard, ProductCardSkeleton } from "@/components/product/ProductCard";
import { useWishlistStore } from "@/store";
import { useTranslations } from "next-intl";
import Link from "next/link";
import type { ProductCard as ProductCardType } from "@/types";

export default function WishlistPage() {
  const t = useTranslations("wishlist");
  const { ids, clear } = useWishlistStore();
  const [products, setProducts] = useState<ProductCardType[]>([]);
  const [loading, setLoading] = useState(false);
  const fetchedKey = useRef("");

  const uniqueIds = [...new Set(ids)];
  const idsKey = uniqueIds.slice().sort().join(",");

  useEffect(() => {
    if (idsKey === fetchedKey.current) return;
    fetchedKey.current = idsKey;
    if (uniqueIds.length === 0) { setProducts([]); return; }
    setLoading(true);
    fetch(`/api/wishlist/products?ids=${uniqueIds.join(",")}`)
      .then(r => r.json())
      .then(d => {
        const seen = new Set<string>();
        const deduped = (d.data?.products ?? []).filter((p: ProductCardType) => {
          if (seen.has(p.id)) return false;
          seen.add(p.id);
          return true;
        });
        setProducts(deduped);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey]);

  return (
    <>
      {/* K-style page header */}
      <div className="k-page-hdr">
        <div className="wrap" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
          <div>
            <p className="page-hd-eyebrow">{t("title")}</p>
            <h1 className="page-hd-title" style={{ fontSize: "clamp(32px,4vw,56px)", marginBottom: 0 }}>
              {t("title")}
              <span style={{ fontFamily: "var(--sans)", fontSize: 20, fontWeight: 400, color: "var(--chalk2)", marginLeft: 14 }}>
                ({uniqueIds.length})
              </span>
            </h1>
          </div>
          {uniqueIds.length > 0 && (
            <button onClick={clear} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--chalk2)", background: "none", border: "none", cursor: "pointer", transition: "color 0.2s", flexShrink: 0 }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--crimson)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--chalk2)"}>
              <X size={12} /> {t("clearAll")}
            </button>
          )}
        </div>
      </div>

      <div style={{ paddingTop: 0, paddingBottom: 96 }}>
        {uniqueIds.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "96px 24px", textAlign: "center" }}>
            <Heart size={48} strokeWidth={1} style={{ color: "var(--chalk3)", marginBottom: 24 }} />
            <h3 style={{ fontFamily: "var(--serif)", fontSize: 28, color: "var(--chalk)", marginBottom: 12 }}>{t("nothingSaved")}</h3>
            <p style={{ fontSize: 14, color: "var(--chalk2)", marginBottom: 36 }}>{t("nothingSavedDesc")}</p>
            <Link href="/beauty" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "13px 28px", border: "1px solid var(--gold)", color: "var(--gold)", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", textDecoration: "none" }}>
              Start Shopping →
            </Link>
          </div>
        ) : loading ? (
          <div className="pgrid" style={{ borderTop: "1px solid var(--border)" }}>
            {uniqueIds.map(id => <ProductCardSkeleton key={id} />)}
          </div>
        ) : products.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "96px 24px", textAlign: "center" }}>
            <h3 style={{ fontFamily: "var(--serif)", fontSize: 28, color: "var(--chalk)", marginBottom: 12 }}>{t("nothingFound")}</h3>
            <p style={{ fontSize: 14, color: "var(--chalk2)", marginBottom: 36 }}>{t("nothingFoundDesc")}</p>
            <Link href="/beauty" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "13px 28px", border: "1px solid var(--gold)", color: "var(--gold)", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", textDecoration: "none" }}>
              Continue Shopping →
            </Link>
          </div>
        ) : (
          <>
            <div className="pgrid" style={{ borderTop: "1px solid var(--border)" }}>
              {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
            <div className="wrap" style={{ paddingTop: 32 }}>
              <p style={{ fontSize: 11, color: "var(--chalk2)", letterSpacing: "0.06em" }}>
                {t("savedOnDevice")}{" "}
                <Link href="/login" style={{ color: "var(--gold)", textDecoration: "none", borderBottom: "1px solid var(--borderg)" }}>{t("signIn")}</Link>
                {" "}{t("signInToSync")}
              </p>
            </div>
          </>
        )}
      </div>
    </>
  );
}
