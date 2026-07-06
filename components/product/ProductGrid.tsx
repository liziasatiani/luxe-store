"use client";
import { useState, useEffect, useCallback } from "react";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ProductCard, ProductCardSkeleton } from "./ProductCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { ProductCard as ProductCardType, ProductFilters, SortOption } from "@/types";

interface ProductGridProps {
  initialProducts?: ProductCardType[];
  filters?: ProductFilters;
  showFilters?: boolean;
  columns?: 2 | 3 | 4;
}

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: "Newest",       value: "newest"       },
  { label: "Best Selling", value: "best-selling"  },
  { label: "Top Rated",    value: "rating"        },
  { label: "Price: Low",   value: "price-asc"     },
  { label: "Price: High",  value: "price-desc"    },
  { label: "Discount",     value: "discount"      },
];

export function ProductGrid({
  initialProducts,
  filters: initialFilters,
  showFilters = true,
  columns = 4,
}: ProductGridProps) {
  const [products, setProducts] = useState<ProductCardType[]>(initialProducts ?? []);
  const [loading, setLoading] = useState(!initialProducts);
  const [filters, setFilters] = useState<ProductFilters>(initialFilters ?? {});
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
    fetch("/api/brands?limit=50")
      .then((r) => r.json())
      .then((d) => setBrands(d.data?.brands ?? []));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (key: keyof ProductFilters, value: unknown) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    setPage(1);
    fetchProducts(next, 1);
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
            <FilterSidebar
              filters={filters}
              brands={brands}
              onBrandToggle={handleBrandToggle}
              onFilterChange={handleFilterChange}
              onClear={() => { setFilters({}); fetchProducts({}, 1); }}
            />
          </aside>

          <AnimatePresence>
            {sidebarOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 bg-black/50 lg:hidden"
                  onClick={() => setSidebarOpen(false)}
                />
                <motion.aside
                  initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
                  transition={{ type: "spring", damping: 30 }}
                  className="fixed left-0 top-0 bottom-0 z-50 w-80 bg-white dark:bg-surface-900 overflow-y-auto p-6 lg:hidden"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-lg">Filters</h3>
                    <button onClick={() => setSidebarOpen(false)}><X size={20} /></button>
                  </div>
                  <FilterSidebar
                    filters={filters}
                    brands={brands}
                    onBrandToggle={handleBrandToggle}
                    onFilterChange={handleFilterChange}
                    onClear={() => { setFilters({}); setSidebarOpen(false); fetchProducts({}, 1); }}
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
                className="lg:hidden flex items-center gap-2 px-4 h-10 rounded-xl border border-surface-200 dark:border-surface-700 text-sm"
              >
                <SlidersHorizontal size={16} />
                Filters
              </button>
            )}
            <p className="text-sm text-surface-500">
              {loading ? "Loading…" : `${total.toLocaleString()} products`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-surface-500 hidden sm:block">Sort:</span>
            <div className="relative">
              <select
                value={filters.sort ?? "newest"}
                onChange={(e) => handleFilterChange("sort", e.target.value as SortOption)}
                className="h-10 pl-3 pr-8 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 appearance-none"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-surface-400" />
            </div>
          </div>
        </div>

        {loading && products.length === 0 ? (
          <div className={cn("grid gap-5", gridCols[columns])}>
            {Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-surface-500">No products found.</p>
          </div>
        ) : (
          <>
            <div className={cn("grid gap-5", gridCols[columns])}>
              {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
            {hasMore && (
              <div className="mt-12 text-center">
                <Button onClick={loadMore} loading={loading} variant="outline" size="lg">
                  Load More
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
}: {
  filters: ProductFilters;
  brands: { name: string; slug: string }[];
  onBrandToggle: (slug: string) => void;
  onFilterChange: (key: keyof ProductFilters, value: unknown) => void;
  onClear: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-surface-900 dark:text-white">Filters</h3>
        <button onClick={onClear} className="text-xs text-brand-500 hover:underline">Clear all</button>
      </div>

      <FilterSection title="Price Range">
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={filters.minPrice ?? ""}
            className="h-9 text-sm"
            onChange={(e) => onFilterChange("minPrice", e.target.value ? Number(e.target.value) : undefined)}
          />
          <span className="text-surface-400">—</span>
          <Input
            type="number"
            placeholder="Max"
            value={filters.maxPrice ?? ""}
            className="h-9 text-sm"
            onChange={(e) => onFilterChange("maxPrice", e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>
      </FilterSection>

      {brands.length > 0 && (
        <FilterSection title="Brand">
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {brands.map((b) => (
              <label key={b.slug} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.brandSlugs?.includes(b.slug) ?? false}
                  onChange={() => onBrandToggle(b.slug)}
                  className="w-4 h-4 rounded border-surface-300 text-brand-500 focus:ring-brand-500 focus:ring-offset-0"
                />
                <span className="text-sm text-surface-700 dark:text-surface-300">{b.name}</span>
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      <FilterSection title="Availability">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.inStock ?? false}
            onChange={(e) => onFilterChange("inStock", e.target.checked)}
            className="w-4 h-4 rounded border-surface-300 text-brand-500 focus:ring-brand-500"
          />
          <span className="text-sm text-surface-700 dark:text-surface-300">In Stock Only</span>
        </label>
      </FilterSection>

      <FilterSection title="Deals">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.isOnSale ?? false}
            onChange={(e) => onFilterChange("isOnSale", e.target.checked)}
            className="w-4 h-4 rounded border-surface-300 text-brand-500 focus:ring-brand-500"
          />
          <span className="text-sm text-surface-700 dark:text-surface-300">On Sale</span>
        </label>
      </FilterSection>
    </div>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-surface-100 dark:border-surface-800 pb-5">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full mb-3"
      >
        <span className="text-sm font-medium text-surface-900 dark:text-white">{title}</span>
        <ChevronDown size={14} className={cn("text-surface-400 transition-transform", open && "rotate-180")} />
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}
