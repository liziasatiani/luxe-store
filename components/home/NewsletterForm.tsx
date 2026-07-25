"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";

interface NewsletterFormProps {
  minimal?: boolean;
}

export function NewsletterForm({ minimal = false }: NewsletterFormProps) {
  const t = useTranslations("home.newsletter");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [emailError, setEmailError] = useState("");

  const subscribe = async () => {
    setEmailError("");
    if (!email) { setEmailError(t("emailRequired")); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailError(t("emailInvalid")); return; }
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStatus(res.ok ? "success" : "error");
      if (res.ok) setEmail("");
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <p className="text-[11px] tracking-[0.1em] uppercase text-white/50 text-center py-4">{t("success")}</p>
    );
  }

  if (minimal) {
    return (
      <div>
        {/* Underline-only input */}
        <div className="relative flex items-center border-b border-white/20 focus-within:border-white/60 transition-colors">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && subscribe()}
            placeholder={t("placeholder")}
            aria-invalid={!!emailError}
            className="flex-1 h-14 bg-transparent text-white/70 placeholder:text-white/20 text-sm tracking-wide focus:outline-none"
          />
          <button
            onClick={subscribe}
            disabled={status === "loading"}
            aria-label={t("subscribe")}
            className="text-white/40 hover:text-white transition-colors disabled:opacity-30 p-1"
          >
            {status === "loading"
              ? <span className="text-[10px] tracking-[0.1em] uppercase">…</span>
              : <ArrowRight size={16} strokeWidth={1.5} />
            }
          </button>
        </div>
        {emailError && <p className="text-[11px] text-red-400 mt-2">{emailError}</p>}
        {status === "error" && <p className="text-[11px] text-red-400 mt-2">{t("error")}</p>}
        <p className="text-[9px] tracking-[0.1em] uppercase text-white/15 mt-5 text-center">{t("noSpam")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-0 border border-white/20">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === "Enter" && subscribe()}
          placeholder={t("placeholder")}
          aria-invalid={!!emailError}
          className="flex-1 h-12 px-5 bg-transparent border-0 text-white placeholder:text-white/25 text-sm focus:outline-none"
        />
        <button
          onClick={subscribe}
          disabled={status === "loading"}
          className="h-12 px-8 bg-white text-black text-[11px] tracking-[0.14em] uppercase font-medium hover:bg-white/90 transition-colors shrink-0 disabled:opacity-50"
        >
          {status === "loading" ? "…" : t("subscribe")}
        </button>
      </div>
      {emailError && <p className="text-xs text-red-400">{emailError}</p>}
      {status === "error" && <p className="text-xs text-red-400">{t("error")}</p>}
      <p className="text-[10px] tracking-[0.06em] uppercase text-white/20">{t("noSpam")}</p>
    </div>
  );
}
