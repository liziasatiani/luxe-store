import { getLocale } from "next-intl/server";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const locale = await getLocale();
  return buildMetadata({ title: "Privacy Policy", description: "How Everything Street collects, uses, and protects your personal data.", locale });
}

const SECTIONS = [
  {
    title: "1. Data Controller",
    content: "Everything Street\nShalva Nutsubidze St, Tbilisi, Georgia\nEmail: legal@everythingstreet.ge\nPhone: +995 500 09 06 14\n\nThis Privacy Policy explains how we collect, use, and protect your personal data when you use our website or place an order. It is governed primarily by Georgia's Law on Personal Data Protection (Law No. 5669, as amended) and, where applicable to customers in the European Economic Area or United Kingdom, by the General Data Protection Regulation (GDPR) and UK GDPR.",
  },
  {
    title: "2. Information We Collect",
    content: "a) Account & Order Data\nWhen you create an account or place an order, we collect your name, email address, phone number, shipping address, and billing address. This is necessary to fulfil your order and communicate with you.\nLegal basis: Performance of contract (GDPR Art. 6(1)(b)).\n\nb) Payment Data\nWe do not store, see, or process your card number, CVV, or full payment details. All payment data is transmitted directly to and handled by Stripe Payments Europe Ltd. We receive only: payment confirmation status, last four digits of your card, card type, and a Stripe customer reference.\nSee Stripe's Privacy Policy: stripe.com/privacy\nLegal basis: Performance of contract; legal obligation.\n\nc) Stripe Radar — Automated Fraud Screening\nStripe uses automated fraud detection technology (Stripe Radar) that analyses transaction signals — including IP address, device fingerprint, and purchase patterns — to identify potentially fraudulent activity. This constitutes automated processing that may result in a payment being declined. If you believe a legitimate order was incorrectly declined, contact us at hello@everythingstreet.ge to request manual review.\nLegal basis: Legitimate interests — fraud prevention (GDPR Art. 6(1)(f)).\n\nd) Device & Technical Data\nWhen you visit our website, we automatically collect your IP address, browser type, operating system, pages visited, and referring URLs. This is used for security and to maintain site functionality.\nLegal basis: Legitimate interests (site security and operation).\n\ne) Analytics Data\nWe use Google Analytics 4 (GA4) to collect anonymised usage statistics (pages viewed, session duration, general navigation patterns). GA4 cookies are only activated after you provide consent via our cookie banner. You may withdraw consent at any time.\nLegal basis: Consent (GDPR Art. 6(1)(a)).\n\nf) Marketing Communications\nIf you subscribe to our newsletter, we store your email address and a record of your consent. You may unsubscribe at any time via the one-click link in every email.\nLegal basis: Consent (GDPR Art. 6(1)(a)).\n\ng) Customer Support\nIf you contact us by email, we retain the content of those communications to assist you and for record-keeping.\nLegal basis: Legitimate interests.",
  },
  {
    title: "3. How We Use Your Data",
    content: "We use your personal data to:\n• Process and fulfil your orders, including arranging delivery\n• Process payments securely via Stripe\n• Detect and prevent fraud (Stripe Radar)\n• Send order confirmation, dispatch, and delivery notifications\n• Respond to customer service enquiries\n• Send marketing emails (with your consent only)\n• Analyse website usage and improve our services (with your consent)\n• Comply with Georgian tax, accounting, and legal obligations\n• Defend our legal rights if a dispute arises",
  },
  {
    title: "4. Third-Party Service Providers",
    content: "We share your personal data only with service providers who require it to perform specific functions. We do not sell your personal data.\n\n• Stripe Payments Europe Ltd — payment processing and fraud detection\n  Data: payment details, billing address, device and IP data\n  Location: United States and EU | Safeguard: Standard Contractual Clauses\n  Policy: stripe.com/privacy\n\n• Supabase Inc. — database and file storage\n  Data: all customer and order data stored in our systems\n  Location: EU region (Frankfurt, Germany)\n  Policy: supabase.com/privacy\n\n• Resend Inc. — transactional email delivery\n  Data: your email address, name, and order details in email content\n  Location: United States | Safeguard: Standard Contractual Clauses\n\n• Vercel Inc. — website hosting and edge delivery\n  Data: IP address, request logs\n  Location: US and globally distributed edge nodes | Safeguard: SCCs\n  Policy: vercel.com/legal/privacy-policy\n\n• Google LLC (Google Analytics 4) — anonymised website analytics\n  Data: anonymised usage data and anonymised IP address\n  Location: United States | Safeguard: Standard Contractual Clauses\n  Opt-out: tools.google.com/dlpage/gaoptout\n\n• Upstash Inc. — rate limiting and abuse prevention\n  Data: IP address for rate-limit counting only\n  Location: EU region\n\n• Georgian tax authorities and regulatory bodies — where legally required\n• Law enforcement or courts — only when legally compelled",
  },
  {
    title: "5. International Data Transfers",
    content: "Several of our service providers process data outside the European Economic Area (EEA) and Georgia:\n\n• Stripe: United States — protected by EU Standard Contractual Clauses (SCCs)\n• Resend: United States — protected by EU Standard Contractual Clauses\n• Vercel: United States and global edge — protected by EU Standard Contractual Clauses\n• Google Analytics: United States — protected by SCCs and Google's Data Processing Terms\n\nStandard Contractual Clauses are legal mechanisms approved by the European Commission that require non-EEA processors to protect personal data to EU standards. Copies of applicable SCCs are available on request from legal@everythingstreet.ge.",
  },
  {
    title: "6. Data Retention",
    content: "We retain your personal data for the following periods:\n\n• Order records and transaction data: 7 years (required by Georgian tax and accounting law)\n• Account profile data: for the duration of your account, plus 2 years after you close it\n• Marketing consent records: until you withdraw consent, plus 3 years for audit purposes\n• Customer support communications: 3 years from the last exchange\n• Analytics data: 14 months (Google Analytics configured retention period)\n• Payment records: per Stripe's own retention policy (stripe.com/privacy)\n\nYou may request earlier deletion of your data at any time. We will comply unless we are legally required to retain it — for example, tax records must be kept for 7 years under Georgian law.",
  },
  {
    title: "7. Your Rights",
    content: "Under Georgia's Law on Personal Data Protection and the GDPR (for EEA/UK residents), you have the following rights:\n\n• Right to access — request a copy of all personal data we hold about you\n• Right to rectification — ask us to correct inaccurate or incomplete data\n• Right to erasure — ask us to delete your personal data, subject to legal retention requirements\n• Right to restrict processing — ask us to pause processing of your data while a dispute is resolved\n• Right to data portability — receive your data in a structured, machine-readable format\n• Right to object — object to processing based on legitimate interests or for direct marketing\n• Rights related to automated decision-making — Stripe Radar may automatically decline a transaction. You have the right to request human review of any such decision by contacting us at hello@everythingstreet.ge.\n• Right to withdraw consent — for any processing based on consent (analytics, marketing), at any time, without affecting the lawfulness of prior processing\n\nTo exercise any of these rights, email legal@everythingstreet.ge. We will respond within 30 calendar days. There is no fee for a request.",
  },
  {
    title: "8. Supervisory Authorities",
    content: "If you are not satisfied with how we handle your data, you have the right to lodge a complaint with a supervisory authority:\n\nGeorgia:\nPersonal Data Protection Service of Georgia\nWebsite: pdp.ge | Email: info@pdp.ge\n\nEuropean Union / EEA residents:\nYour local national Data Protection Authority\n(Full list at edpb.europa.eu/about-edpb/about-edpb/members)\n\nUnited Kingdom residents:\nInformation Commissioner's Office (ICO)\nWebsite: ico.org.uk | Phone: 0303 123 1113",
  },
  {
    title: "9. Connected & Smart Devices",
    content: "Some tech products we sell — such as smartwatches, fitness trackers, and smart home devices — may collect personal data when used. This data is processed directly by the product manufacturer through their own apps and infrastructure, not by Everything Street. We do not receive any data from devices your customers use. Please review the relevant manufacturer's privacy policy before using any connected device.",
  },
  {
    title: "10. Children",
    content: "Our website and services are not directed to persons under 18 years of age. We do not knowingly collect personal data from minors. If you believe we hold data about a person under 18, contact us at legal@everythingstreet.ge and we will delete it promptly.",
  },
  {
    title: "11. Changes to This Policy",
    content: "We may update this Privacy Policy from time to time. When we make material changes, we will update the 'Last updated' date below and notify registered customers by email at least 14 days before the changes take effect. Your continued use of our website after that date constitutes acceptance of the updated policy.",
  },
  {
    title: "12. Contact",
    content: "For any privacy-related questions or to exercise your rights:\n\nEmail: legal@everythingstreet.ge\nPhone: +995 500 09 06 14\nAddress: Everything Street, Shalva Nutsubidze St, Tbilisi, Georgia\n\nWe aim to respond to all privacy enquiries within 5 business days.",
  },
];

export default function PrivacyPage() {
  return (
    <>
      <div className="k-page-hdr">
        <div className="wrap" style={{ textAlign: "center" }}>
          <p className="page-hd-eyebrow">Legal</p>
          <h1 className="page-hd-title">Privacy Policy</h1>
          <p style={{ fontSize: 11, color: "var(--chalk3)", marginTop: 8, letterSpacing: "0.08em" }}>Last updated: August 10, 2026 · Effective: August 10, 2026</p>
        </div>
      </div>

      <div style={{ paddingTop: 48, paddingBottom: 96 }}>
        <div className="wrap" style={{ maxWidth: 760 }}>
          <p style={{ fontSize: 14, color: "var(--chalk2)", lineHeight: 1.8, marginBottom: 48, paddingBottom: 48, borderBottom: "1px solid var(--border)" }}>
            At Everything Street we take your privacy seriously. This policy explains what personal data we collect, why we collect it, how we use it, and your rights — in plain language.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
            {SECTIONS.map(s => (
              <div key={s.title} style={{ borderTop: "1px solid var(--border)", paddingTop: 28 }}>
                <h2 style={{ fontFamily: "var(--serif)", fontSize: 17, fontWeight: 700, color: "var(--chalk)", marginBottom: 12, letterSpacing: "0.02em" }}>{s.title}</h2>
                <p style={{ fontSize: 13, color: "var(--chalk2)", lineHeight: 1.85, whiteSpace: "pre-line" }}>{s.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
