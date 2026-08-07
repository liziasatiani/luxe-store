"use client";
import { Shield, Truck, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";

export function TrustBar() {
  const t = useTranslations("product");
  const signals = [
    { icon: Truck,     text: t("trustShipping") },
    { icon: Shield,    text: t("trustAuthentic") },
    { icon: RotateCcw, text: t("trustReturns")  },
  ];
  return (
    <div style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", background: "var(--s1)" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "14px 52px", display: "flex", alignItems: "center", justifyContent: "center", gap: 40, flexWrap: "wrap" }}>
        {signals.map(({ icon: Icon, text }) => (
          <div key={text} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Icon size={13} style={{ color: "var(--chalk2)", flexShrink: 0 }} />
            <span style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--chalk2)", whiteSpace: "nowrap" }}>{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
