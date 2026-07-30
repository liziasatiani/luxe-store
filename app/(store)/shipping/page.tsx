import { Container } from "@/components/ui";
import { buildMetadata } from "@/lib/seo";
import { Truck, Clock, Globe, Package } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("pages.shipping");
  return buildMetadata({ title: t("title") });
}

export default async function ShippingPage() {
  const t = await getTranslations("pages.shipping");
  return (
    <>
      <div className="bg-surface-50 dark:bg-surface-900/50 border-b border-surface-100 dark:border-surface-800 py-14">
        <Container className="text-center">
          <h1 className="font-display text-5xl text-surface-900 dark:text-white mb-3">{t("title")}</h1>
          <p className="text-surface-500">{t("subtitle")}</p>
        </Container>
      </div>
      <Container className="py-16 max-w-3xl space-y-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Truck,   label: "Free Shipping",   desc: "On orders over $75" },
            { icon: Clock,   label: "Standard",        desc: "3–5 business days"  },
            { icon: Package, label: "Express",         desc: "1–2 business days"  },
            { icon: Globe,   label: "International",   desc: "7–14 business days" },
          ].map(item => (
            <div key={item.label} className="p-5 rounded-2xl border border-surface-100 dark:border-surface-800 bg-white dark:bg-surface-900 text-center">
              <item.icon size={22} className="text-brand-500 mx-auto mb-3" />
              <p className="font-semibold text-sm text-surface-900 dark:text-white">{item.label}</p>
              <p className="text-xs text-surface-400 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
        {[
          { title: "Domestic Shipping (United States)", content: "Standard Shipping (3–5 business days): $9.99, FREE on orders over $75\nExpress Shipping (1–2 business days): $19.99\n\nOrders placed before 2PM EST are processed the same day." },
          { title: "International Shipping", content: "We ship to over 50 countries worldwide.\n\nCanada & Mexico: 5–7 business days\nEurope: 7–10 business days\nAsia & Middle East: 10–14 business days" },
          { title: "Duties & Taxes", content: "International orders may be subject to import duties and taxes upon arrival. These charges are the responsibility of the recipient." },
          { title: "Order Tracking", content: "Once your order ships, you'll receive a confirmation email with a tracking number. Track anytime from your account under 'My Orders'." },
          { title: "Lost or Damaged Packages", content: "Contact us within 7 days of the expected delivery date if your package is lost or arrives damaged. We will reship or issue a full refund." },
        ].map(section => (
          <div key={section.title}>
            <h2 className="font-display text-2xl text-surface-900 dark:text-white mb-3">{section.title}</h2>
            <p className="text-surface-600 dark:text-surface-400 text-sm leading-relaxed whitespace-pre-line">{section.content}</p>
          </div>
        ))}
      </Container>
    </>
  );
}
