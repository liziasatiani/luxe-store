"use client";
import { useEffect, useState, useRef } from "react";
import { Heart, X } from "lucide-react";
import { useWishlistStore, useCartStore } from "@/store";
import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { Price } from "@/components/ui";
import type { ProductCard } from "@/types";

function WishlistRow({ product, onRemove }: { product: ProductCard; onRemove: () => void }) {
  const t = useTranslations("wishlist");
  const tProduct = useTranslations("product");
  const { addItem, openCart } = useCartStore();
  const [added, setAdded] = useState(false);

  const primaryImage = product.images.find(i => i.isPrimary) ?? product.images[0];

  function handleAddToCart() {
    addItem(product);
    openCart();
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  const isUnavailable = product.stockStatus === "OUT_OF_STOCK";

  return (
    <div
      className="glass-card"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 20,
        padding: "16px 20px",
        borderRadius: 14,
      }}
    >
      {/* Thumbnail */}
      <Link href={`/products/${product.slug}`} style={{ flexShrink: 0 }}>
        <div
          style={{
            width: 72,
            height: 88,
            borderRadius: 8,
            overflow: "hidden",
            background: "var(--s2)",
            position: "relative",
          }}
        >
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.altText ?? product.name}
              fill
              style={{ objectFit: "cover" }}
              sizes="72px"
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                background:
                  product.category.slug.includes("tech")
                    ? "linear-gradient(145deg,#061825,#0d2840)"
                    : "linear-gradient(145deg,#1c0828,#2d1245)",
              }}
            />
          )}
        </div>
      </Link>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {product.brand && (
          <div
            style={{
              fontFamily: "var(--sans)",
              fontSize: 8,
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--gold)",
              marginBottom: 4,
              opacity: 0.9,
            }}
          >
            {product.brand.name}
          </div>
        )}
        <Link
          href={`/products/${product.slug}`}
          style={{
            fontFamily: "var(--serif)",
            fontSize: 16,
            fontWeight: 600,
            color: "var(--chalk)",
            textDecoration: "none",
            display: "block",
            marginBottom: 6,
            lineHeight: 1.2,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {product.name}
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: "var(--sans)", fontSize: 15, fontWeight: 500, color: "var(--chalk)" }}>
            <Price amount={product.price} />
          </span>
          {product.comparePrice && Number(product.comparePrice) > product.price && (
            <span style={{ fontSize: 11, color: "var(--chalk3)", textDecoration: "line-through" }}>
              <Price amount={Number(product.comparePrice)} />
            </span>
          )}
          {isUnavailable && (
            <span
              style={{
                fontFamily: "var(--sans)",
                fontSize: 9,
                fontWeight: 500,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--chalk3)",
              }}
            >
              {tProduct("outOfStockLabel")}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
        <button
          onClick={handleAddToCart}
          disabled={isUnavailable}
          className="btn-cart"
          style={{
            fontSize: 9,
            padding: "9px 18px",
            borderRadius: 2,
            whiteSpace: "nowrap",
            opacity: isUnavailable ? 0.4 : 1,
            cursor: isUnavailable ? "not-allowed" : "pointer",
          }}
        >
          {added ? "✓ Added" : tProduct("addToCart")}
        </button>
        <button
          onClick={onRemove}
          aria-label="Remove from wishlist"
          style={{
            width: 32,
            height: 32,
            background: "transparent",
            border: "1px solid var(--border)",
            borderRadius: 8,
            color: "var(--chalk3)",
            fontSize: 12,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "border-color 0.15s, color 0.15s",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--crimson)";
            (e.currentTarget as HTMLElement).style.color = "var(--crimson)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
            (e.currentTarget as HTMLElement).style.color = "var(--chalk3)";
          }}
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
}

export default function WishlistPage() {
  const t = useTranslations("wishlist");
  const { ids, toggle, clear } = useWishlistStore();
  const [products, setProducts] = useState<ProductCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const fetchedKey = useRef("");

  useEffect(() => { setMounted(true); }, []);

  const uniqueIds = [...new Set(ids)];
  const idsKey = uniqueIds.slice().sort().join(",");

  useEffect(() => {
    if (!mounted) return;
    if (idsKey === fetchedKey.current) return;
    fetchedKey.current = idsKey;
    if (uniqueIds.length === 0) { setProducts([]); return; }
    setLoading(true);
    fetch(`/api/wishlist/products?ids=${uniqueIds.join(",")}`)
      .then(r => r.json())
      .then(d => {
        const seen = new Set<string>();
        const deduped = (d.data?.products ?? []).filter((p: ProductCard) => {
          if (seen.has(p.id)) return false;
          seen.add(p.id);
          return true;
        });
        setProducts(deduped);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey, mounted]);

  const displayCount = mounted ? uniqueIds.length : 0;

  return (
    <>
      <div className="k-page-hdr">
        <div className="wrap" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
          <div>
            <p className="page-hd-eyebrow">{t("title")}</p>
            <h1 className="page-hd-title" style={{ fontSize: "clamp(32px,4vw,56px)", marginBottom: 0 }}>
              {t("title")}
              <span style={{ fontFamily: "var(--sans)", fontSize: 20, fontWeight: 400, color: "var(--chalk2)", marginLeft: 14 }}>
                ({displayCount})
              </span>
            </h1>
          </div>
          {mounted && uniqueIds.length > 0 && (
            <button
              onClick={clear}
              style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--chalk2)", background: "none", border: "none", cursor: "pointer", transition: "color 0.2s", flexShrink: 0 }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--crimson)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--chalk2)"}
            >
              <X size={12} /> {t("clearAll")}
            </button>
          )}
        </div>
      </div>

      <div style={{ paddingTop: 0, paddingBottom: 96 }}>
        {!mounted || displayCount === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "96px 24px", textAlign: "center" }}>
            <Heart size={48} strokeWidth={1} style={{ color: "var(--chalk3)", marginBottom: 24 }} />
            <h3 style={{ fontFamily: "var(--serif)", fontSize: 28, color: "var(--chalk)", marginBottom: 12 }}>{t("nothingSaved")}</h3>
            <p style={{ fontSize: 14, color: "var(--chalk2)", marginBottom: 36 }}>{t("nothingSavedDesc")}</p>
            <Link href="/beauty" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "13px 28px", border: "1px solid var(--gold)", color: "var(--gold)", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", textDecoration: "none" }}>
              Start Shopping →
            </Link>
          </div>
        ) : loading ? (
          <div className="wrap" style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 32 }}>
            {uniqueIds.map(id => (
              <div key={id} className="glass-card" style={{ height: 120, borderRadius: 14, background: "var(--s1)", opacity: 0.5 }} />
            ))}
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
            <div className="wrap" style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 32 }}>
              {products.map(p => (
                <WishlistRow
                  key={p.id}
                  product={p}
                  onRemove={() => {
                    toggle(p.id);
                    setProducts(prev => prev.filter(x => x.id !== p.id));
                  }}
                />
              ))}
            </div>
            <div className="wrap" style={{ paddingTop: 28, textAlign: "center" }}>
              <Link
                href="/beauty"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--chalk2)", textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--gold)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--chalk2)"}
              >
                Continue Shopping →
              </Link>
            </div>
            <div className="wrap" style={{ paddingTop: 20 }}>
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
