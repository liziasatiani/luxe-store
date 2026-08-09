"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { locales, localeNames, localeFlags, LOCALE_COOKIE, type Locale } from "@/i18n.config";
import { cn } from "@/lib/utils";

function getStoredLocale(): Locale {
  if (typeof document === "undefined") return "en";
  const match = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]*)`));
  const val = match ? decodeURIComponent(match[1]) : "ka";
  return locales.includes(val as Locale) ? (val as Locale) : "ka";
}

export function LanguageSelector() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [currentLocale, setCurrentLocale] = useState<Locale>(() => getStoredLocale());

  const switchLocale = (newLocale: Locale) => {
    setOpen(false);
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
        aria-label={`Language: ${currentLocale.toUpperCase()}`}
        aria-expanded={open}
        className="flex items-center gap-1.5 px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.12em] uppercase rounded-full border transition-all hover:bg-brand-500/18"
        style={{ borderColor: "var(--borderg)", color: "var(--gold)" }}
      >
        <span className="text-[11px] tracking-[0.1em] uppercase">{currentLocale.toUpperCase()}</span>
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
              className="absolute left-0 top-full mt-2 w-44 py-1 z-50 rounded-sm"
              style={{ background: "rgba(7,9,15,0.96)", border: "1px solid rgba(201,164,74,0.25)", backdropFilter: "blur(20px)" }}
            >
              {locales.map((l) => (
                <button
                  key={l}
                  onClick={() => switchLocale(l)}
                  className={cn(
                    "flex items-center gap-3 w-full px-4 py-2.5 text-[11px] font-semibold tracking-[0.12em] uppercase transition-colors",
                    l === currentLocale ? "text-brand-500" : "text-white/55 hover:text-white"
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
