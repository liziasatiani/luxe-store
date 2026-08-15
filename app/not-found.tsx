import Link from "next/link";
import { Container } from "@/components/ui";
import { ArrowRight, Search } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("pages.notFound");
  return (
    <Container className="py-32 max-w-2xl">
      <div className="relative mb-12 select-none overflow-hidden">
        <p className="font-display text-[clamp(120px,30vw,220px)] leading-none text-black/[0.04] dark:text-white/[0.04] tracking-[0.08em] text-center">
          404
        </p>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-[10px] tracking-[0.28em] uppercase text-black/30 dark:text-white/30 mb-5">Error 404</p>
          <h1 className="font-display text-3xl md:text-4xl uppercase tracking-[0.06em] text-black dark:text-white text-center">
            {t("title")}
          </h1>
        </div>
      </div>

      <div className="border-t border-black/8 dark:border-white/8 pt-10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <p className="text-sm text-black/40 dark:text-white/40 max-w-xs leading-relaxed text-center sm:text-left">
          {t("subtitle")}
        </p>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/search"
            className="h-11 w-11 flex items-center justify-center border border-black/15 dark:border-white/15 text-black/50 dark:text-white/50 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white transition-colors"
            aria-label={t("search")}
          >
            <Search size={16} />
          </Link>
          <Link
            href="/"
            className="h-11 px-8 flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black text-[11px] tracking-[0.14em] uppercase font-medium hover:bg-black/80 dark:hover:bg-white/80 transition-colors"
          >
            {t("back")} <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </Container>
  );
}
