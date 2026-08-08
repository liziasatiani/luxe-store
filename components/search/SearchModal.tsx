"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight, TrendingUp } from "lucide-react";
import FocusTrap from "focus-trap-react";
import Link from "next/link";
import Image from "next/image";
import { useUIStore } from "@/store";
import { useSearch } from "@/hooks";
import { getProductImageUrl } from "@/lib/utils";
import { useCurrency } from "@/hooks/useCurrency";
import { Spinner } from "@/components/ui";
import type { ProductCard } from "@/types";
import { useTranslations } from "next-intl";

const TRENDING = ["La Mer cream", "Sony headphones", "Charlotte Tilbury", "AirPods Pro", "Dyson hair", "Tom Ford"] as const;

export function SearchModal() {
  const t = useTranslations("search");
  const { searchOpen, closeSearch } = useUIStore();
  const { query, setQuery, results, loading } = useSearch();
  const [activeTab, setActiveTab] = useState<"all" | "beauty" | "tech">("all");
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredResults = useMemo(() => {
    if (activeTab === "all") return results;
    return results.filter(p => {
      const slug = (p as ProductCard & { category: { slug: string } }).category?.slug ?? "";
      return activeTab === "beauty"
        ? ["beauty", "skincare", "makeup", "hair-care", "body-care", "perfume", "beauty-tools"].some(s => slug.includes(s))
        : ["tech", "headphones", "cameras", "tablets", "gaming", "wearables", "smart-home", "audio", "accessories"].some(s => slug.includes(s));
    });
  }, [results, activeTab]);

  useEffect(() => {
    if (searchOpen) setTimeout(() => inputRef.current?.focus(), 100);
    if (!searchOpen) setActiveTab("all");
  }, [searchOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSearch();
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (searchOpen) closeSearch();
        else useUIStore.getState().openSearch();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [searchOpen, closeSearch]);

  return (
    <AnimatePresence>
      {searchOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.7)" }}
            onClick={closeSearch}
          />

          <FocusTrap active={searchOpen} focusTrapOptions={{ escapeDeactivates: false, allowOutsideClick: true, initialFocus: () => inputRef.current ?? false }}>
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              role="dialog"
              aria-modal="true"
              aria-label="Search"
              style={{
                position: "fixed", top: 16, left: 16, right: 16,
                maxWidth: 620, margin: "0 auto", zIndex: 50,
              }}
            >
              <div style={{ background: "var(--s1)", border: "1px solid var(--border)", overflow: "hidden" }}>
                {/* Input */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 20px", height: 60, borderBottom: "1px solid var(--border)" }}>
                  {loading
                    ? <Spinner size={18} />
                    : <Search size={18} style={{ color: "var(--chalk3)", flexShrink: 0 }} />
                  }
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t("placeholder")}
                    style={{ flex: 1, fontSize: 14, background: "transparent", color: "var(--chalk)", border: "none", outline: "none" }}
                  />
                  {query && (
                    <button onClick={() => setQuery("")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--chalk3)", display: "flex", padding: 4 }}>
                      <X size={16} />
                    </button>
                  )}
                  <button
                    onClick={closeSearch}
                    style={{ display: "flex", alignItems: "center", padding: "3px 7px", border: "1px solid var(--borderg)", background: "transparent", fontSize: 10, letterSpacing: "0.08em", color: "var(--chalk3)", cursor: "pointer" }}
                  >
                    ESC
                  </button>
                </div>

                <p aria-live="polite" aria-atomic="true" className="sr-only">
                  {query && !loading
                    ? results.length > 0
                      ? t("resultsFor", { count: results.length, query })
                      : t("noResults", { query })
                    : ""}
                </p>

                {/* Category tabs */}
                {query && results.length > 0 && (
                  <div style={{ display: "flex", borderBottom: "1px solid var(--border)", padding: "0 20px" }}>
                    {(["all", "beauty", "tech"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                          padding: "0 16px", height: 40, fontSize: 10, letterSpacing: "0.12em",
                          textTransform: "uppercase", background: "none", border: "none", cursor: "pointer",
                          borderBottom: `2px solid ${activeTab === tab ? "var(--gold)" : "transparent"}`,
                          color: activeTab === tab ? "var(--gold)" : "var(--chalk3)",
                          marginBottom: -1, transition: "color 0.15s",
                        }}
                      >
                        {tab === "all" ? `${t("tabAll")} (${results.length})` : tab === "beauty" ? t("tabBeauty") : t("tabTech")}
                      </button>
                    ))}
                  </div>
                )}

                {/* Results */}
                <div style={{ maxHeight: "60vh", overflowY: "auto", padding: 16 }}>
                  {!query ? (
                    <div>
                      <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--chalk3)", marginBottom: 12 }}>
                        {t("trending")}
                      </p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {TRENDING.map((term) => (
                          <button
                            key={term}
                            onClick={() => setQuery(term)}
                            style={{
                              display: "flex", alignItems: "center", gap: 6,
                              padding: "7px 12px", border: "1px solid var(--borderg)",
                              background: "transparent", color: "var(--chalk2)", fontSize: 12,
                              cursor: "pointer", transition: "border-color 0.15s, color 0.15s",
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--gold)"; e.currentTarget.style.color = "var(--chalk)"; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--borderg)"; e.currentTarget.style.color = "var(--chalk2)"; }}
                          >
                            <TrendingUp size={11} style={{ color: "var(--gold)" }} />
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : filteredResults.length > 0 ? (
                    <div>
                      {filteredResults.map((product) => (
                        <SearchResultItem
                          key={(product as ProductCard).id}
                          product={product as ProductCard}
                          onClose={closeSearch}
                        />
                      ))}
                      <Link
                        href={`/search?q=${encodeURIComponent(query)}`}
                        onClick={closeSearch}
                        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, height: 44, marginTop: 8, fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gold)", textDecoration: "none", borderTop: "1px solid var(--border)" }}
                      >
                        {t("viewAll")} <ArrowRight size={12} />
                      </Link>
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: "32px 0" }}>
                      <p style={{ fontSize: 13, color: "var(--chalk2)" }}>{t("noResults", { query })}</p>
                      <p style={{ fontSize: 11, color: "var(--chalk3)", marginTop: 6 }}>Try different keywords</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </FocusTrap>
        </>
      )}
    </AnimatePresence>
  );
}

function SearchResultItem({ product, onClose }: { product: ProductCard; onClose: () => void }) {
  const { format } = useCurrency();
  const img = getProductImageUrl(product.images, 200, 75);
  return (
    <Link
      href={`/products/${product.slug}`}
      onClick={onClose}
      style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 8px", textDecoration: "none", borderBottom: "1px solid var(--border)", transition: "background 0.12s" }}
      onMouseEnter={e => (e.currentTarget.style.background = "var(--s2)")}
      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
    >
      <div style={{ position: "relative", width: 48, height: 48, background: "var(--s2)", flexShrink: 0, overflow: "hidden" }}>
        <Image src={img} alt={product.name} fill className="object-cover" sizes="48px" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: "var(--chalk)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {product.name}
        </p>
        <p style={{ fontSize: 11, color: "var(--chalk3)", marginTop: 2 }}>{product.brand?.name} · {product.category.name}</p>
      </div>
      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--chalk)", flexShrink: 0 }}>
        {format(Number(product.price))}
      </span>
    </Link>
  );
}
