"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FAQItem { q: string; a: string }
interface FAQCategory { title: string; items: FAQItem[] }

function FAQItemRow({ q, a }: FAQItem) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid var(--border)" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "16px 0", textAlign: "left", gap: 16, background: "none", border: "none", cursor: "pointer" }}
      >
        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--chalk)", lineHeight: 1.4 }}>{q}</span>
        <ChevronDown
          size={15}
          style={{ color: "var(--chalk3)", flexShrink: 0, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: "hidden" }}
          >
            <p style={{ paddingBottom: 16, fontSize: 13, color: "var(--chalk2)", lineHeight: 1.7 }}>{a}</p>
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
      <div className="k-page-hdr">
        <div className="wrap" style={{ textAlign: "center" }}>
          <p className="page-hd-eyebrow">{t("title")}</p>
          <h1 className="page-hd-title">{t("subtitle")}</h1>
        </div>
      </div>

      <div style={{ paddingTop: 48, paddingBottom: 96 }}>
        <div className="wrap" style={{ maxWidth: 760 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
            {categories.map(section => (
              <div key={section.title}>
                <h2 style={{ fontFamily: "var(--serif)", fontSize: 18, fontWeight: 700, color: "var(--chalk)", marginBottom: 20, letterSpacing: "0.02em", paddingBottom: 16, borderBottom: "1px solid var(--border)" }}>
                  {section.title}
                </h2>
                <div>
                  {section.items.map(item => <FAQItemRow key={item.q} {...item} />)}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 64, padding: "32px 36px", border: "1px solid var(--border)", background: "var(--s1)", textAlign: "center" }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--chalk)", marginBottom: 6, letterSpacing: "0.02em" }}>{t("stillHaveQuestions")}</p>
            <p style={{ fontSize: 12, color: "var(--chalk2)", marginBottom: 20 }}>{t("supportHours")}</p>
            <a
              href="/contact"
              style={{ display: "inline-block", padding: "12px 28px", background: "var(--gold)", color: "#000", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", textDecoration: "none" }}
            >
              {t("contactSupport")}
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
