"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { useTranslations } from "next-intl";

export function HeroSection() {
  const t = useTranslations("home.hero");
  return (
    <section className="relative min-h-[88vh] flex items-center bg-black overflow-hidden">
      {/* Editorial hero image */}
      <Image
        src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1920&q=80&auto=format"
        alt="Luxury fashion editorial"
        fill
        priority
        fetchPriority="high"
        className="object-cover object-center opacity-50"
        sizes="100vw"
      />
      {/* Dark overlay for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

      <div className="relative z-10 w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-[10px] tracking-[0.28em] uppercase text-white/60 mb-8"
        >
          {t("badge")}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-display font-light text-white leading-[0.95] tracking-tight mb-8"
          style={{ fontSize: "clamp(3rem, 9vw, 7rem)" }}
        >
          {t("title")}
          <br />
          <span className="font-serif italic font-normal text-brand-300">{t("titleGold")}</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-sm md:text-base text-white/65 max-w-md mx-auto leading-relaxed mb-12 tracking-wide"
        >
          {t("subtitle")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap gap-3 justify-center"
        >
          <Link href="/beauty"
            className="inline-flex items-center h-12 px-8 bg-white text-black text-[11px] tracking-[0.18em] uppercase font-medium hover:bg-white/90 transition-colors">
            {t("shopBeauty")}
          </Link>
          <Link href="/tech"
            className="inline-flex items-center h-12 px-8 border border-white/30 text-white text-[11px] tracking-[0.18em] uppercase font-medium hover:bg-white/5 transition-colors">
            {t("exploreTech")}
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex justify-center gap-12 mt-20 border-t border-white/8 pt-10"
        >
          {[
            { value: "186+", label: t("stats.products") },
            { value: "31",   label: t("stats.brands")   },
            { value: "50K+", label: t("stats.customers") },
            { value: "4.9★", label: t("stats.rating")   },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-display text-2xl md:text-3xl text-white font-light">{stat.value}</p>
              <p className="text-[10px] tracking-[0.12em] uppercase text-white/60 mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 1.8, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[9px] tracking-[0.2em] uppercase text-white/55">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-white/25 to-transparent" />
      </motion.div>
    </section>
  );
}
