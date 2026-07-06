"use client";
import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight, TrendingUp } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useUIStore } from "@/store";
import { useSearch } from "@/hooks";
import { formatPrice, getProductImageUrl } from "@/lib/utils";
import { Spinner } from "@/components/ui";
import type { ProductCard } from "@/types";

const TRENDING = ["La Mer cream", "Sony headphones", "Charlotte Tilbury", "AirPods Pro", "Dyson hair", "Tom Ford"];

export function SearchModal() {
  const { searchOpen, closeSearch } = useUIStore();
  const { query, setQuery, results, loading } = useSearch();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [searchOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSearch();
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchOpen ? closeSearch() : useUIStore.getState().openSearch();
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
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -10 }}
            transition={{ duration: 0.2 }}
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
                  placeholder="Search products, brands, categories…"
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

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto p-4">
                {!query ? (
                  <div>
                    <p className="text-xs font-medium text-surface-400 uppercase tracking-wider mb-3 px-1">
                      Trending
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
                ) : results.length > 0 ? (
                  <div className="space-y-1">
                    {results.map((product) => (
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
                      View all results <ArrowRight size={14} />
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-surface-400 text-sm">No results for "{query}"</p>
                    <p className="text-surface-300 dark:text-surface-500 text-xs mt-1">Try different keywords</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function SearchResultItem({ product, onClose }: { product: ProductCard; onClose: () => void }) {
  const img = getProductImageUrl(product.images);
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
        {formatPrice(Number(product.price))}
      </span>
    </Link>
  );
}
