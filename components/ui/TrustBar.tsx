"use client";
import { Shield, Truck, RotateCcw } from "lucide-react";

const SIGNALS = [
  { icon: Truck, text: "Free shipping over $150" },
  { icon: Shield, text: "100% authentic guaranteed" },
  { icon: RotateCcw, text: "30-day free returns" },
];

export function TrustBar() {
  return (
    <div className="border-y border-black/8 dark:border-white/8 bg-white dark:bg-black">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-center gap-6 sm:gap-10 flex-wrap">
        {SIGNALS.map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-2">
            <Icon size={14} className="text-black/40 dark:text-white/40 shrink-0" />
            <span className="text-[11px] tracking-[0.08em] uppercase text-black/60 dark:text-white/60 whitespace-nowrap">{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
