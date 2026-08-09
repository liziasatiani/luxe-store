"use client";
import Image from "next/image";
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
    <section className="hero">
      {/* Tech panel */}
      <Link href="/tech" className="hero-half hero-tech">
        <div className="hero-bg">
          <Image
            src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&q=85&auto=format"
            alt="Premium technology"
            fill
            priority
            fetchPriority="high"
            sizes="(max-width: 768px) 100vw, 50vw"
            style={{ objectFit: "cover" }}
          />
        </div>
        <div className="hero-shade" />
        <div className="hero-tint" />
        <div className="hero-content">
          <div className="hero-tag">{c.techTag}</div>
          <h2 className="hero-title">{c.techTitle}</h2>
          <p className="hero-title-ka">{c.techSub}</p>
          <p className="hero-sub">{c.techDesc}</p>
          <span className="hero-cta">{c.techCta}</span>
        </div>
      </Link>

      <div className="hero-divider" />

      {/* Beauty panel */}
      <Link href="/beauty" className="hero-half hero-beauty">
        <div className="hero-bg">
          <Image
            src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=900&q=85&auto=format"
            alt="Luxury beauty"
            fill
            priority
            fetchPriority="high"
            sizes="(max-width: 768px) 100vw, 50vw"
            style={{ objectFit: "cover" }}
          />
        </div>
        <div className="hero-shade" />
        <div className="hero-tint" />
        <div className="hero-content delay">
          <div className="hero-tag">{c.beautyTag}</div>
          <h2 className="hero-title">{c.beautyTitle}</h2>
          <p className="hero-title-ka">{c.beautySub}</p>
          <p className="hero-sub">{c.beautyDesc}</p>
          <span className="hero-cta">{c.beautyCta}</span>
        </div>
      </Link>

      <div className="hero-center">
        <div className="hero-brand">Everything Street</div>
      </div>
    </section>
  );
}
