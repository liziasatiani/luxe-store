"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function SplashScreen() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("es-splash-seen")) return;
    sessionStorage.setItem("es-splash-seen", "1");
    setVisible(true);

    const t = setTimeout(() => setVisible(false), 2200);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
        >
          <motion.span
            initial="hidden"
            animate="visible"
            className="font-display text-white uppercase tracking-[0.22em] select-none"
            style={{ fontSize: "clamp(1.1rem, 3.5vw, 2.2rem)", letterSpacing: "0.22em" }}
          >
            {"Everything Street".split("").map((char, i) => (
              <motion.span
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.4, delay: i * 0.045, ease: "easeOut" }}
              >
                {char}
              </motion.span>
            ))}
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
