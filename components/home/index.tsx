"use client";
import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import { ProductCard, ProductCardSkeleton } from "@/components/product/ProductCard";
import { Container } from "@/components/ui";
import { useCountdown } from "@/hooks";
import type { ProductCard as ProductCardType } from "@/types";

const CATEGORY_NAMES: Record<string, string> = {
  skincare: "home.categories.skincare",
  makeup: "home.categories.makeup",
  "hair-care": "home.categories.hairCare",
  "body-care": "home.categories.bodyCare",
  perfume: "home.categories.perfume",
  "beauty-tools": "home.categories.beautyTools",
  headphones: "home.categories.headphones",
  cameras: "home.categories.cameras",
  tablets: "home.categories.tablets",
  gaming: "home.categories.gaming",
  wearables: "home.categories.wearables",
  "smart-home": "home.categories.smartHome",
  audio: "home.categories.audio",
  accessories: "home.categories.accessories",
};

export function CategoriesSection({ categories }: { categories: Array<{ name: string; slug: string; image: string | null; parent?: { slug: string } | null; _count?: { products: number } }> }) {
  const t = useTranslations("home.categories");
  const tCommon = useTranslations("common");
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-20 border-b border-surface-200 dark:border-white/8">
      <Container>
        <div className="mb-12">
          <div className="flex items-end justify-between pb-5 border-b border-surface-200 dark:border-white/10">
            <h2 className="font-display text-5xl md:text-6xl text-surface-900 dark:text-white font-normal leading-none uppercase tracking-[0.02em]">{t("title")}</h2>
            <p className="hidden sm:block text-[10px] tracking-[0.22em] uppercase text-surface-400 dark:text-white/40 mb-1">{t("subtitle")}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.06 }}
            >
              <Link
                href={cat.parent ? `/${cat.parent.slug}/${cat.slug}` : `/${cat.slug}`}
                className="group relative block aspect-[3/4] overflow-hidden bg-surface-100 dark:bg-surface-800"
              >
                {cat.image ? (
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-surface-200 to-surface-300 dark:from-surface-700 dark:to-surface-900" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                {cat.parent && (
                  <span className="absolute top-3 left-3 text-[9px] tracking-[0.18em] uppercase font-medium text-white bg-black/40 backdrop-blur-sm px-2 py-1">
                    {cat.parent.slug.charAt(0).toUpperCase() + cat.parent.slug.slice(1)}
                  </span>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="font-display text-xl text-white leading-tight">
                    {CATEGORY_NAMES[cat.slug] ? t(CATEGORY_NAMES[cat.slug].replace("home.categories.", "") as Parameters<typeof t>[0]) : cat.name}
                  </p>
                  {cat._count && (
                    <p className="text-[10px] tracking-[0.1em] text-white/60 mt-1">{cat._count.products} {tCommon("products")}</p>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}

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

export function FeaturedProductsSection() {
  const t = useTranslations("home.featured");
  const [products, setProducts] = useState<ProductCardType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ctrl = new AbortController();
    fetch("/api/products?featured=true&limit=8", { signal: ctrl.signal })
      .then(r => r.json())
      .then(d => setProducts(d.data?.products ?? []))
      .catch(err => { if (err?.name !== "AbortError") setLoading(false); })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
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

const FLASH_SALE_END_KEY = "luxe-flash-sale-end";
const FLASH_SALE_DURATION_MS = 47 * 60 * 60 * 1000 + 23 * 60 * 1000 + 15 * 1000;

function getOrInitSaleEnd(): Date {
  if (typeof window === "undefined") return new Date(Date.now() + FLASH_SALE_DURATION_MS);
  const stored = localStorage.getItem(FLASH_SALE_END_KEY);
  if (stored) {
    const ts = parseInt(stored, 10);
    if (!isNaN(ts) && ts > Date.now()) return new Date(ts);
  }
  const end = Date.now() + FLASH_SALE_DURATION_MS;
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
    const ctrl = new AbortController();
    fetch("/api/products?onSale=true&limit=4", { signal: ctrl.signal })
      .then(r => r.json())
      .then(d => setProducts(d.data?.products ?? []))
      .catch(err => { if (err?.name !== "AbortError") console.warn("Flash sale fetch failed"); });
    return () => ctrl.abort();
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

  if (!loading && products.length === 0) return null;

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

export function NewsletterSection() {
  const t = useTranslations("home.newsletter");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [emailError, setEmailError] = useState("");

  const subscribeNewsletter = async () => {
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
                onKeyDown={e => e.key === "Enter" && subscribeNewsletter()}
                placeholder={t("placeholder")}
                aria-invalid={!!emailError}
                className="flex-1 h-12 px-5 bg-transparent border-0 text-white placeholder:text-white/25 text-sm focus:outline-none"
              />
              <button
                onClick={subscribeNewsletter}
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

export function TheEditSection() {
  const [products, setProducts] = useState<ProductCardType[]>([]);

  useEffect(() => {
    const ctrl = new AbortController();
    fetch("/api/products?featured=true&limit=3&sort=best-selling", { signal: ctrl.signal })
      .then(r => r.json())
      .then(d => setProducts(d.data?.products ?? []))
      .catch(err => { if (err?.name !== "AbortError") console.warn("The Edit fetch failed"); });
    return () => ctrl.abort();
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="py-20 bg-black border-b border-white/8">
      <Container>
        <div className="flex items-end justify-between pb-5 border-b border-white/10 mb-12">
          <div>
            <p className="text-[10px] tracking-[0.28em] uppercase text-white/30 mb-3">Editor&apos;s selection</p>
            <h2 className="font-display text-5xl md:text-6xl text-white font-normal leading-none uppercase tracking-[0.02em]">The Edit</h2>
          </div>
          <Link href="/featured" className="hidden sm:flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-white/40 hover:text-white transition-colors mb-1">
            View all <ArrowRight size={10} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 divide-x divide-y divide-white/8 border border-white/8">
          {products.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <ProductCard product={p} index={i} darkBg />
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}

export function HomepageRecentlyViewed() {
  const [items, setItems] = useState<ProductCardType[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem("recently-viewed-store");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const stored: ProductCardType[] = parsed?.state?.items ?? [];
      setItems(stored.slice(0, 4));
    } catch { /* ignore */ }
  }, []);

  if (!mounted || items.length < 2) return null;

  return (
    <section className="py-20 border-b border-black/8 dark:border-white/8">
      <Container>
        <div className="mb-12">
          <div className="flex items-end justify-between pb-5 border-b border-black/10 dark:border-white/10">
            <h2 className="font-display text-5xl md:text-6xl text-black dark:text-white font-normal leading-none uppercase tracking-[0.02em]">Recently Viewed</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y divide-black/8 dark:divide-white/8 border border-black/8 dark:border-white/8">
          {items.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </Container>
    </section>
  );
}

export function NewArrivalsSection() {
  const t = useTranslations("pages.newArrivals");
  const tCommon = useTranslations("common");
  const [products, setProducts] = useState<ProductCardType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ctrl = new AbortController();
    fetch("/api/products?newArrival=true&limit=8&sort=newest", { signal: ctrl.signal })
      .then(r => r.json())
      .then(d => setProducts(d.data?.products ?? []))
      .catch(err => { if (err?.name !== "AbortError") setLoading(false); })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
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
