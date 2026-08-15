"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

interface Props {
  productId: string;
  compact?: boolean;
}

export function NotifyMe({ productId, compact = false }: Props) {
  const t = useTranslations("product");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [open, setOpen] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch("/api/notify-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDone(true);
      toast.success(t("notifySuccess"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("notifyFailed"));
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <p style={{ fontSize: 11, color: "var(--gold)", letterSpacing: "0.08em", textAlign: compact ? "center" : "left" }}>
        ✓ {t("notifyConfirmed")}
      </p>
    );
  }

  if (compact) {
    if (!open) {
      return (
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(true); }}
          className="btn-cart"
          style={{ fontSize: 10, letterSpacing: "0.12em" }}
        >
          {t("notifyMe")}
        </button>
      );
    }
    return (
      <form onSubmit={submit} onClick={e => e.stopPropagation()} className="flex gap-1">
        <input
          autoFocus
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          style={{
            flex: 1, minWidth: 0, height: 34, padding: "0 8px",
            fontSize: 11, border: "1px solid var(--border)",
            background: "var(--bg)", color: "var(--chalk)",
            outline: "none",
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            height: 34, padding: "0 10px",
            background: "var(--chalk)", color: "var(--bg)",
            fontSize: 9, fontWeight: 700, letterSpacing: "0.12em",
            textTransform: "uppercase", border: "none",
            cursor: loading ? "wait" : "pointer",
            opacity: loading ? 0.6 : 1, flexShrink: 0,
          }}
        >
          {loading ? "…" : t("submit")}
        </button>
      </form>
    );
  }

  return (
    <div style={{ marginBottom: 11 }}>
      <p style={{ fontSize: 11, color: "var(--chalk2)", letterSpacing: "0.06em", marginBottom: 10 }}>
        {t("notifyLabel")}
      </p>
      <form onSubmit={submit} style={{ display: "flex", gap: 8 }}>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          style={{
            flex: 1, height: 46, padding: "0 14px",
            fontSize: 13, border: "1px solid var(--border)",
            background: "transparent", color: "var(--chalk)",
            outline: "none", transition: "border-color 0.15s",
          }}
          onFocus={e => { e.currentTarget.style.borderColor = "var(--gold)"; }}
          onBlur={e => { e.currentTarget.style.borderColor = "var(--border)"; }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            height: 46, padding: "0 22px",
            background: "var(--chalk)", color: "var(--bg)",
            fontFamily: "var(--sans)", fontSize: 11, fontWeight: 700,
            letterSpacing: "0.14em", textTransform: "uppercase",
            border: "none", cursor: loading ? "wait" : "pointer",
            opacity: loading ? 0.7 : 1, transition: "opacity 0.2s",
          }}
        >
          {loading ? "…" : t("notifyMe")}
        </button>
      </form>
    </div>
  );
}
