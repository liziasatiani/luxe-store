import { Container } from "@/components/ui";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Terms of Service" });

const SECTIONS = [
  { title: "1. Acceptance of Terms", content: "By accessing and using the Luxe Store website and services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services." },
  { title: "2. Account Registration", content: "To access certain features, you must create an account. You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. You must provide accurate, current, and complete information during registration." },
  { title: "3. Products & Pricing", content: "All prices are displayed in USD unless otherwise stated. We reserve the right to modify prices at any time without notice. We strive to display accurate product information, but we do not warrant that descriptions or prices are error-free. In the event of a pricing error, we reserve the right to cancel orders placed at the incorrect price." },
  { title: "4. Order Acceptance", content: "Your order constitutes an offer to purchase. We reserve the right to refuse or cancel any order at our discretion, including for reasons such as product unavailability, errors in product or pricing information, or suspected fraudulent activity. We will notify you promptly if your order is cancelled." },
  { title: "5. Payment", content: "Payment is due at the time of purchase. We accept major credit cards and process payments securely through Stripe. By providing payment information, you represent that you are authorized to use the payment method provided." },
  { title: "6. Intellectual Property", content: "All content on this website, including text, images, logos, and software, is the property of Luxe Store or its content suppliers and is protected by intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission." },
  { title: "7. Prohibited Uses", content: "You agree not to:\n• Use the service for any unlawful purpose\n• Attempt to gain unauthorized access to any portion of the service\n• Transmit any harmful, offensive, or disruptive content\n• Scrape or harvest data from our website\n• Impersonate another person or entity\n• Engage in fraudulent activities" },
  { title: "8. Limitation of Liability", content: "To the fullest extent permitted by law, Luxe Store shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services, even if we have been advised of the possibility of such damages. Our total liability shall not exceed the amount paid by you for the specific order in question." },
  { title: "9. Governing Law", content: "These Terms shall be governed by and construed in accordance with the laws of the State of California, United States, without regard to its conflict of law provisions." },
  { title: "10. Changes to Terms", content: "We reserve the right to modify these Terms at any time. Continued use of our services after changes constitutes acceptance of the new Terms. We will notify you of material changes via email or website notice." },
  { title: "11. Contact", content: "For questions about these Terms, contact us at legal@luxestore.com or write to us at 123 Luxury Lane, Beverly Hills, CA 90210." },
];

export default function TermsPage() {
  return (
    <>
      <div className="bg-surface-50 dark:bg-surface-900/50 border-b border-surface-100 dark:border-surface-800 py-14">
        <Container className="text-center">
          <h1 className="font-display text-5xl text-surface-900 dark:text-white mb-3">Terms of Service</h1>
          <p className="text-surface-500">Last updated: January 1, 2025</p>
        </Container>
      </div>
      <Container className="py-16 max-w-3xl space-y-8">
        <p className="text-surface-600 dark:text-surface-400 leading-relaxed">
          Please read these Terms of Service carefully before using the Luxe Store website or placing an order. These terms govern your use of our platform and services.
        </p>
        {SECTIONS.map(s => (
          <div key={s.title}>
            <h2 className="font-display text-xl text-surface-900 dark:text-white mb-3">{s.title}</h2>
            <p className="text-surface-600 dark:text-surface-400 text-sm leading-relaxed whitespace-pre-line">{s.content}</p>
          </div>
        ))}
      </Container>
    </>
  );
}
