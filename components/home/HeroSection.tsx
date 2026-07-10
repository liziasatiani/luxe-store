"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { useTranslations } from "next-intl";

export function HeroSection() {
  const t = useTranslations("hero");
  return (
    <section className="relative min-h-[88vh] flex items-center bg-black overflow-hidden">
      <Image
        src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1920&q=80&auto=format"
        alt="Luxury fashion editorial"
        fill
        priority
        fetchPriority="high"
        className="object-cover object-center opacity-50"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

      <div className="relative z-10 w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-[10px] tracking-[0.28em] uppercase text-white/60 mb-8"
        >
          {t("tagline")}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-display font-light text-white leading-[0.95] tracking-tight mb-8"
          style={{ fontSize: "clamp(3rem, 9vw, 7rem)" }}
        >
          {t("headline1")}
          <br />
          <span className="font-serif italic font-normal text-brand-300">{t("headline2")}</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-sm md:text-base text-white/65 max-w-md mx-auto leading-relaxed mb-12 tracking-wide"
        >
          {t("description")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap gap-3 justify-center"
        >
          <Link href="/tech"
            className="inline-flex items-center h-12 px-8 bg-white text-black text-[11px] tracking-[0.18em] uppercase font-medium hover:bg-white/90 transition-colors">
            {t("shopTech")}
          </Link>
          <Link href="/beauty"
            className="inline-flex items-center h-12 px-8 border border-white/30 text-white text-[11px] tracking-[0.18em] uppercase font-medium hover:bg-white/5 transition-colors">
            {t("shopBeauty")}
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex justify-center gap-12 mt-20 border-t border-white/8 pt-10"
        >
          {[
            { value: "230+", label: t("statsProducts") },
            { value: "148",  label: t("statsBrands")   },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-display text-2xl md:text-3xl text-white font-light">{stat.value}</p>
              <p className="text-[10px] tracking-[0.12em] uppercase text-white/60 mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
