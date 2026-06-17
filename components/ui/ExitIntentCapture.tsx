"use client";
import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FocusTrap from "focus-trap-react";

const STORAGE_KEY = "everything-street-exit-intent-dismissed";
const COOLDOWN_DAYS = 7;

export function ExitIntentCapture() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const firedRef = useRef(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed) {
      const daysAgo = (Date.now() - Number(dismissed)) / (1000 * 60 * 60 * 24);
      if (daysAgo < COOLDOWN_DAYS) return;
    }

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 20 && !firedRef.current) {
        firedRef.current = true;
        setVisible(true);
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      setStatus("done");
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
      setTimeout(dismiss, 2500);
    } catch {
      setStatus("error");
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60"
          onClick={dismiss}
        >
          <FocusTrap active={visible} focusTrapOptions={{ escapeDeactivates: false, allowOutsideClick: true }}>
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-label="Special offer"
            className="relative bg-white dark:bg-black border border-black/10 dark:border-white/10 max-w-sm w-full p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={dismiss}
              aria-label="Close"
              className="absolute top-4 right-4 text-black/30 dark:text-white/30 hover:text-black dark:hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            {status === "done" ? (
              <div className="text-center py-4">
                <p className="text-[10px] tracking-[0.2em] uppercase text-black/40 dark:text-white/40 mb-3">Thank you</p>
                <p className="font-display text-2xl text-black dark:text-white">You're on the list.</p>
                <p className="text-sm text-black/50 dark:text-white/50 mt-2">Expect exclusive offers and new arrivals.</p>
              </div>
            ) : (
              <>
                <p className="text-[10px] tracking-[0.2em] uppercase text-black/40 dark:text-white/40 mb-3">Before you go</p>
                <p className="font-display text-2xl text-black dark:text-white leading-tight mb-2">Get 15% off your first order</p>
                <p className="text-sm text-black/50 dark:text-white/50 mb-6">Join our list for exclusive access to new arrivals and private sales.</p>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    required
                    className="w-full h-11 px-4 border border-black/15 dark:border-white/15 bg-transparent text-sm text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full h-11 bg-black dark:bg-white text-white dark:text-black text-[11px] tracking-[0.14em] uppercase font-medium disabled:opacity-60 transition-opacity"
                  >
                    {status === "loading" ? "Subscribing…" : "Claim 15% Off"}
                  </button>
                  {status === "error" && <p className="text-xs text-red-500 text-center">Something went wrong. Please try again.</p>}
                </form>
                <button onClick={dismiss} className="block w-full text-center mt-4 text-[11px] text-black/30 dark:text-white/30 hover:text-black/60 dark:hover:text-white/60 transition-colors">
                  No thanks
                </button>
              </>
            )}
          </motion.div>
          </FocusTrap>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
