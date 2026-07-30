"use client";
import { useState, useEffect } from "react";
import { Plus, Trash2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Checkbox } from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

interface Address {
  id: string;
  label: string;
  firstName: string;
  lastName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

const BLANK = { label: "Home", firstName: "", lastName: "", line1: "", line2: "", city: "", state: "", postalCode: "", country: "US", isDefault: false };

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(BLANK);

  const fetchAddresses = () => {
    setLoading(true);
    fetch("/api/account/addresses")
      .then(r => r.json())
      .then(d => setAddresses(d.data?.addresses ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAddresses(); }, []);

  const handleSave = async () => {
    if (!form.firstName || !form.lastName || !form.line1 || !form.city || !form.state || !form.postalCode) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/account/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast.success("Address saved!");
      setShowForm(false);
      setForm(BLANK);
      fetchAddresses();
    } catch {
      toast.error("Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this address?")) return;
    await fetch("/api/account/addresses", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    toast.success("Address deleted");
    fetchAddresses();
  };

  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-surface-900 dark:text-white mb-1">Addresses</h1>
          <p className="text-surface-500 text-sm">Manage your shipping addresses</p>
        </div>
        <Button onClick={() => setShowForm(f => !f)} variant="gold" size="sm" leftIcon={<Plus size={16} />}>
          Add Address
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-6 space-y-4"
          >
            <h2 className="font-semibold text-surface-900 dark:text-white">New Address</h2>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Label" value={form.label} onChange={e => set("label", e.target.value)} placeholder="Home, Work..." />
              <div />
              <Input label="First Name *" value={form.firstName} onChange={e => set("firstName", e.target.value)} />
              <Input label="Last Name *" value={form.lastName} onChange={e => set("lastName", e.target.value)} />
              <div className="col-span-2">
                <Input label="Address *" value={form.line1} onChange={e => set("line1", e.target.value)} />
              </div>
              <div className="col-span-2">
                <Input label="Apartment, suite, etc." value={form.line2} onChange={e => set("line2", e.target.value)} />
              </div>
              <Input label="City *" value={form.city} onChange={e => set("city", e.target.value)} />
              <Input label="State *" value={form.state} onChange={e => set("state", e.target.value)} />
              <Input label="Postal Code *" value={form.postalCode} onChange={e => set("postalCode", e.target.value)} />
              <Input label="Country" value={form.country} onChange={e => set("country", e.target.value)} />
            </div>
            <Checkbox id="default" label="Set as default address" checked={form.isDefault} onChange={e => set("isDefault", e.target.checked)} />
            <div className="flex gap-3">
              <Button onClick={handleSave} loading={saving} variant="gold">Save Address</Button>
              <Button onClick={() => { setShowForm(false); setForm(BLANK); }} variant="outline">Cancel</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="space-y-4">
          {[1,2].map(i => <div key={i} className="h-32 rounded-2xl bg-surface-100 dark:bg-surface-800 animate-pulse" />)}
        </div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-surface-200 dark:border-surface-700">
          <MapPin size={40} className="text-surface-300 mx-auto mb-3" />
          <p className="text-surface-500">No addresses yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map(addr => (
            <div key={addr.id} className="flex items-start justify-between gap-4 bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm text-surface-900 dark:text-white">{addr.label}</span>
                  {addr.isDefault && <span className="text-xs px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 font-medium">Default</span>}
                </div>
                <p className="text-sm text-surface-600 dark:text-surface-400">{addr.firstName} {addr.lastName}</p>
                <p className="text-sm text-surface-500">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}</p>
                <p className="text-sm text-surface-500">{addr.city}, {addr.state} {addr.postalCode}, {addr.country}</p>
              </div>
              <button onClick={() => handleDelete(addr.id)} className="text-surface-400 hover:text-red-500 transition-colors mt-1">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
