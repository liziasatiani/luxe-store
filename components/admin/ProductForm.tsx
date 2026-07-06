"use client";
import { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui";
import toast from "react-hot-toast";

// 1. Define a clear interface for the Product prop
interface ProductFormProps {
  product?: any | null; // Using 'any' as a quick fix for Prisma-generated types
  onClose: () => void;
  onSave: () => void;
}

const inputCls = "w-full h-11 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 text-surface-900 dark:text-white px-4 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-colors";
const labelCls = "block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5";

export function ProductForm({ product, onClose, onSave }: ProductFormProps) {
  const [categories, setCategories] = useState<Array<{ id: string; name: string; parentId: string | null }>>([]);
  const [brands, setBrands] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);
  
  // 2. Initialize state with proper casting
  const [images, setImages] = useState<Array<{ url: string; isPrimary: boolean }>>(
    product?.images ?? [{ url: "", isPrimary: true }]
  );
  const [specs, setSpecs] = useState<Array<{ name: string; value: string }>>(
    product?.specifications ?? []
  );
  
  const [form, setForm] = useState({
    name:         String(product?.name ?? ""),
    sku:          String(product?.sku ?? ""),
    description:  String(product?.description ?? ""),
    price:        String(product?.price ?? ""),
    comparePrice: String(product?.comparePrice ?? ""),
    stock:        String(product?.stock ?? "0"),
    categoryId:   String(product?.categoryId ?? ""),
    brandId:      String(product?.brandId ?? ""),
    isFeatured:   Boolean(product?.isFeatured ?? false),
    isBestSeller: Boolean(product?.isBestSeller ?? false),
    isNewArrival: Boolean(product?.isNewArrival ?? true),
    isOnSale:     Boolean(product?.isOnSale ?? false),
    tags:         (product?.tags && Array.isArray(product.tags) ? product.tags.join(", ") : ""),
    weight:       String(product?.weight ?? ""),
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/brands?limit=100").then((r) => r.json()),
    ]).then(([cats, br]) => {
      setCategories(cats.data?.categories ?? []);
      setBrands(br.data?.brands ?? []);
    });
  }, []);

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name || !form.sku || !form.price || !form.categoryId) {
      toast.error("Please fill in all required fields");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : null,
        stock: parseInt(form.stock),
        weight: form.weight ? parseFloat(form.weight) : null,
        brandId: form.brandId || null,
        tags: form.tags ? form.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [],
        images: images.filter((i) => i.url),
        specifications: specs.filter((s) => s.name && s.value),
        ...(product?.id ? { id: product.id } : {}),
      };

      const res = await fetch("/api/admin/products", {
        method: product?.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(product?.id ? "Product updated!" : "Product created!");
      onSave();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="bg-white dark:bg-surface-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100 dark:border-surface-800 sticky top-0 bg-white dark:bg-surface-900 z-10">
          <h2 className="font-semibold text-lg text-surface-900 dark:text-white">
            {product?.id ? "Edit Product" : "Add Product"}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Input label="Product Name *" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Crème de la Mer 60ml" />
            </div>
            <Input label="SKU *" value={form.sku} onChange={(e) => set("sku", e.target.value)} placeholder="SKC-0001" />
            <Input label="Weight (g)" type="number" value={form.weight} onChange={(e) => set("weight", e.target.value)} placeholder="50" />
          </div>

          <div>
            <label className={labelCls}>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 text-surface-900 dark:text-white p-4 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input label="Price *" type="number" step="0.01" value={form.price} onChange={(e) => set("price", e.target.value)} />
            <Input label="Compare Price" type="number" step="0.01" value={form.comparePrice} onChange={(e) => set("comparePrice", e.target.value)} />
            <Input label="Stock *" type="number" value={form.stock} onChange={(e) => set("stock", e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Category *</label>
              <select value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)} className={inputCls}>
                <option value="">Select category…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.parentId ? `  ↳ ${c.name}` : c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Brand</label>
              <select value={form.brandId} onChange={(e) => set("brandId", e.target.value)} className={inputCls}>
                <option value="">No brand</option>
                {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          </div>

          <Input label="Tags (comma separated)" value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="skincare, luxury" />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {["isFeatured", "isBestSeller", "isNewArrival", "isOnSale"].map((key) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={Boolean(form[key as keyof typeof form])} onChange={(e) => set(key, e.target.checked)} className="w-4 h-4 rounded border-surface-300 text-brand-500 focus:ring-brand-500" />
                <span className="text-sm text-surface-700 dark:text-surface-300">{key.replace("is", "")}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-surface-100 dark:border-surface-800 sticky bottom-0 bg-white dark:bg-surface-900">
          <Button onClick={onClose} variant="outline">Cancel</Button>
          <Button onClick={handleSubmit} loading={loading} variant="gold">
            {product?.id ? "Update Product" : "Create Product"}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}