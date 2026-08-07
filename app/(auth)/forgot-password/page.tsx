"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
// K Night Market redesign

function KInput({ label, error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  return (
    <div style={{ width: "100%" }}>
      <label style={{ display: "block", fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--chalk2)", marginBottom: 8 }}>{label}</label>
      <input
        style={{ width: "100%", padding: "12px 16px", background: "transparent", border: "1px solid var(--borderg)", color: "var(--chalk)", fontSize: 14, outline: "none", transition: "border-color 0.2s" }}
        onFocus={e => (e.currentTarget.style.borderColor = "var(--gold)")}
        onBlur={e => (e.currentTarget.style.borderColor = "var(--borderg)")}
        {...props}
      />
      {error && <p style={{ fontSize: 11, color: "var(--crimson)", marginTop: 4 }}>{error}</p>}
    </div>
  );
}

export default function ForgotPasswordPage() {
  const t = useTranslations("auth.forgotPassword");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const requestReset = async () => {
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error(t("errors.email"));
      return;
    }
    setLoading(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } catch {
      toast.error(t("errors.failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100svh", display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 24px", background: "var(--bg)" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <Link href="/" style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 700, color: "var(--chalk)", textDecoration: "none" }}>
            Everything <em style={{ color: "var(--gold)", fontStyle: "italic" }}>Street</em>
          </Link>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: 28, fontWeight: 700, color: "var(--chalk)", marginTop: 28, marginBottom: 8 }}>{t("title")}</h1>
          <p style={{ fontSize: 13, color: "var(--chalk2)" }}>{t("subtitle")}</p>
        </div>

        <div style={{ border: "1px solid var(--border)", padding: 36 }}>
          {sent ? (
            <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <div style={{ width: 52, height: 52, border: "1px solid var(--gold)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Mail size={22} style={{ color: "var(--gold)" }} />
              </div>
              <p style={{ fontSize: 14, color: "var(--chalk2)", lineHeight: 1.6 }}>{t("sentDesc2")}</p>
              <Link href="/login" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--chalk2)", textDecoration: "none" }}>
                <ArrowLeft size={13} /> {t("back")}
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <KInput
                label={t("email")} id="email" type="email"
                placeholder="you@example.com" value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && requestReset()}
              />
              <button
                onClick={requestReset} disabled={loading}
                style={{ width: "100%", padding: "14px 24px", background: "var(--gold)", color: "#000", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", border: "none", cursor: loading ? "wait" : "pointer", opacity: loading ? 0.7 : 1, transition: "0.2s" }}
              >
                {loading ? "…" : t("send")}
              </button>
              <Link href="/login" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--chalk2)", textDecoration: "none" }}>
                <ArrowLeft size={13} /> {t("back")}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
