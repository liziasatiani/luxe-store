"use client";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight, AlertTriangle, Filter, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Badge, Spinner } from "@/components/ui";
import { formatPrice } from "@/lib/utils";
import { ProductForm } from "@/components/admin/ProductForm";
import toast from "react-hot-toast";
import { useDebounce } from "@/hooks";

interface Product {
  id: string; name: string; sku: string; price: number; stock: number;
  stockStatus: string; isActive: boolean; isFeatured: boolean;
  images: Array<{ url: string }>;
  brand: { name: string } | null;
  category: { name: string; slug: string };
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [inactiveCount, setInactiveCount] = useState(0);
  const [tab, setTab] = useState<"active" | "inactive">("active");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Record<string, unknown> | null>(null);
  const debouncedSearch = useDebounce(search, 400);

  const fetchCounts = useCallback(async () => {
    try {
      const [a, i] = await Promise.all([
        fetch("/api/admin/products?active=true&limit=1").then(r => r.json()),
        fetch("/api/admin/products?active=false&limit=1").then(r => r.json()),
      ]);
      setActiveCount(a.data?.total ?? 0);
      setInactiveCount(i.data?.total ?? 0);
    } catch { /* counts are decorative, don't fail hard */ }
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page), limit: String(limit),
        active: tab === "active" ? "true" : "false",
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(category && { category }),
        ...(tab === "active" && stockFilter && { stock: stockFilter }),
      });
      const res = await fetch(`/api/admin/products?${params}`);
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      setProducts(data.data?.products ?? []);
      setTotal(data.data?.total ?? 0);
    } catch {
      setProducts([]);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [page, limit, tab, debouncedSearch, category, stockFilter]);

  useEffect(() => { setPage(1); setStockFilter(""); }, [tab]);
  useEffect(() => { setPage(1); }, [debouncedSearch, category, stockFilter]);
  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { fetchCounts(); }, [fetchCounts]);

  const handleDeactivate = async (id: string) => {
    if (!confirm("Deactivate this product?")) return;
    const res = await fetch("/api/admin/products", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    if (res.ok) { toast.success("Product deactivated"); fetchProducts(); fetchCounts(); }
    else toast.error("Failed to deactivate");
  };

  const handleRestore = async (id: string) => {
    const res = await fetch("/api/admin/products", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, isActive: true }) });
    if (res.ok) { toast.success("Product restored"); fetchProducts(); fetchCounts(); }
    else toast.error("Failed to restore");
  };

  const STOCK_BADGE = { IN_STOCK: "success", LOW_STOCK: "warning", OUT_OF_STOCK: "error" } as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-surface-900 dark:text-white">Products</h1>
          <p className="text-surface-500 text-sm mt-1">{activeCount} active · {inactiveCount} inactive</p>
        </div>
        <Button onClick={() => { setEditProduct(null); setFormOpen(true); }} variant="gold" leftIcon={<Plus size={16} />}>
          Add Product
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-surface-100 dark:bg-surface-800 rounded-xl w-fit">
        {(["active", "inactive"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === t ? "bg-white dark:bg-surface-900 text-surface-900 dark:text-white shadow-sm" : "text-surface-500 hover:text-surface-700 dark:hover:text-surface-300"}`}
          >
            {t === "active" ? `Active (${activeCount})` : `Inactive (${inactiveCount})`}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[200px] max-w-sm">
          <Input placeholder="Search by name or SKU…" value={search} onChange={e => setSearch(e.target.value)} leftIcon={<Search size={16} />} />
        </div>
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="h-11 px-3 pr-8 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 text-sm text-surface-700 dark:text-surface-300 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
        >
          <option value="">All categories</option>
          <optgroup label="Beauty">
            {["skincare","makeup","hair-care","body-care","perfume","beauty-tools","mini"].map(s => (
              <option key={s} value={s}>{s.replaceAll("-", " ")}</option>
            ))}
          </optgroup>
          <optgroup label="Tech">
            {["headphones","cameras","tablets","gaming","wearables","smart-home","audio","accessories"].map(s => (
              <option key={s} value={s}>{s.replaceAll("-", " ")}</option>
            ))}
          </optgroup>
        </select>
        {tab === "active" && (
          <select
            value={stockFilter}
            onChange={e => setStockFilter(e.target.value)}
            className="h-11 px-3 pr-8 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 text-sm text-surface-700 dark:text-surface-300 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
          >
            <option value="">All stock</option>
            <option value="IN_STOCK">In stock</option>
            <option value="LOW_STOCK">Low stock</option>
            <option value="OUT_OF_STOCK">Out of stock</option>
          </select>
        )}
        <select
          value={String(limit)}
          onChange={e => { setLimit(Number(e.target.value)); setPage(1); }}
          className="h-11 px-3 pr-8 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 text-sm text-surface-700 dark:text-surface-300 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
        >
          <option value="20">20 per page</option>
          <option value="50">50 per page</option>
          <option value="100">100 per page</option>
        </select>
        {(search || category || stockFilter) && (
          <button
            onClick={() => { setSearch(""); setCategory(""); setStockFilter(""); }}
            className="text-xs text-surface-400 hover:text-surface-700 dark:hover:text-white flex items-center gap-1 transition-colors"
          >
            <Filter size={12} /> Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner size={28} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-50 dark:bg-surface-800/50 border-b border-surface-100 dark:border-surface-800">
                <tr>
                  {["Product", "SKU", "Category", "Price", "Stock", "Status", "Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                {!loading && products.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-12 text-surface-400 text-sm">No products found</td></tr>
                )}
                {products.map(product => (
                  <tr key={product.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-surface-100 dark:bg-surface-800 shrink-0">
                          {product.images[0]?.url && <Image src={product.images[0].url} alt={product.name} fill className="object-cover" sizes="40px" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-surface-900 dark:text-white line-clamp-1">{product.name}</p>
                          <p className="text-xs text-surface-400">{product.brand?.name ?? "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-surface-500">{product.sku}</td>
                    <td className="px-4 py-3 text-sm text-surface-600 dark:text-surface-400">{product.category.name}</td>
                    <td className="px-4 py-3 text-sm font-semibold">{formatPrice(product.price)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {product.stock <= 5 && <AlertTriangle size={12} className="text-warning" />}
                        <span className="text-sm">{product.stock}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={STOCK_BADGE[product.stockStatus as keyof typeof STOCK_BADGE] ?? "default"} size="sm">
                        {product.stockStatus.replaceAll("_", " ")}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {tab === "active" ? (
                          <>
                            <button onClick={() => { setEditProduct(product as unknown as Record<string, unknown>); setFormOpen(true); }} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500 hover:text-surface-900 dark:hover:text-white transition-colors" title="Edit">
                              <Edit size={14} />
                            </button>
                            <button onClick={() => handleDeactivate(product.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-surface-500 hover:text-error transition-colors" title="Deactivate">
                              <Trash2 size={14} />
                            </button>
                          </>
                        ) : (
                          <button onClick={() => handleRestore(product.id)} className="p-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 text-surface-500 hover:text-green-600 dark:hover:text-green-400 transition-colors" title="Restore">
                            <RotateCcw size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {total > limit && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-surface-100 dark:border-surface-800">
            <p className="text-xs text-surface-400">Showing {Math.min((page-1)*limit+1, total)}–{Math.min(page*limit, total)} of {total}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="p-1.5 rounded-lg border border-surface-200 dark:border-surface-700 disabled:opacity-40">
                <ChevronLeft size={14} />
              </button>
              <button onClick={() => setPage(p => p+1)} disabled={page * limit >= total} className="p-1.5 rounded-lg border border-surface-200 dark:border-surface-700 disabled:opacity-40">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      {formOpen && (
        <ProductForm
          product={editProduct}
          onClose={() => setFormOpen(false)}
          onSave={() => { setFormOpen(false); fetchProducts(); }}
        />
      )}
    </div>
  );
}
