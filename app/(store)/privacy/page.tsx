import { Container } from "@/components/ui";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Privacy Policy" });

const SECTIONS = [
  { title: "1. Information We Collect", content: "We collect information you provide directly to us, such as when you create an account, place an order, or contact us:\n\n• Personal identification (name, email, phone number, shipping address)\n• Payment information (processed securely by Stripe — we do not store card details)\n• Order history and preferences\n• Communications you send us\n\nWe also automatically collect certain usage data when you visit our website, including IP address, browser type, pages visited, and time spent on pages." },
  { title: "2. How We Use Your Information", content: "We use the information we collect to:\n\n• Process and fulfill your orders\n• Send order confirmations, shipping updates, and receipts\n• Respond to your comments and questions\n• Send promotional communications (you may opt out at any time)\n• Improve our website and services\n• Comply with legal obligations\n• Prevent fraud and ensure security" },
  { title: "3. Information Sharing", content: "We do not sell your personal information. We share your information only with:\n\n• Service providers who help us operate our business (e.g., payment processors, shipping carriers, email services)\n• Legal authorities when required by law\n• Potential buyers in the event of a business merger or acquisition (with appropriate confidentiality protections)" },
  { title: "4. Cookies & Tracking", content: "We use cookies and similar tracking technologies to enhance your experience, analyze usage patterns, and deliver relevant content. You can control cookie settings through your browser. Note that disabling cookies may affect some website functionality." },
  { title: "5. Data Security", content: "We implement industry-standard security measures including SSL/TLS encryption, secure password hashing, and regular security audits. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security." },
  { title: "6. Data Retention", content: "We retain your personal information for as long as necessary to provide our services and comply with legal obligations. You may request deletion of your account and associated data at any time by contacting us." },
  { title: "7. Your Rights", content: "Depending on your location, you may have rights including:\n\n• Right to access your personal data\n• Right to correct inaccurate data\n• Right to delete your data ('right to be forgotten')\n• Right to data portability\n• Right to object to processing\n• Right to withdraw consent\n\nTo exercise these rights, contact us at privacy@luxestore.com." },
  { title: "8. Children's Privacy", content: "Our services are not directed to children under 13. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us immediately." },
  { title: "9. Changes to This Policy", content: "We may update this Privacy Policy from time to time. We will notify you of significant changes by email or by posting a notice on our website. Your continued use of our services after changes constitutes acceptance of the updated policy." },
  { title: "10. Contact Us", content: "For privacy-related questions or to exercise your rights, contact our Privacy Officer at:\n\nprivacy@luxestore.com\n123 Luxury Lane, Beverly Hills, CA 90210\n+1 (555) 000-0000" },
];

export default function PrivacyPage() {
  return (
    <>
      <div className="bg-surface-50 dark:bg-surface-900/50 border-b border-surface-100 dark:border-surface-800 py-14">
        <Container className="text-center">
          <h1 className="font-display text-5xl text-surface-900 dark:text-white mb-3">Privacy Policy</h1>
          <p className="text-surface-500">Last updated: January 1, 2025</p>
        </Container>
      </div>
      <Container className="py-16 max-w-3xl space-y-8">
        <p className="text-surface-600 dark:text-surface-400 leading-relaxed">
          At Luxe Store, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or make a purchase.
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
