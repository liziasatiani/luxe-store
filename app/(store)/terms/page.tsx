import { getLocale } from "next-intl/server";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const locale = await getLocale();
  return buildMetadata({ title: "Terms of Service", locale });
}

const SECTIONS = [
  { title: "1. Acceptance of Terms", content: "By accessing and using the Everything Street website and services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services." },
  { title: "2. Account Registration", content: "To access certain features, you must create an account. You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. You must provide accurate, current, and complete information during registration." },
  { title: "3. Products & Pricing", content: "All prices are displayed in Georgian Lari (₾ GEL) unless otherwise stated. We reserve the right to modify prices at any time without prior notice. We strive to display accurate product information, but we do not warrant that descriptions or prices are error-free. In the event of a pricing error, we reserve the right to cancel orders placed at the incorrect price and will notify you promptly." },
  { title: "4. Order Acceptance", content: "Your order constitutes an offer to purchase. We reserve the right to refuse or cancel any order at our discretion, including for reasons such as product unavailability, errors in product or pricing information, or suspected fraudulent activity. We will notify you promptly if your order is cancelled." },
  { title: "5. Payment", content: "Payment is due at the time of purchase. We accept major credit cards, Apple Pay, and Google Pay, processed securely via Stripe. Cash on delivery is available for orders under ₾100. By providing payment information, you represent that you are authorised to use the payment method provided." },
  { title: "6. Returns & Refunds", content: "Our returns and refund policy is set out in full on our Returns page. By placing an order you agree to the terms of that policy." },
  { title: "7. Intellectual Property", content: "All content on this website, including text, images, logos, and software, is the property of Everything Street or its content suppliers and is protected by intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission." },
  { title: "8. Prohibited Uses", content: "You agree not to:\n• Use the service for any unlawful purpose\n• Attempt to gain unauthorised access to any portion of the service\n• Transmit any harmful, offensive, or disruptive content\n• Scrape or harvest data from our website\n• Impersonate another person or entity\n• Engage in fraudulent activities" },
  { title: "9. Limitation of Liability", content: "To the fullest extent permitted by applicable law, Everything Street shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services, even if we have been advised of the possibility of such damages. Our total liability shall not exceed the amount paid by you for the specific order in question." },
  { title: "10. Governing Law", content: "These Terms shall be governed by and construed in accordance with the laws of Georgia (country), without regard to its conflict of law provisions. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts of Georgia (country)." },
  { title: "11. Changes to Terms", content: "We reserve the right to modify these Terms at any time. Continued use of our services after changes constitutes acceptance of the new Terms. We will notify you of material changes via email or website notice." },
  { title: "12. Contact", content: "For questions about these Terms, contact us at legal@everythingstreet.ge." },
];

export default function TermsPage() {
  return (
    <>
      <div className="k-page-hdr">
        <div className="wrap">
          <p className="page-hd-eyebrow">Legal</p>
          <h1 className="page-hd-title">Terms of Service</h1>
          <p style={{ fontSize: 12, color: "var(--chalk3)", marginTop: 12 }}>Last updated: August 8, 2026</p>
        </div>
      </div>
      <div style={{ paddingTop: 64, paddingBottom: 96 }}>
        <div className="wrap" style={{ maxWidth: 720 }}>
          <p style={{ fontSize: 14, color: "var(--chalk2)", lineHeight: 1.8, marginBottom: 48 }}>
            Please read these Terms of Service carefully before using the Everything Street website or placing an order. These terms govern your use of our platform and services.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
            {SECTIONS.map((s) => (
              <div key={s.title} style={{ borderTop: "1px solid var(--border)", paddingTop: 28 }}>
                <h2 style={{ fontFamily: "var(--serif)", fontSize: 18, fontWeight: 700, color: "var(--chalk)", marginBottom: 12 }}>{s.title}</h2>
                <p style={{ fontSize: 13, color: "var(--chalk2)", lineHeight: 1.8, whiteSpace: "pre-line" }}>{s.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
