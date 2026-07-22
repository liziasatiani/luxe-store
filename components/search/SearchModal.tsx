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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={closeSearch}
          />

          {/* Modal */}
          <FocusTrap active={searchOpen} focusTrapOptions={{ escapeDeactivates: false, allowOutsideClick: true, initialFocus: () => inputRef.current ?? false }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -10 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-label="Search"
            className="fixed top-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[640px] z-50"
          >
            <div className="bg-white dark:bg-surface-900 rounded-2xl shadow-luxury-xl overflow-hidden">
              {/* Input */}
              <div className="flex items-center gap-3 px-5 h-16 border-b border-surface-100 dark:border-surface-800">
                {loading ? <Spinner size={20} /> : <Search size={20} className="text-surface-400 shrink-0" />}
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("placeholder")}
                  className="flex-1 text-base bg-transparent text-surface-900 dark:text-white placeholder:text-surface-400 focus:outline-none"
                />
                {query && (
                  <button onClick={() => setQuery("")} className="text-surface-400 hover:text-surface-700 dark:hover:text-surface-200">
                    <X size={18} />
                  </button>
                )}
                <button
                  onClick={closeSearch}
                  className="hidden md:flex items-center gap-1 px-2 py-1 rounded-lg bg-surface-100 dark:bg-surface-800 text-xs text-surface-400"
                >
                  ESC
                </button>
              </div>

              {/* Screen-reader result count announcement */}
              <p aria-live="polite" aria-atomic="true" className="sr-only">
                {query && !loading
                  ? results.length > 0
                    ? t("resultsFor", { count: results.length, query })
                    : t("noResults", { query })
                  : ""}
              </p>

              {/* Category tabs — only when there are results */}
              {query && results.length > 0 && (
                <div className="flex gap-0 border-b border-surface-100 dark:border-surface-800 px-5">
                  {(["all", "beauty", "tech"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 h-10 text-[10px] tracking-[0.12em] uppercase transition-colors border-b-2 -mb-px ${
                        activeTab === tab
                          ? "border-black dark:border-white text-black dark:text-white"
                          : "border-transparent text-black/40 dark:text-white/40 hover:text-black/70 dark:hover:text-white/70"
                      }`}
                    >
                      {tab === "all" ? `${t("tabAll")} (${results.length})` : tab === "beauty" ? t("tabBeauty") : t("tabTech")}
                    </button>
                  ))}
                </div>
              )}

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto p-4">
                {!query ? (
                  <div>
                    <p className="text-xs font-medium text-surface-400 uppercase tracking-wider mb-3 px-1">
                      {t("trending")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {TRENDING.map((t) => (
                        <button
                          key={t}
                          onClick={() => setQuery(t)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-50 dark:bg-surface-800 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
                        >
                          <TrendingUp size={12} className="text-brand-400" />
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : filteredResults.length > 0 ? (
                  <div className="space-y-1">
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
                      className="flex items-center justify-center gap-2 h-11 mt-2 text-sm text-brand-500 hover:text-brand-600 font-medium"
                    >
                      {t("viewAll")} <ArrowRight size={14} />
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-surface-400 text-sm">{t("noResults", { query })}</p>
                    <p className="text-surface-300 dark:text-surface-500 text-xs mt-1">Try different keywords</p>
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
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors group"
    >
      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-surface-100 dark:bg-surface-800 shrink-0">
        <Image src={img} alt={product.name} fill className="object-cover" sizes="48px" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-surface-900 dark:text-white line-clamp-1 group-hover:text-brand-500 transition-colors">
          {product.name}
        </p>
        <p className="text-xs text-surface-400">{product.brand?.name} · {product.category.name}</p>
      </div>
      <span className="text-sm font-semibold text-surface-900 dark:text-white shrink-0">
        {format(Number(product.price))}
      </span>
    </Link>
  );
}
