"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { useLocale } from "next-intl";

const COPY = {
  ka: {
    techTag: "Technology",
    techTitle: "ახალი\nჯენერა-\nცია",
    techSub: "ყველაფერი\nერთ ქუჩაზე",
    techDesc: "Sony, Samsung, Apple — ყველაფერი ერთ ადგილზე",
    techCta: "ტექნოლოგია →",
    beautyTag: "Beauty",
    beautyTitle: "სილამა-\nზის\nხელოვნება",
    beautySub: "ტექნოლოგია\nდა სილამაზე",
    beautyDesc: "Charlotte Tilbury, La Mer, Chanel — პრემიუმ კოსმეტიკა",
    beautyCta: "სილამაზე →",
  },
  en: {
    techTag: "Technology",
    techTitle: "Next\nGenera-\ntion",
    techSub: "Everything\non one street",
    techDesc: "Sony, Samsung, Apple — everything in one place",
    techCta: "Shop Tech →",
    beautyTag: "Beauty",
    beautyTitle: "The Art\nof\nBeauty",
    beautySub: "Technology\n& Beauty",
    beautyDesc: "Charlotte Tilbury, La Mer, Chanel — premium cosmetics",
    beautyCta: "Shop Beauty →",
  },
  fr: {
    techTag: "Technology",
    techTitle: "Prochaine\nGénéra-\ntion",
    techSub: "Tout sur\nune rue",
    techDesc: "Sony, Samsung, Apple — tout en un seul endroit",
    techCta: "Voir Tech →",
    beautyTag: "Beauty",
    beautyTitle: "L'Art\nde la\nBeauté",
    beautySub: "Technologie\net Beauté",
    beautyDesc: "Charlotte Tilbury, La Mer, Chanel — cosmétiques premium",
    beautyCta: "Voir Beauté →",
  },
  es: {
    techTag: "Technology",
    techTitle: "Próxima\nGenera-\nción",
    techSub: "Todo en\nuna calle",
    techDesc: "Sony, Samsung, Apple — todo en un solo lugar",
    techCta: "Ver Tech →",
    beautyTag: "Beauty",
    beautyTitle: "El Arte\nde la\nBelleza",
    beautySub: "Tecnología\ny Belleza",
    beautyDesc: "Charlotte Tilbury, La Mer, Chanel — cosméticos premium",
    beautyCta: "Ver Belleza →",
  },
} as const;

type Locale = keyof typeof COPY;

export function HeroSection() {
  const locale = useLocale() as Locale;
  const c = COPY[locale] ?? COPY.en;

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
        <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(0deg,rgba(7,9,15,.85) 0%,transparent 55%)" }} />
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: "linear-gradient(135deg,rgba(0,229,255,.18) 0%,transparent 70%)" }} />
        <div className="hidden md:block absolute top-0 right-0 bottom-0 w-px" style={{ background: "rgba(239,233,218,0.12)" }} />

        <div className="absolute inset-0 flex flex-col justify-end" style={{ padding: "72px 56px" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="flex items-center gap-2.5 mb-4" style={{ color: "#00E5FF" }}>
              <span className="inline-block w-[22px] h-px" style={{ background: "#00E5FF" }} />
              <span className="text-[10px] font-semibold tracking-[0.22em] uppercase">{c.techTag}</span>
            </div>
            <h2 className="font-display font-bold text-white leading-[0.95] tracking-[-0.02em] mb-3.5 whitespace-pre-line"
              style={{ fontSize: "clamp(40px,5.5vw,80px)" }}>
              {c.techTitle}
            </h2>
            <p className="font-georgian text-white/55 mb-7 whitespace-pre-line" style={{ fontSize: "clamp(26px,3.5vw,52px)", fontWeight: 400, lineHeight: 1.2 }}>
              {c.techSub}
            </p>
            <p className="text-[13px] text-white/60 max-w-[280px] leading-[1.65] mb-8">
              {c.techDesc}
            </p>
            <Link href="/tech"
              className="inline-flex items-center gap-2.5 text-[11px] font-semibold tracking-[0.12em] uppercase text-white border rounded-[1px] transition-all duration-250"
              style={{ padding: "13px 28px", background: "rgba(255,255,255,0.06)", backdropFilter: "blur(8px)", borderColor: "rgba(255,255,255,0.3)" }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#00E5FF"; el.style.borderColor = "#00E5FF"; el.style.color = "#000"; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(255,255,255,0.06)"; el.style.borderColor = "rgba(255,255,255,0.30)"; el.style.color = "#fff"; }}
            >
              {c.techCta}
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Center brand watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none hidden md:block">
        <span className="font-display text-[13px] font-normal tracking-[0.25em] uppercase" style={{ color: "rgba(255,255,255,0.5)" }}>
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
              <span className="text-[10px] font-semibold tracking-[0.22em] uppercase">{c.beautyTag}</span>
            </div>
            <h2 className="font-display font-bold text-white leading-[0.95] tracking-[-0.02em] mb-3.5 whitespace-pre-line"
              style={{ fontSize: "clamp(40px,5.5vw,80px)" }}>
              {c.beautyTitle}
            </h2>
            <p className="font-georgian text-white/55 mb-7 whitespace-pre-line" style={{ fontSize: "clamp(26px,3.5vw,52px)", fontWeight: 400, lineHeight: 1.2 }}>
              {c.beautySub}
            </p>
            <p className="text-[13px] text-white/60 max-w-[280px] leading-[1.65] mb-8">
              {c.beautyDesc}
            </p>
            <Link href="/beauty"
              className="inline-flex items-center gap-2.5 text-[11px] font-semibold tracking-[0.12em] uppercase text-white border rounded-[1px] transition-all duration-250"
              style={{ padding: "13px 28px", background: "rgba(255,255,255,0.06)", backdropFilter: "blur(8px)", borderColor: "rgba(255,255,255,0.3)" }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#FF3366"; el.style.borderColor = "#FF3366"; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(255,255,255,0.06)"; el.style.borderColor = "rgba(255,255,255,0.30)"; }}
            >
              {c.beautyCta}
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
