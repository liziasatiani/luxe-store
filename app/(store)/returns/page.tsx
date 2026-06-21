import { Container } from "@/components/ui";
import { buildMetadata } from "@/lib/seo";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("pages.returns");
  return buildMetadata({ title: t("title") });
}

export default async function ReturnsPage() {
  const t = await getTranslations("pages.returns");
  return (
    <>
      <div className="bg-surface-50 dark:bg-surface-900/50 border-b border-surface-100 dark:border-surface-800 py-14">
        <Container className="text-center">
          <h1 className="font-display text-5xl text-surface-900 dark:text-white mb-3">{t("title")}</h1>
          <p className="text-surface-500">{t("subtitle")}</p>
        </Container>
      </div>
      <Container className="py-16 max-w-3xl space-y-10">
        {[
          { title: "Return Policy Overview", content: "We offer 30-day hassle-free returns on all products. Items must be unused and in original packaging." },
          { title: "Eligible Items for Return", content: "Items must be:\n• Unused and in the same condition as received\n• In original packaging with all tags attached\n• For beauty products: unopened and sealed" },
          { title: "Non-Returnable Items", content: "• Opened beauty products\n• Personalized items\n• Digital downloads\n• Final Sale items\n• Gift cards" },
          { title: "How to Return", content: "Email returns@everythingstreet.com with your order number and the item(s) you'd like to return. We'll reply within 24 hours with a prepaid return label.\n\nOnce we receive the item, your refund is processed within 3–5 business days." },
          { title: "Refund Processing", content: "Refunds are processed within 3–5 business days and appear on your payment method within 5–10 business days." },
          { title: "Damaged Items", content: "Contact us within 7 days of delivery with photos. We will arrange a free replacement or full refund." },
        ].map(s => (
          <div key={s.title}>
            <h2 className="font-display text-2xl text-surface-900 dark:text-white mb-3">{s.title}</h2>
            <p className="text-surface-600 dark:text-surface-400 text-sm leading-relaxed whitespace-pre-line">{s.content}</p>
          </div>
        ))}
        <div className="p-6 rounded-2xl bg-brand-50 dark:bg-brand-900/10 border border-brand-100 dark:border-brand-800">
          <p className="font-semibold text-brand-800 dark:text-brand-300 mb-1">Need help with a return?</p>
          <p className="text-sm text-brand-700 dark:text-brand-400">Contact <a href="mailto:returns@everythingstreet.com" className="underline">returns@everythingstreet.com</a></p>
        </div>
      </Container>
    </>
  );
}
