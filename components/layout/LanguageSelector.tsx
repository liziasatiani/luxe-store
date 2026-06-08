"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Globe } from "lucide-react";
import { locales, localeNames, localeFlags, LOCALE_COOKIE, type Locale } from "@/i18n";
import { cn } from "@/lib/utils";

function getStoredLocale(): Locale {
  if (typeof document === "undefined") return "en";
  const match = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]*)`));
  const val = match ? decodeURIComponent(match[1]) : "en";
  return locales.includes(val as Locale) ? (val as Locale) : "en";
}

export function LanguageSelector() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [currentLocale, setCurrentLocale] = useState<Locale>(() => getStoredLocale());

  const switchLocale = (newLocale: Locale) => {
    setOpen(false);
    // Set cookie for 1 year
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);
    document.cookie = `${LOCALE_COOKIE}=${newLocale}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
    setCurrentLocale(newLocale);
    // Refresh to re-render with new locale from server
    router.refresh();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 h-10 px-3 rounded-xl text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors text-sm font-medium"
      >
        <Globe size={16} />
        <span>{localeFlags[currentLocale]}</span>
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
              className="absolute right-0 top-full mt-2 w-44 bg-white dark:bg-surface-900 rounded-2xl shadow-xl border border-surface-100 dark:border-surface-800 py-2 z-50"
            >
              {locales.map((l) => (
                <button
                  key={l}
                  onClick={() => switchLocale(l)}
                  className={cn(
                    "flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-colors",
                    l === currentLocale
                      ? "text-brand-500 bg-brand-50 dark:bg-brand-900/20"
                      : "text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800"
                  )}
                >
                  <span className="text-base">{localeFlags[l]}</span>
                  <span>{localeNames[l]}</span>
                  {l === currentLocale && <span className="ml-auto text-brand-500">✓</span>}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
