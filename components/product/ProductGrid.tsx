"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ProductCard, ProductCardSkeleton } from "./ProductCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import type { ProductCard as ProductCardType, ProductFilters, SortOption } from "@/types";

interface Subcategory { name: string; slug: string; count: number }

interface ProductGridProps {
  initialProducts?: ProductCardType[];
  filters?: ProductFilters;
  showFilters?: boolean;
  columns?: 2 | 3 | 4;
  subcategories?: Subcategory[];
  subcategoryBasePath?: string;
  activeSubcategorySlug?: string;
  allCategoryLabel?: string;
  allCategoryHref?: string;
  sidebarSlot?: React.ReactNode;
}

const SORT_KEYS: { key: string; value: SortOption }[] = [
  { key: "newest",      value: "newest"       },
  { key: "bestSelling", value: "best-selling"  },
  { key: "topRated",    value: "rating"        },
  { key: "priceLow",    value: "price-asc"     },
  { key: "priceHigh",   value: "price-desc"    },
  { key: "discount",    value: "discount"      },
];

export function ProductGrid({
  initialProducts,
  filters: initialFilters,
  showFilters = true,
  columns = 4,
  subcategories,
  subcategoryBasePath,
  activeSubcategorySlug,
  allCategoryLabel,
  allCategoryHref,
  sidebarSlot,
}: ProductGridProps) {
  const t = useTranslations("filters");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<ProductCardType[]>(initialProducts ?? []);
  const [loading, setLoading] = useState(!initialProducts);
  const [filters, setFilters] = useState<ProductFilters>(() => {
    const sort = searchParams.get("sort") as SortOption | null;
    return { ...(initialFilters ?? {}), ...(sort ? { sort } : {}) };
  });
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [brands, setBrands] = useState<{ name: string; slug: string }[]>([]);

  const fetchProducts = useCallback(async (f: ProductFilters, p = 1, append = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (f.search) params.set("search", f.search);
      if (f.categorySlug) params.set("category", f.categorySlug);
      if (f.brandSlugs?.length) params.set("brands", f.brandSlugs.join(","));
      if (f.minPrice) params.set("minPrice", String(f.minPrice));
      if (f.maxPrice) params.set("maxPrice", String(f.maxPrice));
      if (f.inStock) params.set("inStock", "true");
      if (f.isOnSale) params.set("onSale", "true");
      if (f.isBestSeller) params.set("bestSeller", "true");
      if (f.isNewArrival) params.set("newArrival", "true");
      if (f.isFeatured) params.set("featured", "true");
      if (f.sort) params.set("sort", f.sort);
      params.set("page", String(p));
      params.set("limit", "24");

      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      setTotal(data.data?.total ?? 0);
      setProducts((prev) =>
        append ? [...prev, ...(data.data?.products ?? [])] : (data.data?.products ?? [])
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialProducts) fetchProducts(filters, 1);
    if (showFilters) {
      fetch("/api/brands?limit=50")
        .then((r) => r.json())
        .then((d) => setBrands(d.data?.brands ?? []));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const handleFilterChange = (key: keyof ProductFilters, value: unknown) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    setPage(1);
    fetchProducts(next, 1);
    if (key === "sort") {
      const p = new URLSearchParams(searchParams.toString());
      if (value) p.set("sort", value as string); else p.delete("sort");
      router.replace(`?${p.toString()}`, { scroll: false });
    }
  };

  const handleBrandToggle = (slug: string) => {
    const current = filters.brandSlugs ?? [];
    const next = current.includes(slug)
      ? current.filter((s) => s !== slug)
      : [...current, slug];
    handleFilterChange("brandSlugs", next);
  };

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchProducts(filters, next, true);
  };

  const hasMore = products.length < total;

  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  };

  return (
    <div className="flex gap-8">
      {showFilters && (
        <>
          <aside className="hidden lg:block w-64 shrink-0">
            {sidebarSlot}
            {subcategories && subcategories.length > 0 && subcategoryBasePath && (
              <div className="border-b border-black/8 dark:border-white/8 pb-5 mb-6">
                <p className="text-[11px] tracking-[0.12em] uppercase text-black dark:text-white mb-3">{t("category")}</p>
                <div className="space-y-1">
                  {allCategoryHref && (
                    <Link href={allCategoryHref} className={cn("flex items-center justify-between py-1.5 text-sm transition-colors", !activeSubcategorySlug ? "text-black dark:text-white font-medium" : "text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white")}>
                      <span>{allCategoryLabel ?? "All"}</span>
                    </Link>
                  )}
                  {subcategories.map((sc) => (
                    <Link key={sc.slug} href={`${subcategoryBasePath}/${sc.slug}`} className={cn("flex items-center justify-between py-1.5 text-sm transition-colors", activeSubcategorySlug === sc.slug ? "text-black dark:text-white font-medium" : "text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white")}>
                      <span>{sc.name}</span>
                      <span className="text-[11px] text-black/30 dark:text-white/30">{sc.count}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            <FilterSidebar
              filters={filters}
              brands={brands}
              onBrandToggle={handleBrandToggle}
              onFilterChange={handleFilterChange}
              onClear={() => { setFilters({}); fetchProducts({}, 1); }}
              t={t}
            />
          </aside>

          <AnimatePresence>
            {sidebarOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[210] bg-black/50 lg:hidden"
                  onClick={() => setSidebarOpen(false)}
                />
                <motion.aside
                  initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
                  transition={{ type: "spring", damping: 30 }}
                  className="fixed left-0 top-0 bottom-0 z-[210] w-80 bg-white dark:bg-black overflow-y-auto p-6 lg:hidden"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-lg">{t("filters")}</h3>
                    <button onClick={() => setSidebarOpen(false)}><X size={20} /></button>
                  </div>
                  <FilterSidebar
                    filters={filters}
                    brands={brands}
                    onBrandToggle={handleBrandToggle}
                    onFilterChange={handleFilterChange}
                    onClear={() => { setFilters({}); setSidebarOpen(false); fetchProducts({}, 1); }}
                    t={t}
                  />
                </motion.aside>
              </>
            )}
          </AnimatePresence>
        </>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            {showFilters && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 h-10 border border-black/15 dark:border-white/15 text-[11px] tracking-[0.08em] uppercase"
              >
                <SlidersHorizontal size={16} />
                {t("filters")}
              </button>
            )}
            <p className="text-sm text-black/40 dark:text-white/40">
              {loading ? t("loading") : `${total.toLocaleString()} ${t("products")}`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] tracking-[0.1em] uppercase text-black/40 dark:text-white/40 hidden sm:block">{t("sort")}:</span>
            <div className="relative">
              <select
                value={filters.sort ?? "newest"}
                onChange={(e) => handleFilterChange("sort", e.target.value as SortOption)}
                className="h-10 pl-3 pr-8 border border-black/15 dark:border-white/15 bg-white dark:bg-black text-[11px] tracking-[0.06em] uppercase focus:outline-none appearance-none"
              >
                {SORT_KEYS.map((o) => (
                  <option key={o.value} value={o.value}>{t(o.key as Parameters<typeof t>[0])}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-black/40 dark:text-white/40" />
            </div>
          </div>
        </div>

        {loading && products.length === 0 ? (
          <div className={cn("grid gap-5", gridCols[columns])}>
            {Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center px-4">
            <SlidersHorizontal size={56} strokeWidth={1} className="text-black/10 dark:text-white/10 mb-8" />
            <p className="text-[10px] tracking-[0.28em] uppercase text-black/30 dark:text-white/30 mb-4">{t("noResults")}</p>
            <h3 className="font-display text-2xl md:text-3xl uppercase tracking-[0.04em] text-black dark:text-white">{t("nothingMatches")}</h3>
            <p className="mt-4 text-sm text-black/40 dark:text-white/40 max-w-xs leading-relaxed">{t("nothingMatchesDesc")}</p>
          </div>
        ) : (
          <>
            <div className={cn("grid gap-5", gridCols[columns])}>
              {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} priority={i < 4} />)}
            </div>
            {hasMore && (
              <div className="mt-12 text-center">
                <Button onClick={loadMore} loading={loading} variant="outline" size="lg">
                  {t("loadMore")}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function FilterSidebar({
  filters,
  brands,
  onBrandToggle,
  onFilterChange,
  onClear,
  t,
}: {
  filters: ProductFilters;
  brands: { name: string; slug: string }[];
  onBrandToggle: (slug: string) => void;
  onFilterChange: (key: keyof ProductFilters, value: unknown) => void;
  onClear: () => void;
  t: (key: string) => string;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] tracking-[0.14em] uppercase text-black dark:text-white font-medium">{t("title")}</h3>
        <button onClick={onClear} className="text-[10px] tracking-[0.08em] uppercase text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors">{t("clearAll")}</button>
      </div>

      <FilterSection title={t("priceRange")}>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            min={0}
            value={filters.minPrice ?? ""}
            className="h-9 text-sm"
            onKeyDown={(e) => { if (e.key === "-" || e.key === "e" || e.key === "E") e.preventDefault(); }}
            onChange={(e) => onFilterChange("minPrice", e.target.value ? Math.max(0, Number(e.target.value)) : undefined)}
          />
          <span className="text-black/30 dark:text-white/30">—</span>
          <Input
            type="number"
            placeholder="Max"
            min={0}
            value={filters.maxPrice ?? ""}
            className="h-9 text-sm"
            onKeyDown={(e) => { if (e.key === "-" || e.key === "e" || e.key === "E") e.preventDefault(); }}
            onChange={(e) => onFilterChange("maxPrice", e.target.value ? Math.max(0, Number(e.target.value)) : undefined)}
          />
        </div>
      </FilterSection>

      {brands.length > 0 && (
        <FilterSection title={t("brand")}>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {brands.map((b) => (
              <label key={b.slug} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.brandSlugs?.includes(b.slug) ?? false}
                  onChange={() => onBrandToggle(b.slug)}
                  className="w-4 h-4 border-black/20 dark:border-white/20 focus:ring-0 focus:ring-offset-0"
                />
                <span className="text-sm text-black/70 dark:text-white/70">{b.name}</span>
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      <FilterSection title={t("availability")}>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.inStock ?? false}
            onChange={(e) => onFilterChange("inStock", e.target.checked)}
            className="w-4 h-4 border-black/20 dark:border-white/20 focus:ring-0"
          />
          <span className="text-sm text-black/70 dark:text-white/70">{t("inStockOnly")}</span>
        </label>
      </FilterSection>

      <FilterSection title={t("deals")}>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.isOnSale ?? false}
            onChange={(e) => onFilterChange("isOnSale", e.target.checked)}
            className="w-4 h-4 border-black/20 dark:border-white/20 focus:ring-0"
          />
          <span className="text-sm text-black/70 dark:text-white/70">{t("onSale")}</span>
        </label>
      </FilterSection>
    </div>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-black/8 dark:border-white/8 pb-5">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full mb-3"
      >
        <span className="text-[11px] tracking-[0.12em] uppercase text-black dark:text-white">{title}</span>
        <ChevronDown size={12} className={cn("text-black/40 dark:text-white/40 transition-transform", open && "rotate-180")} />
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}
