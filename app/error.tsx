"use client";
import { useEffect } from "react";
import Link from "next/link";
import { ArrowRight, RefreshCw } from "lucide-react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        <div className="relative mb-12 select-none overflow-hidden">
          <p className="font-display text-[clamp(80px,20vw,180px)] leading-none text-black/[0.04] dark:text-white/[0.04] tracking-[0.08em] text-center">
            500
          </p>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-[10px] tracking-[0.28em] uppercase text-black/30 dark:text-white/30 mb-5">Unexpected error</p>
            <h1 className="font-display text-3xl md:text-4xl uppercase tracking-[0.06em] text-black dark:text-white text-center">
              Something went wrong
            </h1>
          </div>
        </div>

        <div className="border-t border-black/8 dark:border-white/8 pt-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <p className="text-sm text-black/40 dark:text-white/40 max-w-xs leading-relaxed">
              We encountered an unexpected error. Please try again or go back home.
            </p>
            {error.digest && (
              <p className="text-[10px] tracking-[0.08em] text-black/20 dark:text-white/20 mt-2 font-mono">
                ID: {error.digest}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={reset}
              className="h-11 w-11 flex items-center justify-center border border-black/15 dark:border-white/15 text-black/50 dark:text-white/50 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white transition-colors"
              aria-label="Try again"
            >
              <RefreshCw size={15} />
            </button>
            <Link
              href="/"
              className="h-11 px-8 flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black text-[11px] tracking-[0.14em] uppercase font-medium hover:bg-black/80 dark:hover:bg-white/80 transition-colors"
            >
              Go Home <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
