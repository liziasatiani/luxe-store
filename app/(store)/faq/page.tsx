"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/components/ui";
import { cn } from "@/lib/utils";

interface FAQItem {
  q: string;
  a: string;
}

interface FAQCategory {
  title: string;
  items: FAQItem[];
}

function FAQItemRow({ q, a }: FAQItem) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-surface-100 dark:border-surface-800 last:border-0">
      <button onClick={() => setOpen(o => !o)} className="flex items-center justify-between w-full py-4 text-left gap-4">
        <span className="font-medium text-surface-900 dark:text-white text-sm">{q}</span>
        <ChevronDown size={16} className={cn("text-surface-400 shrink-0 transition-transform duration-200", open && "rotate-180")} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-sm text-surface-600 dark:text-surface-400 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQPage() {
  const t = useTranslations("pages.faq");
  const categories = t.raw("categories") as FAQCategory[];

  return (
    <>
      <div className="bg-surface-50 dark:bg-surface-900/50 border-b border-surface-100 dark:border-surface-800 py-14">
        <Container className="text-center">
          <h1 className="font-display text-5xl text-surface-900 dark:text-white mb-3">{t("title")}</h1>
          <p className="text-surface-500 max-w-md mx-auto">{t("subtitle")}</p>
        </Container>
      </div>

      <Container className="py-16 max-w-3xl">
        <div className="space-y-10">
          {categories.map(section => (
            <div key={section.title}>
              <h2 className="font-display text-2xl text-surface-900 dark:text-white mb-4">{section.title}</h2>
              <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 px-6">
                {section.items.map(item => <FAQItemRow key={item.q} {...item} />)}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center p-8 rounded-2xl bg-surface-50 dark:bg-surface-900/50 border border-surface-100 dark:border-surface-800">
          <p className="font-semibold text-surface-900 dark:text-white mb-2">{t("stillHaveQuestions")}</p>
          <p className="text-surface-500 text-sm mb-4">{t("supportHours")}</p>
          <a href="/contact" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors">
            {t("contactSupport")}
          </a>
        </div>
      </Container>
    </>
  );
}
