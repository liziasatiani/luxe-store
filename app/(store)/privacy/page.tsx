import { Container } from "@/components/ui";
import { getLocale } from "next-intl/server";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const locale = await getLocale();
  return buildMetadata({ title: "Privacy Policy", locale });
}

const SECTIONS = [
  {
    title: "1. Data Controller",
    content: "[YOUR LEGAL ENTITY NAME]\n[YOUR ADDRESS]\nGeorgia (country)\n\nPrivacy Officer: [YOUR CONTACT EMAIL]\n\nWe are the data controller for personal information collected through this website. This policy is governed by Georgia's Law on Personal Data Protection (Law No. 5669, as amended) and, where applicable to EU residents, the General Data Protection Regulation (GDPR).",
  },
  {
    title: "2. Information We Collect",
    content: "We collect information you provide directly to us, such as when you create an account, place an order, or contact us:\n\n• Personal identification (name, email, phone number, shipping address)\n• Payment information (processed securely via Stripe — we do not store card details)\n• Order history and preferences\n• Communications you send us\n\nWe also automatically collect certain technical data when you visit our website, including IP address, browser type, pages visited, time spent on pages, and referring URLs. This data is collected via Google Analytics (see Section 4).",
  },
  {
    title: "3. Lawful Basis for Processing",
    content: "We process your personal data under the following legal bases:\n\n• Contract performance — to fulfill your orders, process returns, and provide customer support\n• Legitimate interests — to improve our website and prevent fraud\n• Consent — for marketing emails and analytics cookies (you may withdraw consent at any time)\n• Legal obligation — to comply with applicable Georgian and EU law",
  },
  {
    title: "4. Cookies & Analytics",
    content: "We use the following types of cookies:\n\n• Strictly necessary cookies — for authentication, security (CSRF protection), and language preferences. These cannot be declined.\n• Analytics cookies — Google Analytics (GA4) collects anonymised usage data to help us understand how visitors use our site. These cookies are only set after you accept analytics in the cookie banner on your first visit. You may withdraw consent at any time by clearing cookies or using your browser settings.\n\nDeclined or withdrawn consent for analytics cookies means Google Analytics will not be loaded and no _ga or _ga_* cookies will be set.",
  },
  {
    title: "5. Information Sharing",
    content: "We do not sell your personal information. We share your information only with:\n\n• Service providers necessary to operate our business:\n  – Stripe (payment processing) — stripe.com/privacy\n  – Supabase (database hosting in EU region)\n  – Resend (transactional email)\n  – Vercel (hosting and analytics infrastructure) — vercel.com/legal/privacy-policy\n  – Google Analytics (website analytics) — policies.google.com/privacy\n• Legal authorities when required by Georgian or EU law\n• Potential buyers in the event of a business merger or acquisition, under appropriate confidentiality obligations",
  },
  {
    title: "6. Data Retention",
    content: "We retain personal data for the following periods:\n\n• Account data — for the duration of your account, plus 2 years after closure\n• Order records — 7 years (required by Georgian accounting law)\n• Analytics data — as configured in your Google Analytics account (default 14 months)\n• Marketing consent records — until you withdraw consent, plus 3 years\n\nYou may request earlier deletion of your account and associated data at any time.",
  },
  {
    title: "7. Data Security",
    content: "We implement industry-standard security measures including TLS/HTTPS encryption in transit, bcrypt password hashing, CSRF protection on all forms, and role-based access controls on all administrative functions. Database access is restricted to server-side processes only — your data is never accessible client-side.\n\nNo method of transmission over the internet is 100% secure. If you have reason to believe your data has been compromised, please contact us immediately.",
  },
  {
    title: "8. Your Rights",
    content: "Under Georgia's Law on Personal Data Protection and the GDPR (where applicable), you have the following rights:\n\n• Right to access — request a copy of the data we hold about you\n• Right to rectification — correct inaccurate or incomplete data\n• Right to erasure — request deletion of your personal data\n• Right to data portability — receive your data in a machine-readable format\n• Right to object — object to processing based on legitimate interests\n• Right to withdraw consent — for any processing based on consent\n• Right to lodge a complaint — with the Personal Data Protection Service of Georgia (pdp.ge) or, for EU residents, with your local supervisory authority\n\nTo exercise any of these rights, contact us at [YOUR CONTACT EMAIL]. We will respond within 30 days.",
  },
  {
    title: "9. Children's Privacy",
    content: "Our services are not directed to children under 16. We do not knowingly collect personal information from children under 16. If you believe we have collected such information, please contact us immediately and we will delete it.",
  },
  {
    title: "10. Changes to This Policy",
    content: "We may update this Privacy Policy from time to time. When we do, we will update the 'Last updated' date below and notify you of material changes by email. Your continued use of our services after changes have been posted constitutes acceptance of the updated policy.",
  },
  {
    title: "11. Contact",
    content: "For privacy-related questions, data subject requests, or to exercise your rights, contact our Privacy Officer at:\n\n[YOUR CONTACT EMAIL]\n\nYou also have the right to lodge a complaint with the Personal Data Protection Service of Georgia: pdp.ge",
  },
];

export default function PrivacyPage() {
  return (
    <>
      <div className="bg-surface-50 dark:bg-surface-900/50 border-b border-surface-100 dark:border-surface-800 py-14">
        <Container className="text-center">
          <h1 className="font-display text-5xl text-surface-900 dark:text-white mb-3">Privacy Policy</h1>
          <p className="text-surface-500">Last updated: August 8, 2026</p>
        </Container>
      </div>
      <Container className="py-16 max-w-3xl space-y-8">
        <p className="text-surface-600 dark:text-surface-400 leading-relaxed">
          At Everything Street, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you visit our website or make a purchase.
        </p>
        {SECTIONS.map((s) => (
          <div key={s.title}>
            <h2 className="font-display text-xl text-surface-900 dark:text-white mb-3">{s.title}</h2>
            <p className="text-surface-600 dark:text-surface-400 text-sm leading-relaxed whitespace-pre-line">{s.content}</p>
          </div>
        ))}
      </Container>
    </>
  );
}
