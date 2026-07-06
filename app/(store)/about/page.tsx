import { Container } from "@/components/ui";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "About Us", description: "Learn about Luxe Store — your destination for luxury beauty and premium tech." });

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <div className="bg-surface-950 text-white py-24">
        <Container className="text-center max-w-3xl">
          <p className="text-brand-400 text-sm font-medium uppercase tracking-widest mb-4">Our Story</p>
          <h1 className="font-display text-5xl md:text-6xl mb-6">Luxury, Curated for You</h1>
          <p className="text-surface-400 text-lg leading-relaxed">
            Luxe Store was born from a simple belief: everyone deserves access to the world's finest beauty and technology, with the trust and service they deserve.
          </p>
        </Container>
      </div>

      <Container className="py-20 max-w-4xl">
        {/* Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-20">
          <div>
            <h2 className="font-display text-3xl text-surface-900 dark:text-white mb-4">Our Mission</h2>
            <p className="text-surface-600 dark:text-surface-400 leading-relaxed">
              We curate and deliver authentic luxury beauty and premium tech products, sourced directly from authorized distributors. Every product is verified, every brand is approved, and every experience is crafted with care.
            </p>
          </div>
          <div>
            <h2 className="font-display text-3xl text-surface-900 dark:text-white mb-4">Our Promise</h2>
            <p className="text-surface-600 dark:text-surface-400 leading-relaxed">
              100% authentic products. Secure transactions. Fast, reliable shipping. And a customer service team that genuinely cares. We stand behind every product we sell, every single time.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-12 border-y border-surface-100 dark:border-surface-800 mb-20">
          {[
            { value: "186+",  label: "Curated Products" },
            { value: "31",    label: "Luxury Brands"    },
            { value: "50K+",  label: "Happy Customers"  },
            { value: "4.9★",  label: "Average Rating"   },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="font-display text-4xl text-surface-900 dark:text-white">{s.value}</p>
              <p className="text-sm text-surface-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Values */}
        <div>
          <h2 className="font-display text-3xl text-surface-900 dark:text-white mb-8 text-center">What We Stand For</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: "✓", title: "Authenticity", desc: "Every product is sourced from authorized partners. Zero counterfeits, zero compromises." },
              { icon: "🔒", title: "Trust & Security", desc: "Bank-grade encryption on every transaction. Your data and money are always safe." },
              { icon: "🌍", title: "Global Access", desc: "Luxury should know no borders. We ship to over 50 countries worldwide." },
            ].map(v => (
              <div key={v.title} className="p-6 rounded-2xl border border-surface-100 dark:border-surface-800 bg-white dark:bg-surface-900">
                <span className="text-3xl">{v.icon}</span>
                <h3 className="font-semibold text-surface-900 dark:text-white mt-3 mb-2">{v.title}</h3>
                <p className="text-sm text-surface-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
