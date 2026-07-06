import { Container } from "@/components/ui";
import { buildMetadata } from "@/lib/seo";
import { Truck, Clock, Globe, Package } from "lucide-react";

export const metadata = buildMetadata({ title: "Shipping Policy" });

export default function ShippingPage() {
  return (
    <>
      <div className="bg-surface-50 dark:bg-surface-900/50 border-b border-surface-100 dark:border-surface-800 py-14">
        <Container className="text-center">
          <h1 className="font-display text-5xl text-surface-900 dark:text-white mb-3">Shipping Policy</h1>
          <p className="text-surface-500">Fast, reliable delivery to your door.</p>
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
          { title: "Domestic Shipping (United States)", content: `We offer two shipping options within the United States:\n\n• Standard Shipping (3–5 business days): $9.99, FREE on orders over $75\n• Express Shipping (1–2 business days): $19.99\n\nOrders placed before 2PM EST on business days are processed the same day. Orders placed after 2PM or on weekends are processed the next business day.` },
          { title: "International Shipping", content: "We ship to over 50 countries worldwide. International shipping rates and delivery times vary by destination and are calculated at checkout.\n\nTypical delivery times:\n• Canada & Mexico: 5–7 business days\n• Europe: 7–10 business days\n• Asia & Middle East: 10–14 business days\n• Rest of World: 10–21 business days" },
          { title: "Duties & Taxes", content: "International orders may be subject to import duties, taxes, and customs fees upon arrival in your country. These charges are the responsibility of the recipient and are not included in our shipping charges. Please check with your local customs office for more information." },
          { title: "Order Tracking", content: "Once your order ships, you'll receive a confirmation email with a tracking number. You can track your order anytime from your account dashboard under 'My Orders'." },
          { title: "Lost or Damaged Packages", content: "If your package is lost in transit or arrives damaged, please contact us within 7 days of the expected delivery date. We will investigate with the carrier and either reship your order or issue a full refund." },
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
