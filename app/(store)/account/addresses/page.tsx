"use client";
import { useState, useEffect } from "react";
import { Plus, Trash2, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

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

const BLANK = { label: "Home", firstName: "", lastName: "", line1: "", line2: "", city: "", state: "", postalCode: "", country: "GE", isDefault: false };

function KInput({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div style={{ width: "100%" }}>
      {label && <label style={{ display: "block", fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--chalk2)", marginBottom: 6 }}>{label}</label>}
      <input
        style={{ width: "100%", padding: "10px 12px", background: "transparent", border: "1px solid var(--borderg)", color: "var(--chalk)", fontSize: 13, outline: "none", transition: "border-color 0.2s" }}
        onFocus={e => (e.currentTarget.style.borderColor = "var(--gold)")}
        onBlur={e => (e.currentTarget.style.borderColor = "var(--borderg)")}
        {...props}
      />
    </div>
  );
}

export default function AddressesPage() {
  const t = useTranslations("account.addresses");
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
      toast.error(t("errors.required"));
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
      toast.success(t("saved"));
      setShowForm(false);
      setForm(BLANK);
      fetchAddresses();
    } catch {
      toast.error(t("errors.save"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("confirmDelete"))) return;
    try {
      const res = await fetch("/api/account/addresses", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error();
      toast.success(t("deleted"));
      fetchAddresses();
    } catch {
      toast.error(t("errors.delete"));
    }
  };

  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: 26, fontWeight: 700, color: "var(--chalk)", marginBottom: 4 }}>{t("title")}</h1>
          <p style={{ fontSize: 12, color: "var(--chalk3)" }}>{t("subtitle")}</p>
        </div>
        <button
          onClick={() => setShowForm(f => !f)}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 16px", background: "var(--gold)", color: "#000", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", border: "none", cursor: "pointer", flexShrink: 0 }}
        >
          <Plus size={13} /> {t("add")}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            style={{ border: "1px solid var(--border)", padding: 24, background: "var(--s1)" }}
          >
            <h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--chalk2)", marginBottom: 20 }}>{t("newAddress")}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <KInput label={t("label")} value={form.label} onChange={e => set("label", e.target.value)} placeholder={t("labelPlaceholder")} />
              <div />
              <KInput label={t("firstName")} value={form.firstName} onChange={e => set("firstName", e.target.value)} />
              <KInput label={t("lastName")} value={form.lastName} onChange={e => set("lastName", e.target.value)} />
              <div style={{ gridColumn: "span 2" }}>
                <KInput label={t("addressLine")} value={form.line1} onChange={e => set("line1", e.target.value)} />
              </div>
              <div style={{ gridColumn: "span 2" }}>
                <KInput label={t("apartment")} value={form.line2} onChange={e => set("line2", e.target.value)} />
              </div>
              <KInput label={t("city")} value={form.city} onChange={e => set("city", e.target.value)} />
              <KInput label={t("state")} value={form.state} onChange={e => set("state", e.target.value)} />
              <KInput label={t("postalCode")} value={form.postalCode} onChange={e => set("postalCode", e.target.value)} />
              <KInput label={t("country")} value={form.country} onChange={e => set("country", e.target.value)} />
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={e => set("isDefault", e.target.checked)}
                style={{ width: 14, height: 14, accentColor: "var(--gold)", cursor: "pointer" }}
              />
              <span style={{ fontSize: 12, color: "var(--chalk2)" }}>{t("setDefault")}</span>
            </label>
            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              <button
                onClick={handleSave} disabled={saving}
                style={{ padding: "10px 20px", background: "var(--gold)", color: "#000", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", border: "none", cursor: saving ? "wait" : "pointer", opacity: saving ? 0.7 : 1 }}
              >
                {saving ? "…" : t("save")}
              </button>
              <button
                onClick={() => { setShowForm(false); setForm(BLANK); }}
                style={{ padding: "10px 20px", background: "transparent", color: "var(--chalk2)", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", border: "1px solid var(--borderg)", cursor: "pointer" }}
              >
                {t("cancel")}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[1,2].map(i => <div key={i} style={{ height: 80, background: "var(--s2)", animation: "pulse 1.5s ease-in-out infinite" }} />)}
        </div>
      ) : addresses.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "56px 24px", textAlign: "center", border: "1px dashed var(--borderg)" }}>
          <MapPin size={32} style={{ color: "var(--border)", marginBottom: 12 }} />
          <p style={{ fontSize: 12, color: "var(--chalk3)" }}>{t("noAddresses")}</p>
        </div>
      ) : (
        <div style={{ border: "1px solid var(--border)", display: "flex", flexDirection: "column" }}>
          {addresses.map((addr, idx) => (
            <div key={addr.id} style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, padding: "16px 20px", background: "var(--s1)", borderBottom: idx < addresses.length - 1 ? "1px solid var(--border)" : "none" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--chalk)", letterSpacing: "0.04em" }}>{addr.label}</span>
                  {addr.isDefault && (
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gold)", padding: "2px 7px", border: "1px solid var(--gold)" }}>
                      {t("default")}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 12, color: "var(--chalk2)" }}>{addr.firstName} {addr.lastName}</p>
                <p style={{ fontSize: 12, color: "var(--chalk3)", marginTop: 2 }}>{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}</p>
                <p style={{ fontSize: 12, color: "var(--chalk3)" }}>{addr.city}, {addr.state} {addr.postalCode}, {addr.country}</p>
              </div>
              <button
                onClick={() => handleDelete(addr.id)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--chalk3)", padding: 4, marginTop: 2, transition: "color 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--crimson)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--chalk3)")}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
