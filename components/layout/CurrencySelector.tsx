"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useCurrencyStore } from "@/store";
import { cn } from "@/lib/utils";

const CURRENCIES = [
  { code: "GEL" as const, label: "GEL", symbol: "₾" },
  { code: "USD" as const, label: "USD", symbol: "$" },
];

export function CurrencySelector() {
  const { currency, setCurrency } = useCurrencyStore();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const current = CURRENCIES.find(c => c.code === currency) ?? CURRENCIES[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={`Currency: ${current.label}`}
        aria-expanded={open}
        className="flex items-center gap-1.5 px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.12em] uppercase rounded-full border text-brand-500 transition-all hover:bg-brand-500/18"
        style={{ borderColor: "var(--borderg)", color: "var(--gold)" }}
      >
        <span className="text-[11px] tracking-[0.1em] uppercase">{current.label}</span>
        <ChevronDown size={10} className={cn("transition-transform", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 top-full mt-2 w-32 py-1 z-50 rounded-sm"
              style={{ background: "rgba(7,9,15,0.96)", border: "1px solid rgba(201,164,74,0.25)", backdropFilter: "blur(20px)" }}
            >
              {CURRENCIES.map((c) => (
                <button
                  key={c.code}
                  onClick={() => { setCurrency(c.code); setOpen(false); }}
                  className={cn(
                    "flex items-center gap-3 w-full px-4 py-2.5 text-[11px] font-semibold tracking-[0.12em] uppercase transition-colors",
                    c.code === currency ? "text-brand-500" : "text-white/55 hover:text-white"
                  )}
                >
                  <span>{c.symbol}</span>
                  <span>{c.label}</span>
                  {c.code === currency && <span className="ml-auto">✓</span>}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
