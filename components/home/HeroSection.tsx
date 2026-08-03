"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { useTranslations } from "next-intl";

export function HeroSection() {
  const t = useTranslations("hero");

  return (
    <section className="relative w-full min-h-[100svh] overflow-hidden flex flex-col md:flex-row">
      {/* Tech — left panel */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative flex-1 min-h-[50svh] md:min-h-[100svh] group overflow-hidden"
      >
        <Image
          src="https://images.unsplash.com/photo-1511385348-a52b4a160dc2?w=1200&q=80&auto=format"
          alt="Premium technology"
          fill
          priority
          fetchPriority="high"
          className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        {/* Dark overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07090F]/90 via-[#07090F]/40 to-[#07090F]/20" />
        {/* Divider line center-right */}
        <div className="hidden md:block absolute top-0 right-0 bottom-0 w-px bg-white/[0.08]" />

        <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12 lg:p-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-[9px] tracking-[0.3em] uppercase text-white/40 mb-4"
          >
            {t("techLabel", { fallback: "Premium Technology" })}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="font-display font-light text-white leading-[0.95] tracking-tight mb-6"
            style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
          >
            {t("techHeadline1", { fallback: "Precision" })}
            <br />
            <span className="italic font-normal text-brand-400">
              {t("techHeadline2", { fallback: "by design" })}
            </span>
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55 }}
          >
            <Link
              href="/tech"
              className="inline-flex items-center gap-3 text-[10px] tracking-[0.22em] uppercase font-medium text-white/80 hover:text-white group/link transition-colors"
            >
              {t("exploreTech", { fallback: "Explore Tech" })}
              <span className="w-8 h-px bg-white/40 group-hover/link:w-12 group-hover/link:bg-white transition-all duration-300" />
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Beauty — right panel */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative flex-1 min-h-[50svh] md:min-h-[100svh] group overflow-hidden"
      >
        <Image
          src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&q=80&auto=format"
          alt="Luxury beauty"
          fill
          priority
          fetchPriority="high"
          className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07090F]/90 via-[#07090F]/40 to-[#07090F]/20" />

        <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12 lg:p-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="text-[9px] tracking-[0.3em] uppercase text-white/40 mb-4"
          >
            {t("beautyLabel", { fallback: "Luxury Beauty" })}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55 }}
            className="font-display font-light text-white leading-[0.95] tracking-tight mb-6"
            style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
          >
            {t("beautyHeadline1", { fallback: "Radiance" })}
            <br />
            <span className="italic font-normal text-brand-400">
              {t("beautyHeadline2", { fallback: "refined" })}
            </span>
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <Link
              href="/beauty"
              className="inline-flex items-center gap-3 text-[10px] tracking-[0.22em] uppercase font-medium text-white/80 hover:text-white group/link transition-colors"
            >
              {t("exploreBeauty", { fallback: "Explore Beauty" })}
              <span className="w-8 h-px bg-white/40 group-hover/link:w-12 group-hover/link:bg-white transition-all duration-300" />
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Center brand mark */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-px h-12 bg-white/20" />
          <span className="text-[8px] tracking-[0.4em] uppercase text-white/30 bg-[#07090F]/60 px-3 py-1">
            {t("tagline", { fallback: "Est. 2024" })}
          </span>
          <div className="w-px h-12 bg-white/20" />
        </div>
      </motion.div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.9 }}
        className="absolute bottom-0 left-0 right-0 z-10 hidden md:grid grid-cols-4 border-t border-white/[0.08]"
      >
        {[
          { value: "230+", label: t("statsProducts", { fallback: "Products" }), cls: "text-brand-400" },
          { value: "148",  label: t("statsBrands",   { fallback: "Brands"   }), cls: "text-brand-400" },
          { value: "4.9★", label: t("statsRating",   { fallback: "Rating"   }), cls: "text-surface-50" },
          { value: "2–3d", label: t("statsDelivery", { fallback: "Delivery" }), cls: "text-surface-50" },
        ].map((stat) => (
          <div key={stat.label} className="flex flex-col items-center justify-center py-5 border-r last:border-r-0 border-white/[0.08]">
            <p className={`font-display text-2xl font-light ${stat.cls}`}>{stat.value}</p>
            <p className="text-[9px] tracking-[0.2em] uppercase text-white/40 mt-1">{stat.label}</p>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
