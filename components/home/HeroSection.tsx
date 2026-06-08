"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-surface-950">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(196,130,31,0.15),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(196,130,31,0.08),transparent_60%)]" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-brand-500/5 blur-3xl" />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "80px 80px" }}
      />

      <div className="relative z-10 w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="max-w-4xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 mb-8"
          >
            <Sparkles size={14} className="text-brand-400" />
            <span className="text-sm text-brand-300 font-medium">New Arrivals Every Week</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-6xl md:text-7xl lg:text-8xl text-white leading-none tracking-tight mb-6"
          >
            Luxury
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-gold">
              Redefined.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-surface-400 max-w-xl leading-relaxed mb-10"
          >
            Discover 186 curated products across luxury beauty and premium tech. 
            Brands you love, experiences that transcend.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-4"
          >
            <Button variant="gold" size="xl" rightIcon={<ArrowRight size={20} />} asChild>
              <Link href="/beauty">Shop Beauty</Link>
            </Button>
            <Button variant="outline" size="xl" className="border-surface-700 text-white hover:bg-surface-800" asChild>
              <Link href="/tech">Explore Tech</Link>
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap gap-10 mt-16"
          >
            {[
              { value: "186+", label: "Curated Products" },
              { value: "31",   label: "Luxury Brands"    },
              { value: "50K+", label: "Happy Customers"  },
              { value: "4.9★", label: "Average Rating"   },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-display text-white">{stat.value}</p>
                <p className="text-sm text-surface-500 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs text-surface-600">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-surface-600 to-transparent" />
      </motion.div>
    </section>
  );
}
