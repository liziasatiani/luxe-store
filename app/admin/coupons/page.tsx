"use client";
import { useEffect, useState } from "react";
import { Plus, Trash2, Tag, Copy, Pencil } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input, Badge, Spinner } from "@/components/ui";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";

interface Coupon {
  id: string; code: string; type: string; value: number;
  minOrderAmount?: number | null; maxDiscount?: number | null;
  usageLimit?: number | null; perUserLimit?: number | null;
  usageCount: number; isActive: boolean; description?: string | null;
}

const EMPTY_FORM = {
  code: "", type: "PERCENTAGE", value: "",
  minOrderAmount: "", maxDiscount: "",
  usageLimit: "", perUserLimit: "1", description: "",
};

const inputCls = "h-11 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 text-surface-900 dark:text-white px-4 focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition-colors";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);

  const fetchCoupons = () => {
    setLoading(true);
    fetch("/api/admin/coupons")
      .then((r) => r.json())
      .then((d) => setCoupons(d.data?.coupons ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCoupons(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  };

  const openEdit = (c: Coupon) => {
    setEditingId(c.id);
    setForm({
      code: c.code,
      type: c.type,
      value: String(c.value),
      minOrderAmount: c.minOrderAmount != null ? String(c.minOrderAmount) : "",
      maxDiscount: c.maxDiscount != null ? String(c.maxDiscount) : "",
      usageLimit: c.usageLimit != null ? String(c.usageLimit) : "",
      perUserLimit: c.perUserLimit != null ? String(c.perUserLimit) : "1",
      description: c.description ?? "",
    });
    setFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSave = async () => {
    if (!form.code || !form.value) { toast.error("Code and value required"); return; }
    setSaving(true);
    try {
      const payload = {
        ...(editingId ? { id: editingId } : {}),
        ...form,
        value: parseFloat(form.value),
        minOrderAmount: form.minOrderAmount ? parseFloat(form.minOrderAmount) : null,
        maxDiscount: form.maxDiscount ? parseFloat(form.maxDiscount) : null,
        usageLimit: form.usageLimit ? parseInt(form.usageLimit) : null,
        perUserLimit: parseInt(form.perUserLimit) || 1,
      };
      const res = await fetch("/api/admin/coupons", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(editingId ? "Coupon updated!" : "Coupon created!");
      setFormOpen(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
      fetchCoupons();
    } catch { toast.error(editingId ? "Failed to update coupon" : "Failed to create coupon"); }
    finally { setSaving(false); }
  };

  const closeForm = () => { setFormOpen(false); setEditingId(null); setForm(EMPTY_FORM); };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !isActive }),
      });
      if (!res.ok) throw new Error();
      fetchCoupons();
    } catch { toast.error("Failed to update coupon"); }
  };

  const deleteCoupon = async (id: string) => {
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error();
      toast.success("Coupon deleted");
      if (editingId === id) closeForm();
      setConfirmingDelete(null);
      fetchCoupons();
    } catch { toast.error("Failed to delete coupon"); }
  };

  const setField = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-surface-900 dark:text-white">Coupons</h1>
          <p className="text-surface-500 text-sm mt-1">{coupons.length} coupons</p>
        </div>
        <Button onClick={openCreate} variant="gold" leftIcon={<Plus size={16} />}>New Coupon</Button>
      </div>

      {formOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-6 space-y-4"
        >
          <p className="text-sm font-semibold text-surface-900 dark:text-white">
            {editingId ? `Editing — ${form.code}` : "New Coupon"}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Input label="Code" value={form.code} onChange={(e) => setField("code", e.target.value.toUpperCase())} placeholder="SAVE20" />
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Type</label>
              <select value={form.type} onChange={(e) => setField("type", e.target.value)} className={inputCls + " w-full"}>
                <option value="PERCENTAGE">Percentage</option>
                <option value="FIXED_AMOUNT">Fixed Amount</option>
                <option value="FREE_SHIPPING">Free Shipping</option>
              </select>
            </div>
            <Input label="Value" type="number" value={form.value} onChange={(e) => setField("value", e.target.value)} placeholder={form.type === "PERCENTAGE" ? "20" : "10.00"} />
            <Input label="Min Order Amount" type="number" value={form.minOrderAmount} onChange={(e) => setField("minOrderAmount", e.target.value)} placeholder="50.00" />
            <Input label="Max Discount" type="number" value={form.maxDiscount} onChange={(e) => setField("maxDiscount", e.target.value)} placeholder="100.00" />
            <Input label="Usage Limit" type="number" value={form.usageLimit} onChange={(e) => setField("usageLimit", e.target.value)} placeholder="1000" />
          </div>
          <Input label="Description" value={form.description} onChange={(e) => setField("description", e.target.value)} placeholder="20% off all orders" />
          <div className="flex justify-end gap-3">
            <Button onClick={closeForm} variant="outline">Cancel</Button>
            <Button onClick={handleSave} loading={saving} variant="gold">
              {editingId ? "Save Changes" : "Create Coupon"}
            </Button>
          </div>
        </motion.div>
      )}

      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner size={28} /></div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-50 dark:bg-surface-800/50 border-b border-surface-100 dark:border-surface-800">
              <tr>
                {["Code", "Type", "Value", "Usage", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
              {coupons.map((c) => (
                <tr key={c.id} className={`hover:bg-surface-50 dark:hover:bg-surface-800/30 transition-colors ${editingId === c.id ? "bg-brand-50/40 dark:bg-brand-900/10" : ""}`}>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => { navigator.clipboard.writeText(c.code); toast.success("Copied!"); }}
                      className="flex items-center gap-2 font-mono text-sm font-bold text-surface-900 dark:text-white hover:text-brand-500"
                    >
                      <Tag size={12} /> {c.code} <Copy size={11} className="text-surface-300" />
                    </button>
                    {c.description && <p className="text-xs text-surface-400 mt-0.5">{c.description}</p>}
                  </td>
                  <td className="px-4 py-3 text-sm text-surface-600 dark:text-surface-400">{c.type.replaceAll("_", " ")}</td>
                  <td className="px-4 py-3 text-sm font-medium">
                    {c.type === "PERCENTAGE" ? `${c.value}%` : c.type === "FIXED_AMOUNT" ? formatPrice(c.value) : "Free"}
                  </td>
                  <td className="px-4 py-3 text-sm text-surface-500">
                    {c.usageCount}{c.usageLimit ? ` / ${c.usageLimit}` : ""}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(c.id, c.isActive)}>
                      <Badge variant={c.isActive ? "success" : "default"} size="sm">
                        {c.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    {confirmingDelete === c.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-surface-500">Delete?</span>
                        <button onClick={() => deleteCoupon(c.id)} className="text-xs px-2 py-1 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors">Yes</button>
                        <button onClick={() => setConfirmingDelete(null)} className="text-xs px-2 py-1 rounded-lg border border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors">No</button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500 hover:text-surface-900 dark:hover:text-white transition-colors">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => setConfirmingDelete(c.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-surface-500 hover:text-red-500 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
}
