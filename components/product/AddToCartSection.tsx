"use client";
import { useState, useRef, useEffect } from "react";
import { Share2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCartStore, useWishlistStore } from "@/store";
import { useCurrency } from "@/hooks/useCurrency";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import type { ProductCard } from "@/types";
import { NotifyMe } from "./NotifyMe";

interface Variant {
  id: string;
  name: string;
  value: string;
  price?: number | null;
  stock: number;
}

interface Props {
  product: ProductCard & { variants?: Variant[] };
}

export function AddToCartSection({ product }: Props) {
  const t = useTranslations("product");
  const { format } = useCurrency();
  const [qty, setQty] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [stickyVisible, setStickyVisible] = useState(false);
  const { addItem, openCart } = useCartStore();
  const { toggle, has } = useWishlistStore();
  const router = useRouter();
  const isWishlisted = has(product.id);
  const outOfStock = product.stockStatus === "OUT_OF_STOCK";
  const buttonsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = buttonsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setStickyVisible(!entry.isIntersecting), { threshold: 0 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const variantGroups = (product.variants ?? []).reduce<Record<string, Variant[]>>((acc, v) => {
    if (!acc[v.name]) acc[v.name] = [];
    acc[v.name].push(v);
    return acc;
  }, {});

  const handleAddToCart = () => {
    addItem(product, qty, selectedVariant ? { name: selectedVariant.name, value: selectedVariant.value, price: selectedVariant.price } : undefined);
    toast.success(`${product.name} added to cart`, { icon: "🛍️" });
    openCart();
  };

  const handleBuyNow = () => {
    addItem(product, qty, selectedVariant ? { name: selectedVariant.name, value: selectedVariant.value, price: selectedVariant.price } : undefined);
    // no toast here — the redirect is fast enough that it would just flash
    router.push("/checkout");
  };

  const handleShare = async () => {
    try {
      if (navigator.share) await navigator.share({ title: product.name, url: window.location.href });
      else { await navigator.clipboard.writeText(window.location.href); toast.success(t("linkCopied")); }
    } catch { /* cancelled */ }
  };

  return (
    <div>
      {/* Variant groups */}
      {Object.entries(variantGroups).map(([groupName, variants]) => (
        <div key={groupName} style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--chalk2)", marginBottom: 12 }}>
            {groupName}: <span style={{ color: "var(--chalk)" }}>{selectedVariant?.name === groupName ? selectedVariant.value : t("selectVariant")}</span>
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {variants.map(v => (
              <button
                key={v.id}
                onClick={() => { if (v.stock !== 0) setSelectedVariant(v); }}
                disabled={v.stock === 0}
                style={{
                  padding: "8px 16px",
                  fontSize: 13,
                  border: `1px solid ${selectedVariant?.id === v.id ? "var(--gold)" : "var(--borderg)"}`,
                  background: selectedVariant?.id === v.id ? "var(--gold)" : "transparent",
                  color: selectedVariant?.id === v.id ? "#000" : "var(--chalk2)",
                  borderRadius: 1,
                  cursor: v.stock === 0 ? "not-allowed" : "pointer",
                  opacity: v.stock === 0 ? 0.4 : 1,
                  transition: "all 0.15s",
                }}
              >
                {v.value}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Quantity — K .dqty */}
      <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--chalk2)", marginBottom: 12 }}>{t("quantity")}</p>
      <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--border)", borderRadius: 1, width: "fit-content", marginBottom: 26 }}>
        <button
          onClick={() => setQty(q => Math.max(1, q - 1))}
          aria-label={t("decreaseQty")}
          style={{ width: 46, height: 46, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 200, color: "var(--chalk2)", transition: "background 0.15s, color 0.15s" }}
          onMouseEnter={e => { const el = e.currentTarget; el.style.background = "var(--s2)"; el.style.color = "var(--chalk)"; }}
          onMouseLeave={e => { const el = e.currentTarget; el.style.background = "transparent"; el.style.color = "var(--chalk2)"; }}
        >−</button>
        <div style={{ width: 58, height: 46, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--sans)", fontSize: 15, fontWeight: 500, borderLeft: "1px solid var(--border)", borderRight: "1px solid var(--border)", color: "var(--chalk)" }} aria-live="polite">
          {qty}
        </div>
        <button
          onClick={() => setQty(q => Math.min(product.stock, q + 1))}
          disabled={qty >= product.stock}
          aria-label={t("increaseQty")}
          style={{ width: 46, height: 46, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 200, color: "var(--chalk2)", transition: "background 0.15s, color 0.15s", opacity: qty >= product.stock ? 0.4 : 1 }}
          onMouseEnter={e => { if (qty < product.stock) { const el = e.currentTarget; el.style.background = "var(--s2)"; el.style.color = "var(--chalk)"; } }}
          onMouseLeave={e => { const el = e.currentTarget; el.style.background = "transparent"; el.style.color = "var(--chalk2)"; }}
        >+</button>
      </div>

      {/* Action buttons */}
      <div ref={buttonsRef}>
        {/* Add to cart — K .dadd */}
        <button
          onClick={handleAddToCart}
          disabled={outOfStock}
          style={{ width: "100%", padding: 16, background: "var(--gold)", color: "#000", fontFamily: "var(--sans)", fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", borderRadius: 1, marginBottom: 11, transition: "opacity 0.2s", opacity: outOfStock ? 0.4 : 1, cursor: outOfStock ? "not-allowed" : "pointer" }}
          onMouseEnter={e => { if (!outOfStock) (e.currentTarget as HTMLElement).style.opacity = "0.85"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = outOfStock ? "0.4" : "1"; }}
        >
          {outOfStock ? t("outOfStock") : t("addToCart")}
        </button>
        {outOfStock && <NotifyMe productId={product.id} />}

        {/* Wishlist — K .dwish */}
        <button
          onClick={() => { toggle(product.id); toast.success(isWishlisted ? t("removed") : t("addToWishlist")); }}
          style={{ width: "100%", padding: 15, border: "1px solid var(--borderg)", borderRadius: 1, fontFamily: "var(--sans)", fontSize: 12, fontWeight: 400, letterSpacing: "0.12em", textTransform: "uppercase", color: isWishlisted ? "var(--gold)" : "var(--chalk2)", background: isWishlisted ? "var(--gold3)" : "transparent", transition: "all 0.2s", cursor: "pointer" }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "var(--gold)"; el.style.color = "var(--gold)"; el.style.background = "var(--gold3)"; }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "var(--borderg)"; el.style.color = isWishlisted ? "var(--gold)" : "var(--chalk2)"; el.style.background = isWishlisted ? "var(--gold3)" : "transparent"; }}
        >
          {isWishlisted ? t("wishlisted") : t("addToWishlist")}
        </button>
      </div>

      {/* Share */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 20 }}>
        <button
          onClick={handleShare}
          style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--chalk2)", letterSpacing: "0.08em", transition: "color 0.2s" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--chalk)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--chalk2)"; }}
        >
          <Share2 size={13} />
          {t("share")}
        </button>
      </div>

      {/* Mobile sticky bar */}
      {stickyVisible && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50, background: "var(--bg)", borderTop: "1px solid var(--border)", padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }} className="md:hidden">
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--chalk2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{product.name}</p>
            <p style={{ fontSize: 14, fontWeight: 500, color: "var(--chalk)" }}>{format(selectedVariant?.price ?? Number(product.price))}</p>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={outOfStock}
            style={{ height: 44, padding: "0 20px", background: "var(--gold)", color: "#000", fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", borderRadius: 1, opacity: outOfStock ? 0.4 : 1 }}
          >
            {outOfStock ? t("outOfStock") : t("addToCart")}
          </button>
          <button
            onClick={handleBuyNow}
            disabled={outOfStock}
            style={{ height: 44, padding: "0 20px", border: "1px solid var(--borderg)", color: "var(--chalk2)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", borderRadius: 1, opacity: outOfStock ? 0.4 : 1 }}
          >
            {t("buyNow")}
          </button>
        </div>
      )}
    </div>
  );
}
