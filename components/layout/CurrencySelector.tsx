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
        className="flex items-center gap-1 p-1 text-black dark:text-white hover:opacity-50 transition-opacity text-sm"
      >
        <span className="text-[11px] tracking-[0.06em] uppercase font-medium">{current.symbol} {current.label}</span>
        <ChevronDown size={12} className={cn("transition-transform", open && "rotate-180")} />
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
              className="absolute right-0 top-full mt-3 w-32 bg-white dark:bg-black border border-black/10 dark:border-white/10 py-1 z-50"
            >
              {CURRENCIES.map((c) => (
                <button
                  key={c.code}
                  onClick={() => { setCurrency(c.code); setOpen(false); }}
                  className={cn(
                    "flex items-center gap-3 w-full px-4 py-2.5 text-[11px] tracking-[0.06em] uppercase transition-colors",
                    c.code === currency
                      ? "text-black dark:text-white"
                      : "text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white"
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
