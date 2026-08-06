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
    <div className="border-y border-black/8 dark:border-white/8 bg-white dark:bg-black">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-center gap-6 sm:gap-10 flex-wrap">
        {signals.map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-2">
            <Icon size={14} className="text-black/60 dark:text-white/60 shrink-0" />
            <span className="text-[11px] tracking-[0.08em] uppercase text-black/60 dark:text-white/60 whitespace-nowrap">{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
