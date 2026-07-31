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
        className="flex items-center gap-1.5 p-1 text-black dark:text-white hover:opacity-50 transition-opacity text-sm"
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
              className="absolute right-0 top-full mt-3 w-44 bg-white dark:bg-black border border-black/10 dark:border-white/10 py-1 z-50"
            >
              {locales.map((l) => (
                <button
                  key={l}
                  onClick={() => switchLocale(l)}
                  className={cn(
                    "flex items-center gap-3 w-full px-4 py-2.5 text-[11px] tracking-[0.06em] uppercase transition-colors",
                    l === currentLocale
                      ? "text-black dark:text-white"
                      : "text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white"
                  )}
                >
                  <span className="text-base">{localeFlags[l]}</span>
                  <span>{localeNames[l]}</span>
                  {l === currentLocale && <span className="ml-auto text-black dark:text-white">✓</span>}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
