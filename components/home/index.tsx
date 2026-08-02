"use client";
import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import { ProductCard, ProductCardSkeleton } from "@/components/product/ProductCard";
import { Container } from "@/components/ui";
import { useCountdown } from "@/hooks";
import type { ProductCard as ProductCardType } from "@/types";

// ─── Categories Section ───────────────────────────────────────
export function CategoriesSection({ categories }: { categories: Array<{ name: string; slug: string; image: string | null; _count?: { products: number } }> }) {
  const t = useTranslations("home.categories");
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-20 border-b border-surface-200 dark:border-white/8">
      <Container>
        <div className="mb-12">
          <div className="flex items-end justify-between pb-5 border-b border-surface-200 dark:border-white/10">
            <h2 className="font-display text-5xl md:text-6xl text-surface-900 dark:text-white font-normal leading-none uppercase tracking-[0.02em]">{t("title")}</h2>
            <p className="text-[10px] tracking-[0.22em] uppercase text-surface-400 dark:text-white/40 mb-1">{t("subtitle")}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 divide-x divide-surface-200 dark:divide-white/8 border border-surface-200 dark:border-white/8">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: i * 0.04 }}
            >
              <Link
                href={`/${cat.slug}`}
                className="group flex flex-col items-center justify-center gap-2 py-8 px-4 hover:bg-brand-50 dark:hover:bg-white/[0.03] transition-colors text-center"
              >
                <p className="text-[11px] tracking-[0.14em] uppercase font-medium text-surface-700 dark:text-white group-hover:text-brand-600 dark:group-hover:opacity-60 transition-colors">
                  {cat.name}
                </p>
                {cat._count && (
                  <p className="text-[10px] text-surface-400 dark:text-white/30">{cat._count.products}</p>
                )}
              </Link>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}

// ─── Section heading helper ──────────────────────────────────
function EditorialHeader({ title, subtitle, viewAllHref, viewAllLabel }: {
  title: string; subtitle?: string; viewAllHref?: string; viewAllLabel?: string;
}) {
  return (
    <div className="mb-12">
      <div className="flex items-end justify-between pb-5 border-b border-surface-200 dark:border-white/10">
        <div>
          <p className="text-[10px] tracking-[0.22em] uppercase text-brand-500 mb-3">{subtitle}</p>
          <h2 className="font-display text-5xl md:text-6xl text-surface-900 dark:text-white font-normal leading-none uppercase tracking-[0.02em]">{title}</h2>
        </div>
        {viewAllHref && (
          <Link href={viewAllHref} className="hidden sm:flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-surface-400 dark:text-white/50 hover:text-brand-500 transition-colors mb-1">
            {viewAllLabel ?? "View All"} <ArrowRight size={10} />
          </Link>
        )}
      </div>
    </div>
  );
}

// ─── Featured Products Section ────────────────────────────────
export function FeaturedProductsSection() {
  const t = useTranslations("home.featured");
  const [products, setProducts] = useState<ProductCardType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products?featured=true&limit=8")
      .then(r => r.json())
      .then(d => setProducts(d.data?.products ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-20 border-b border-surface-200 dark:border-white/8">
      <Container>
        <EditorialHeader title={t("title")} subtitle={t("subtitle")} viewAllHref="/featured" viewAllLabel={t("viewAll")} />
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y divide-surface-200 dark:divide-white/8 border border-surface-200 dark:border-white/8">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)
          }
        </div>
      </Container>
    </section>
  );
}

// ─── Flash Sale Section ───────────────────────────────────────
const FLASH_SALE_END_KEY = "luxe-flash-sale-end";

function getOrInitSaleEnd(): Date {
  if (typeof window === "undefined") return new Date(Date.now() + 47 * 3600000);
  const stored = localStorage.getItem(FLASH_SALE_END_KEY);
  if (stored) {
    const ts = parseInt(stored, 10);
    if (!isNaN(ts) && ts > Date.now()) return new Date(ts);
  }
  const end = Date.now() + 47 * 3600000 + 23 * 60000 + 15000;
  localStorage.setItem(FLASH_SALE_END_KEY, String(end));
  return new Date(end);
}

export function FlashSaleSection() {
  const t = useTranslations("home.flashSale");
  const [products, setProducts] = useState<ProductCardType[]>([]);
  const saleEndRef = useRef<Date | null>(null);
  if (!saleEndRef.current) saleEndRef.current = getOrInitSaleEnd();
  const { h, m, s } = useCountdown(saleEndRef.current);

  useEffect(() => {
    fetch("/api/products?onSale=true&limit=4")
      .then(r => r.json())
      .then(d => setProducts(d.data?.products ?? []));
  }, []);

  return (
    <section className="py-20 bg-black">
      <Container>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
          <div>
            <h2 className="font-display text-2xl md:text-3xl text-white font-normal uppercase tracking-[0.04em]">{t("title")}</h2>
            <p className="text-[11px] tracking-[0.08em] uppercase text-white/40 mt-1">{t("subtitle")}</p>
          </div>
          <div className="flex items-center gap-4">
            {[{ v: h, l: t("hrs") }, { v: m, l: t("min") }, { v: s, l: t("sec") }].map(({ v, l }, idx) => (
              <div key={l} className="flex items-center gap-4">
                <div className="text-center">
                  <div className="font-display text-3xl text-white tabular-nums leading-none">
                    {String(v).padStart(2, "0")}
                  </div>
                  <div className="text-[9px] tracking-[0.16em] uppercase text-white/30 mt-1">{l}</div>
                </div>
                {idx < 2 && <span className="font-display text-2xl text-white/20 -mt-2">:</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y divide-white/8 border border-white/8">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} darkBg />
          ))}
        </div>
      </Container>
    </section>
  );
}

// ─── Best Sellers Section ─────────────────────────────────────
export function BestSellersSection({ initialProducts = [] }: { initialProducts?: ProductCardType[] }) {
  const t = useTranslations("pages.bestSellers");
  const [products, setProducts] = useState<ProductCardType[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"all" | "beauty" | "tech">("all");

  useEffect(() => {
    if (tab === "all" && initialProducts.length > 0) {
      setProducts(initialProducts);
      return;
    }
    const ctrl = new AbortController();
    setLoading(true);
    const param = tab === "all" ? "" : `&category=${tab}`;
    fetch(`/api/products?bestSeller=true&limit=8${param}`, { signal: ctrl.signal })
      .then(r => r.json())
      .then(d => {
        setProducts(d.data?.products ?? []);
        setLoading(false);
      })
      .catch(err => {
        if (err?.name !== "AbortError") setLoading(false);
      });
    return () => ctrl.abort();
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section className="py-20 border-b border-black/8 dark:border-white/8">
      <Container>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
          <h2 className="font-display text-2xl md:text-3xl text-black dark:text-white font-normal uppercase tracking-[0.04em]">{t("title")}</h2>
          <div className="flex items-center gap-0 border border-black/12 dark:border-white/12">
            {(["all", "beauty", "tech"] as const).map(key => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`h-9 px-5 text-[10px] tracking-[0.1em] uppercase font-medium transition-colors capitalize ${
                  tab === key
                    ? "bg-black dark:bg-white text-white dark:text-black"
                    : "text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white"
                }`}
              >
                {key}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y divide-black/8 dark:divide-white/8 border border-black/8 dark:border-white/8">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)
          }
        </div>
      </Container>
    </section>
  );
}

// ─── Brands Section ───────────────────────────────────────────
export function BrandsSection({ brands }: { brands: Array<{ name: string; slug: string; logo: string | null }> }) {
  const t = useTranslations("home.brands");
  return (
    <section className="py-16 border-b border-black/8 dark:border-white/8">
      <Container>
        <p className="text-[10px] tracking-[0.22em] uppercase text-black/30 dark:text-white/30 text-center mb-8">{t("title")}</p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {brands.map((brand) => (
            <Link
              key={brand.slug}
              href={`/brands/${brand.slug}`}
              className="font-display text-lg text-black/30 dark:text-white/30 hover:text-black dark:hover:text-white transition-colors whitespace-nowrap"
            >
              {brand.name}
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}

// ─── Testimonials Section ─────────────────────────────────────
const TESTIMONIALS = [
  { name: "Sofia M.", location: "New York, NY", rating: 5, text: "The La Mer moisturizer arrived in two days, sealed and exactly as described. It's my third order and the quality is always flawless." },
  { name: "James R.", location: "London, UK", rating: 5, text: "Got the Sony WH-1000XM5 at a better price than anywhere else. Genuine product, fast shipping, and customer service that actually replied." },
  { name: "Priya K.", location: "Toronto, CA", rating: 5, text: "Charlotte Tilbury Pillow Talk — found the full set here after weeks of searching. Arrived gift-ready. I've already recommended this to everyone." },
  { name: "Elena V.", location: "Paris, FR", rating: 5, text: "Beautifully curated selection. I found niche French skincare I couldn't source locally. The checkout was smooth and my order came with a handwritten note." },
];

export function TestimonialsSection() {
  const t = useTranslations("home.testimonials");
  return (
    <section className="py-20 border-b border-black/8 dark:border-white/8">
      <Container>
        <div className="text-center mb-12">
          <h2 className="font-display text-2xl md:text-3xl text-black dark:text-white font-normal uppercase tracking-[0.04em]">{t("title")}</h2>
          <p className="text-[11px] tracking-[0.08em] uppercase text-black/40 dark:text-white/40 mt-2">{t("subtitle")}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-x divide-y divide-black/8 dark:divide-white/8 border border-black/8 dark:border-white/8">
          {TESTIMONIALS.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="p-8"
            >
              <div className="flex items-center gap-0.5 mb-5">
                {Array.from({ length: item.rating }).map((_, j) => (
                  <Star key={j} size={11} fill="currentColor" stroke="none" className="text-black dark:text-white" />
                ))}
              </div>
              <p className="text-sm text-black/60 dark:text-white/60 leading-relaxed mb-6">
                &ldquo;{item.text}&rdquo;
              </p>
              <div>
                <p className="text-[11px] tracking-[0.1em] uppercase font-medium text-black dark:text-white">{item.name}</p>
                <p className="text-[10px] tracking-[0.06em] uppercase text-black/30 dark:text-white/30 mt-0.5">{item.location}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}

// ─── Newsletter Section ───────────────────────────────────────
export function NewsletterSection() {
  const t = useTranslations("home.newsletter");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [emailError, setEmailError] = useState("");

  const handleSubmit = async () => {
    setEmailError("");
    if (!email) { setEmailError("Please enter your email address"); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) { setEmailError("Please enter a valid email address"); return; }
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStatus(res.ok ? "success" : "error");
      if (res.ok) setEmail("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="py-24 bg-black">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-lg mx-auto"
        >
          <p className="text-[10px] tracking-[0.28em] uppercase text-white/30 mb-6">{t("badge")}</p>
          <h2 className="font-display text-3xl md:text-4xl text-white font-normal uppercase tracking-[0.04em] mb-4">{t("title")}</h2>
          <p className="text-sm text-white/40 mb-10 leading-relaxed">{t("subtitle")}</p>

          {status === "success" ? (
            <p className="text-[11px] tracking-[0.1em] uppercase text-white/50">{t("success")}</p>
          ) : (
            <div className="flex flex-col sm:flex-row gap-0 border border-white/20">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                placeholder={t("placeholder")}
                aria-invalid={!!emailError}
                className="flex-1 h-12 px-5 bg-transparent border-0 text-white placeholder:text-white/25 text-sm focus:outline-none"
              />
              <button
                onClick={handleSubmit}
                disabled={status === "loading"}
                className="h-12 px-8 bg-white text-black text-[11px] tracking-[0.14em] uppercase font-medium hover:bg-white/90 transition-colors shrink-0 disabled:opacity-50"
              >
                {status === "loading" ? "…" : t("subscribe")}
              </button>
            </div>
          )}
          {status === "error" && <p className="text-xs text-red-400 mt-2">{t("error")}</p>}
          {emailError && <p className="text-xs text-red-400 mt-2">{emailError}</p>}
          <p className="text-[10px] tracking-[0.06em] uppercase text-white/20 mt-4">{t("noSpam")}</p>
        </motion.div>
      </Container>
    </section>
  );
}

// ─── New Arrivals ─────────────────────────────────────────────
export function NewArrivalsSection() {
  const t = useTranslations("pages.newArrivals");
  const tCommon = useTranslations("common");
  const [products, setProducts] = useState<ProductCardType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products?newArrival=true&limit=8&sort=newest")
      .then(r => r.json())
      .then(d => setProducts(d.data?.products ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-20 border-b border-black/8 dark:border-white/8">
      <Container>
        <EditorialHeader title={t("title")} subtitle={t("subtitle")} viewAllHref="/new" viewAllLabel={tCommon("seeAll")} />
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y divide-black/8 dark:divide-white/8 border border-black/8 dark:border-white/8">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)
          }
        </div>
      </Container>
    </section>
  );
}
