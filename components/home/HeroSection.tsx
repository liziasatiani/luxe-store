"use client";
"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { useTranslations } from "next-intl";

export function HeroSection() {
  const t = useTranslations("hero");

  return (
    <section className="relative w-full min-h-[100svh] flex flex-col md:flex-row" style={{ background: "#07090F" }}>

      {/* Tech — left panel */}
      <div className="relative flex-1 min-h-[55svh] md:min-h-[100svh] group overflow-hidden cursor-pointer">
        <Image
          src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&q=85&auto=format"
          alt="Premium technology"
          fill
          priority
          fetchPriority="high"
          className="object-cover object-center brightness-[0.28] transition-[filter,transform] duration-700 group-hover:brightness-[0.38] group-hover:scale-[1.04]"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        {/* Bottom shade */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(0deg,rgba(7,9,15,.85) 0%,transparent 55%)" }} />
        {/* Tech tint on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: "linear-gradient(135deg,rgba(0,229,255,.18) 0%,transparent 70%)" }} />
        {/* Center divider */}
        <div className="hidden md:block absolute top-0 right-0 bottom-0 w-px" style={{ background: "rgba(239,233,218,0.12)" }} />

        <div className="absolute inset-0 flex flex-col justify-end" style={{ padding: "72px 56px" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="flex items-center gap-2.5 mb-4" style={{ color: "#00E5FF" }}>
              <span className="inline-block w-[22px] h-px" style={{ background: "#00E5FF" }} />
              <span className="text-[10px] font-semibold tracking-[0.22em] uppercase">Technology</span>
            </div>
            <h2 className="font-display font-bold text-white leading-[0.95] tracking-[-0.02em] mb-3.5"
              style={{ fontSize: "clamp(40px,5.5vw,80px)" }}>
              {t("techHeadline1", { fallback: "Next" })}<br />
              <span className="italic">{t("techHeadline2", { fallback: "Generation" })}</span>
            </h2>
            <p className="font-georgian text-white/55 mb-7" style={{ fontSize: "clamp(20px,2.8vw,36px)", fontWeight: 400, lineHeight: 1.2 }}>
              {t("techSubKa", { fallback: "ყველაფერი ერთ ქუჩაზე" })}
            </p>
            <p className="text-[13px] text-white/60 max-w-[280px] leading-[1.65] mb-8">
              Sony, Samsung, Apple — {t("techSub", { fallback: "everything in one place" })}
            </p>
            <Link href="/tech"
              className="inline-flex items-center gap-2.5 text-[11px] font-semibold tracking-[0.12em] uppercase text-white border rounded-[1px] transition-all duration-250"
              style={{ padding: "13px 28px", background: "rgba(255,255,255,0.06)", backdropFilter: "blur(8px)", borderColor: "rgba(255,255,255,0.3)" }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#00E5FF"; el.style.borderColor = "#00E5FF"; el.style.color = "#000"; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(255,255,255,0.06)"; el.style.borderColor = "rgba(255,255,255,0.30)"; el.style.color = "#fff"; }}
            >
              Shop Tech →
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Center brand watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none text-center">
        <span className="font-display text-[13px] font-normal tracking-[0.25em] uppercase" style={{ color: "rgba(255,255,255,0.5)", letterSpacing: "0.25em" }}>
          Everything Street
        </span>
      </div>

      {/* Beauty — right panel */}
      <div className="relative flex-1 min-h-[55svh] md:min-h-[100svh] group overflow-hidden cursor-pointer">
        <Image
          src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=900&q=85&auto=format"
          alt="Luxury beauty"
          fill
          priority
          fetchPriority="high"
          className="object-cover object-center brightness-[0.28] transition-[filter,transform] duration-700 group-hover:brightness-[0.38] group-hover:scale-[1.04]"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(0deg,rgba(7,9,15,.85) 0%,transparent 55%)" }} />
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: "linear-gradient(135deg,rgba(255,51,102,.18) 0%,transparent 70%)" }} />

        <div className="absolute inset-0 flex flex-col justify-end" style={{ padding: "72px 56px" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="flex items-center gap-2.5 mb-4" style={{ color: "#FF3366" }}>
              <span className="inline-block w-[22px] h-px" style={{ background: "#FF3366" }} />
              <span className="text-[10px] font-semibold tracking-[0.22em] uppercase">Beauty</span>
            </div>
            <h2 className="font-display font-bold text-white leading-[0.95] tracking-[-0.02em] mb-3.5"
              style={{ fontSize: "clamp(40px,5.5vw,80px)" }}>
              {t("beautyHeadline1", { fallback: "The Art" })}<br />
              <span className="italic">{t("beautyHeadline2", { fallback: "of Beauty" })}</span>
            </h2>
            <p className="font-georgian text-white/55 mb-7" style={{ fontSize: "clamp(20px,2.8vw,36px)", fontWeight: 400, lineHeight: 1.2 }}>
              {t("beautySubKa", { fallback: "ტექნოლოგია და სილამაზე" })}
            </p>
            <p className="text-[13px] text-white/60 max-w-[280px] leading-[1.65] mb-8">
              Charlotte Tilbury, La Mer, Chanel — {t("beautySub", { fallback: "premium cosmetics" })}
            </p>
            <Link href="/beauty"
              className="inline-flex items-center gap-2.5 text-[11px] font-semibold tracking-[0.12em] uppercase text-white border rounded-[1px] transition-all duration-250"
              style={{ padding: "13px 28px", background: "rgba(255,255,255,0.06)", backdropFilter: "blur(8px)", borderColor: "rgba(255,255,255,0.3)" }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#FF3366"; el.style.borderColor = "#FF3366"; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(255,255,255,0.06)"; el.style.borderColor = "rgba(255,255,255,0.30)"; }}
            >
              Shop Beauty →
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
