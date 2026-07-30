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
          <div className="bg-white dark:bg-surface-900 rounded-2xl shadow-luxury-lg border border-surface-100 dark:border-surface-800 p-5">
            <p className="text-sm font-medium text-surface-900 dark:text-white mb-1">We use cookies</p>
            <p className="text-xs text-surface-500 dark:text-surface-400 leading-relaxed mb-4">
              We use cookies to improve your experience. By continuing, you agree to our{" "}
              <Link href="/privacy" className="text-brand-500 hover:text-brand-600 underline">
                Privacy Policy
              </Link>
              .
            </p>
            <div className="flex gap-2">
              <button
                onClick={decline}
                className="flex-1 h-9 px-4 text-sm rounded-xl border border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
              >
                Decline
              </button>
              <button
                onClick={accept}
                className="flex-1 h-9 px-4 text-sm rounded-xl bg-surface-900 dark:bg-white text-white dark:text-surface-900 hover:bg-surface-800 dark:hover:bg-surface-100 transition-colors font-medium"
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
