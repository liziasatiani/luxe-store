"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface Props {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  /** "rise" = fade+translateY (default), "clip" = clip-path curtain, "scale" = scale+fade */
  variant?: "rise" | "clip" | "scale" | "slide-left" | "slide-right";
  once?: boolean;
}

const VARIANTS = {
  rise: {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
  },
  clip: {
    hidden: { clipPath: "inset(0 0 100% 0)", opacity: 0 },
    visible: { clipPath: "inset(0 0 0% 0)", opacity: 1, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.94 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  },
  "slide-left": {
    hidden: { opacity: 0, x: -48 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
  },
  "slide-right": {
    hidden: { opacity: 0, x: 48 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
  },
};

export function ScrollReveal({ children, className, delay = 0, variant = "rise", once = true }: Props) {
  const ref = useRef(null);
  const inView = useInView(ref, { once, margin: "-60px" });
  const v = VARIANTS[variant];

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={v}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

/** Stagger container — children animate in one by one */
export function StaggerReveal({ children, className, stagger = 0.08, delay = 0 }: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  );
}

export const staggerChild = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};
