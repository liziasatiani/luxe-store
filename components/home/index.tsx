"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Zap, Star, Quote } from "lucide-react";
import { ProductCard, ProductCardSkeleton } from "@/components/product/ProductCard";
import { SectionHeader, Badge, Container } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { useCountdown } from "@/hooks";
import { formatPrice } from "@/lib/utils";
import type { ProductCard as ProductCardType } from "@/types";

// ─── Categories Section ───────────────────────────────────────
export function CategoriesSection({ categories }: { categories: Array<{ name: string; slug: string; image: string | null; _count?: { products: number } }> }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const ICONS: Record<string, string> = {
    Skincare: "✨", Makeup: "💄", "Hair Care": "💆", "Body Care": "🛁",
    Perfume: "🌸", "Beauty Tools": "🪄",
    Headphones: "🎧", Cameras: "📸", Tablets: "📱", Gaming: "🎮",
    "Power Banks": "🔋", Wearables: "⌚", "Smart Home": "🏠", Audio: "🎵",
    Accessories: "⚡", Keyboards: "⌨️", Mouse: "🖱️",
  };

  return (
    <section ref={ref} className="py-24 bg-surface-50/50 dark:bg-surface-900/30">
      <Container>
        <SectionHeader title="Shop by Category" subtitle="From skincare rituals to cutting-edge tech" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href={`/${cat.slug}`}
                className="group flex flex-col items-center gap-3 p-5 rounded-2xl bg-white dark:bg-surface-800 hover:bg-brand-50 dark:hover:bg-surface-700 border border-surface-100 dark:border-surface-700 hover:border-brand-200 dark:hover:border-brand-700 transition-all shadow-luxury hover:shadow-luxury-md text-center"
              >
                <span className="text-3xl">{ICONS[cat.name] ?? "🛍️"}</span>
                <div>
                  <p className="font-medium text-sm text-surface-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {cat.name}
                  </p>
                  {cat._count && (
                    <p className="text-xs text-surface-400 mt-0.5">{cat._count.products} items</p>
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

// ─── Featured Products Section ────────────────────────────────
export function FeaturedProductsSection() {
  const [products, setProducts] = useState<ProductCardType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products?featured=true&limit=8")
      .then(r => r.json())
      .then(d => setProducts(d.data?.products ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-24">
      <Container>
        <div className="flex items-end justify-between mb-10">
          <SectionHeader title="Featured" subtitle="Handpicked by our editors" align="left" className="mb-0" />
          <Link href="/featured" className="hidden sm:flex items-center gap-1.5 text-sm text-brand-500 hover:text-brand-600 font-medium">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
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
export function FlashSaleSection() {
  const [products, setProducts] = useState<ProductCardType[]>([]);
  const saleEnd = new Date(Date.now() + 47 * 3600000 + 23 * 60000 + 15000);
  const { h, m, s } = useCountdown(saleEnd);

  useEffect(() => {
    fetch("/api/products?onSale=true&limit=4")
      .then(r => r.json())
      .then(d => setProducts(d.data?.products ?? []));
  }, []);

  return (
    <section className="py-24 bg-surface-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(196,130,31,0.1),transparent_70%)]" />
      <Container className="relative">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-gold flex items-center justify-center">
              <Zap size={20} className="text-white" />
            </div>
            <div>
              <h2 className="font-display text-3xl text-white">Flash Sale</h2>
              <p className="text-sm text-surface-400">Limited time offers</p>
            </div>
          </div>
          {/* Countdown */}
          <div className="flex items-center gap-3">
            {[{ v: h, l: "HRS" }, { v: m, l: "MIN" }, { v: s, l: "SEC" }].map(({ v, l }) => (
              <div key={l} className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-xl bg-surface-800 flex items-center justify-center">
                  <span className="font-display text-2xl text-white tabular-nums">
                    {String(v).padStart(2, "0")}
                  </span>
                </div>
                <span className="text-2xs text-surface-500 mt-1 tracking-wider">{l}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {products.map((p, i) => (
            <div key={p.id} className="bg-surface-900 rounded-2xl overflow-hidden border border-surface-800">
              <ProductCard product={p} index={i} />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

// ─── Best Sellers Section ─────────────────────────────────────
export function BestSellersSection() {
  const [products, setProducts] = useState<ProductCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"all" | "beauty" | "tech">("all");

  const fetchByTab = (t: typeof tab) => {
    setLoading(true);
    const param = t === "all" ? "" : `&category=${t}`;
    fetch(`/api/products?bestSeller=true&limit=8${param}`)
      .then(r => r.json())
      .then(d => setProducts(d.data?.products ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchByTab("all"); }, []);

  return (
    <section className="py-24">
      <Container>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
          <SectionHeader title="Best Sellers" align="left" className="mb-0" />
          <div className="flex gap-1 p-1 rounded-xl bg-surface-100 dark:bg-surface-800">
            {(["all", "beauty", "tech"] as const).map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); fetchByTab(t); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                  tab === t
                    ? "bg-white dark:bg-surface-900 text-surface-900 dark:text-white shadow-luxury"
                    : "text-surface-500 hover:text-surface-700 dark:hover:text-surface-300"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
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
  return (
    <section className="py-20 border-y border-surface-100 dark:border-surface-800">
      <Container>
        <SectionHeader title="Our Brands" subtitle="Curated from the world's finest houses" />
        <div className="flex flex-wrap items-center justify-center gap-4">
          {brands.map((brand) => (
            <Link
              key={brand.slug}
              href={`/brands/${brand.slug}`}
              className="group px-8 py-4 rounded-2xl border border-surface-100 dark:border-surface-800 bg-white dark:bg-surface-900 hover:border-brand-200 dark:hover:border-brand-700 hover:shadow-luxury transition-all"
            >
              <span className="font-display text-lg text-surface-600 dark:text-surface-400 group-hover:text-surface-900 dark:group-hover:text-white transition-colors whitespace-nowrap">
                {brand.name}
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}

// ─── Testimonials Section ─────────────────────────────────────
const TESTIMONIALS = [
  { name: "Sarah M.",   role: "Beauty Enthusiast",   rating: 5, text: "The La Mer cream I ordered arrived beautifully packaged. Authentic product, fast shipping. This is now my go-to luxury beauty destination." },
  { name: "James K.",   role: "Tech Professional",    rating: 5, text: "Ordered the Sony WH-1000XM5 headphones — best price I found anywhere. Delivered in 2 days. Excellent customer service." },
  { name: "Priya L.",   role: "Skincare Aficionado",  rating: 5, text: "I've purchased from Luxe Store three times now. Charlotte Tilbury, Tatcha, Drunk Elephant — all authentic. The experience is unmatched." },
  { name: "Marcus T.",  role: "Gadget Reviewer",      rating: 5, text: "The Apple AirPods Pro came sealed, original, and at a great price. Packaging was impeccable. Highly recommend." },
];

export function TestimonialsSection() {
  return (
    <section className="py-24 bg-surface-50 dark:bg-surface-900/30">
      <Container>
        <SectionHeader title="What Our Clients Say" subtitle="Over 50,000 satisfied customers worldwide" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-surface-800 rounded-2xl p-6 shadow-luxury border border-surface-100 dark:border-surface-700"
            >
              <Quote size={24} className="text-brand-300 mb-4" />
              <p className="text-sm text-surface-600 dark:text-surface-300 leading-relaxed mb-5">
                "{t.text}"
              </p>
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} size={12} fill="#c4821f" stroke="#c4821f" />
                ))}
              </div>
              <div>
                <p className="font-semibold text-sm text-surface-900 dark:text-white">{t.name}</p>
                <p className="text-xs text-surface-400">{t.role}</p>
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
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async () => {
    if (!email) return;
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
    <section className="py-24 bg-surface-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(196,130,31,0.12),transparent_70%)]" />
      <Container className="relative text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Badge variant="gold" size="md" className="mb-6">Exclusive Offers</Badge>
          <h2 className="font-display text-4xl md:text-5xl text-white mb-4">
            Join the Inner Circle
          </h2>
          <p className="text-surface-400 text-lg max-w-md mx-auto mb-10">
            Be first to know about new arrivals, exclusive deals, and beauty secrets.
          </p>

          {status === "success" ? (
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-green-500/20 border border-green-500/30 text-green-400">
              ✓ You're in! Welcome to Luxe Store.
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                placeholder="Enter your email address"
                className="flex-1 h-12 px-5 rounded-xl bg-surface-800 border border-surface-700 text-white placeholder:text-surface-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
              />
              <Button
                variant="gold"
                onClick={handleSubmit}
                loading={status === "loading"}
                className="h-12 px-8 shrink-0"
              >
                Subscribe
              </Button>
            </div>
          )}
          {status === "error" && <p className="text-error text-sm mt-2">Something went wrong. Try again.</p>}
          <p className="text-xs text-surface-600 mt-4">No spam, ever. Unsubscribe anytime.</p>
        </motion.div>
      </Container>
    </section>
  );
}

// ─── New Arrivals ─────────────────────────────────────────────
export function NewArrivalsSection() {
  const [products, setProducts] = useState<ProductCardType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products?newArrival=true&limit=8&sort=newest")
      .then(r => r.json())
      .then(d => setProducts(d.data?.products ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-24 bg-surface-50 dark:bg-surface-900/20">
      <Container>
        <div className="flex items-end justify-between mb-10">
          <SectionHeader title="New Arrivals" subtitle="Fresh drops, just in" align="left" className="mb-0" />
          <Link href="/new" className="hidden sm:flex items-center gap-1.5 text-sm text-brand-500 hover:text-brand-600 font-medium">
            See all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)
          }
        </div>
      </Container>
    </section>
  );
}
