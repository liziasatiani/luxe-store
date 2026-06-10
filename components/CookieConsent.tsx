"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const COOKIE_KEY = "luxe-cookie-consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(COOKIE_KEY)) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem(COOKIE_KEY, "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(COOKIE_KEY, "declined");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          role="dialog"
          aria-label="Cookie consent"
          className="fixed bottom-4 left-4 right-4 z-[100] md:left-auto md:right-6 md:max-w-sm"
        >
          <div className="bg-white dark:bg-black border border-black/10 dark:border-white/10 p-5">
            <p className="text-[11px] tracking-[0.08em] uppercase font-medium text-black dark:text-white mb-1">We use cookies</p>
            <p className="text-xs text-black/50 dark:text-white/50 leading-relaxed mb-4">
              We use cookies to improve your experience. By continuing, you agree to our{" "}
              <Link href="/privacy" className="underline hover:opacity-60 transition-opacity">
                Privacy Policy
              </Link>
              .
            </p>
            <div className="flex gap-2">
              <button
                onClick={decline}
                className="flex-1 h-9 px-4 text-[11px] tracking-[0.08em] uppercase border border-black/15 dark:border-white/15 text-black/60 dark:text-white/60 hover:border-black/40 dark:hover:border-white/40 transition-colors"
              >
                Decline
              </button>
              <button
                onClick={accept}
                className="flex-1 h-9 px-4 text-[11px] tracking-[0.08em] uppercase bg-black dark:bg-white text-white dark:text-black hover:bg-black/80 dark:hover:bg-white/80 transition-colors"
              >
                Accept
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
