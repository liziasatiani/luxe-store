"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { X, Plus, Trash2, UploadCloud, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui";
import toast from "react-hot-toast";

interface ProductFormProps {
  product?: Record<string, unknown> | null;
  onClose: () => void;
  onSave: () => void;
}

const inputCls = "w-full h-11 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 text-surface-900 dark:text-white px-4 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-colors";
const labelCls = "block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5";

export function ProductForm({ product, onClose, onSave }: ProductFormProps) {
  const [categories, setCategories] = useState<Array<{ id: string; name: string; parentId: string | null }>>([]);
  const [brands, setBrands] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<Array<{ url: string; isPrimary: boolean }>>(
    (product?.images as Array<{ url: string; isPrimary: boolean }>) ?? [{ url: "", isPrimary: true }]
  );
  const [specs, setSpecs] = useState<Array<{ name: string; value: string }>>(
    (product?.specifications as Array<{ name: string; value: string }>) ?? []
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
    tags:         ((product?.tags as string[]) ?? []).join(", "),
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

  const uploadFiles = useCallback(async (files: FileList | File[]) => {
    const accepted = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!accepted.length) return;
    setUploading(true);
    try {
      const fd = new FormData();
      accepted.forEach((f) => fd.append("files", f));
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setImages((prev) => {
        const filtered = prev.filter((i) => i.url);
        const newImgs = (data.urls as string[]).map((url, idx) => ({
          url,
          isPrimary: filtered.length === 0 && idx === 0,
        }));
        return [...filtered, ...newImgs];
      });
      toast.success(`${data.urls.length} image${data.urls.length > 1 ? "s" : ""} uploaded`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }, []);

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
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
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
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100 dark:border-surface-800 sticky top-0 bg-white dark:bg-surface-900 z-10">
          <h2 className="font-semibold text-lg text-surface-900 dark:text-white">
            {product?.id ? "Edit Product" : "Add Product"}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Input label="Product Name *" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Crème de la Mer 60ml" />
            </div>
            <Input label="SKU *" value={form.sku} onChange={(e) => set("sku", e.target.value)} placeholder="SKC-0001" />
            <Input label="Weight / Volume (g or ml)" type="number" value={form.weight} onChange={(e) => set("weight", e.target.value)} placeholder="50" />
          </div>

          {/* Description */}
          <div>
            <label className={labelCls}>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={4}
              placeholder="Full product description…"
              className="w-full rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 text-surface-900 dark:text-white p-4 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 placeholder:text-surface-400 transition-colors resize-none"
            />
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-3 gap-4">
            <Input label="Price *" type="number" step="0.01" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="0.00" />
            <Input label="Compare Price" type="number" step="0.01" value={form.comparePrice} onChange={(e) => set("comparePrice", e.target.value)} placeholder="0.00" />
            <Input label="Stock *" type="number" value={form.stock} onChange={(e) => set("stock", e.target.value)} placeholder="0" />
          </div>

          {/* Category & Brand */}
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

          {/* Tags */}
          <Input label="Tags (comma separated)" value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="skincare, luxury, moisturiser" />

          {/* Flags */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { key: "isFeatured",   label: "Featured"     },
              { key: "isBestSeller", label: "Best Seller"  },
              { key: "isNewArrival", label: "New Arrival"  },
              { key: "isOnSale",     label: "On Sale"      },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(form[key as keyof typeof form])}
                  onChange={(e) => set(key, e.target.checked)}
                  className="w-4 h-4 rounded border-surface-300 text-brand-500 focus:ring-brand-500"
                />
                <span className="text-sm text-surface-700 dark:text-surface-300">{label}</span>
              </label>
            ))}
          </div>

          {/* Images */}
          <div>
            <p className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-3">Images</p>

            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); uploadFiles(e.dataTransfer.files); }}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl py-8 cursor-pointer transition-colors mb-4 ${
                dragOver
                  ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10"
                  : "border-surface-200 dark:border-surface-700 hover:border-brand-400"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && uploadFiles(e.target.files)}
              />
              {uploading ? (
                <>
                  <Loader2 size={22} className="text-brand-500 animate-spin" />
                  <p className="text-sm text-surface-500">Uploading…</p>
                </>
              ) : (
                <>
                  <UploadCloud size={22} className="text-surface-400" />
                  <p className="text-sm text-surface-500">
                    <span className="text-brand-500 font-medium">Click to upload</span> or drag & drop
                  </p>
                  <p className="text-xs text-surface-400">PNG, JPG, WEBP — multiple files supported</p>
                </>
              )}
            </div>

            {/* Uploaded image list */}
            {images.filter((i) => i.url).length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {images.filter((i) => i.url).map((img, i) => (
                  <div key={i} className="relative group rounded-xl overflow-hidden border border-surface-200 dark:border-surface-700 aspect-square">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      <button
                        onClick={() => setImages((imgs) => imgs.map((im, j) => j === i ? { ...im, isPrimary: true } : { ...im, isPrimary: false }))}
                        className="text-[10px] px-2 py-1 bg-white/90 text-black rounded font-medium"
                      >
                        {img.isPrimary ? "✓ Primary" : "Set Primary"}
                      </button>
                      <button
                        onClick={() => setImages((imgs) => imgs.filter((_, j) => j !== i))}
                        className="p-1 bg-red-500 text-white rounded"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    {img.isPrimary && (
                      <span className="absolute top-1.5 left-1.5 text-[10px] bg-brand-500 text-white px-1.5 py-0.5 rounded font-medium">
                        Primary
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Manual URL fallback */}
            <button
              onClick={() => setImages((i) => [...i, { url: "", isPrimary: i.filter(x => x.url).length === 0 }])}
              className="flex items-center gap-1 text-xs text-surface-400 hover:text-brand-500 mt-3 transition-colors"
            >
              <Plus size={11} /> Add image by URL instead
            </button>
            {images.some((i) => !i.url.startsWith("http") || i.url === "") && images.some((i) => i.url === "") && (
              <div className="space-y-2 mt-2">
                {images.filter((i) => i.url === "").map((img, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input
                      placeholder="https://…"
                      value={img.url}
                      onChange={(e) => {
                        const allImgs = [...images];
                        const emptyIdxs = allImgs.map((im, j) => im.url === "" ? j : -1).filter(j => j >= 0);
                        allImgs[emptyIdxs[i]] = { ...allImgs[emptyIdxs[i]], url: e.target.value };
                        setImages(allImgs);
                      }}
                      className="flex-1 h-9 text-sm"
                    />
                    <button
                      onClick={() => setImages((imgs) => imgs.filter((im) => im !== img))}
                      className="text-surface-400 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Specs */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-surface-700 dark:text-surface-300">Specifications</p>
              <button
                onClick={() => setSpecs((s) => [...s, { name: "", value: "" }])}
                className="flex items-center gap-1 text-xs text-brand-500 hover:text-brand-600"
              >
                <Plus size={12} /> Add Spec
              </button>
            </div>
            <div className="space-y-2">
              {specs.map((spec, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Input
                    placeholder="Name"
                    value={spec.name}
                    onChange={(e) => setSpecs((s) => s.map((sp, j) => j === i ? { ...sp, name: e.target.value } : sp))}
                    className="flex-1 h-9 text-sm"
                  />
                  <Input
                    placeholder="Value"
                    value={spec.value}
                    onChange={(e) => setSpecs((s) => s.map((sp, j) => j === i ? { ...sp, value: e.target.value } : sp))}
                    className="flex-1 h-9 text-sm"
                  />
                  <button onClick={() => setSpecs((s) => s.filter((_, j) => j !== i))} className="text-surface-400 hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
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
