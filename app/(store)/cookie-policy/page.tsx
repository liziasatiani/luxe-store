import { getLocale } from "next-intl/server";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const locale = await getLocale();
  return buildMetadata({ title: "Cookie Policy", description: "How Everything Street uses cookies and how you can manage them.", locale });
}

const SECTIONS = [
  {
    title: "1. What Are Cookies",
    content: "Cookies are small text files placed on your device by a website. They allow the site to remember information about your visit — such as your language preference, login status, and cart contents — so you don't have to re-enter them each time you return.\n\nWe use cookies for three purposes: to make our website work correctly (strictly necessary), to understand how visitors use our site (analytics), and to process payments securely (Stripe). We do not use advertising or marketing tracking cookies.",
  },
  {
    title: "2. Category 1 — Strictly Necessary Cookies",
    content: "These cookies are essential for the website to function. They cannot be declined. Declining them would prevent you from logging in, maintaining a cart, or completing a purchase.\n\n• Authentication session cookie — keeps you logged in during and between visits. Set by NextAuth. Expires: 30 days (remembered sessions) or when you close your browser (guest sessions).\n\n• CSRF protection cookie — protects all form submissions against cross-site request forgery attacks. Session-scoped; deleted when you close your browser.\n\n• Language preference cookie (luxe-locale) — stores your selected language (Georgian, English, French, or Spanish). Expires: 1 year.\n\n• Stripe fraud prevention cookies — Stripe sets device and session identifiers required to process payments securely and screen for fraud. These are mandatory when you proceed to checkout. They cannot be disabled without disabling payments.\n  Details: stripe.com/cookie-settings",
  },
  {
    title: "3. Category 2 — Analytics Cookies (consent required)",
    content: "These cookies help us understand how visitors use our website. All data is collected in aggregated, anonymised form — it does not identify you personally. Analytics cookies are only set after you provide consent via our cookie banner on your first visit.\n\n• Google Analytics 4 (_ga, _ga_*)\n  Purpose: Tracks pages visited, session duration, and general navigation patterns so we can improve the site.\n  Expiry: _ga — 2 years; _ga_* — 2 years (we use a 14-month data retention period).\n  Set by: Google LLC\n  Data location: United States (protected by Standard Contractual Clauses)\n  Opt-out: tools.google.com/dlpage/gaoptout\n  Google Privacy Policy: policies.google.com/privacy\n\nWithdrawing consent: You can withdraw analytics consent at any time by clearing your browser cookies and declining on the banner when you next visit. This will not affect your ability to shop.",
  },
  {
    title: "4. Category 3 — Marketing & Advertising Cookies",
    content: "We do not use any marketing, advertising, or social media tracking cookies on this website.\n\nNo Meta (Facebook) Pixel, TikTok Pixel, Google Ads remarketing tags, or similar third-party advertising trackers are installed on everythingstreet.ge.",
  },
  {
    title: "5. Managing Cookies",
    content: "You have several ways to control cookies:\n\n• Cookie banner: When you first visit our website, our cookie banner lets you accept or decline analytics cookies. Strictly necessary and Stripe cookies are always active and cannot be declined through the banner.\n\n• Browser settings: You can view, block, or delete cookies directly in your browser:\n  – Google Chrome: Settings → Privacy and Security → Cookies and other site data\n  – Mozilla Firefox: Settings → Privacy & Security → Cookies and Site Data\n  – Safari: Settings → Privacy → Manage Website Data\n  – Microsoft Edge: Settings → Cookies and site permissions\n\nPlease note: Blocking strictly necessary cookies will prevent core site functions (login, cart, checkout) from working correctly.",
  },
  {
    title: "6. Third-Party Cookie References",
    content: "The following third parties may set cookies through our website:\n\n• Stripe Payments Europe Ltd\n  Purpose: Secure payment processing and fraud prevention\n  Cookie management: stripe.com/cookie-settings\n  Privacy policy: stripe.com/privacy\n\n• Google LLC (Google Analytics 4)\n  Purpose: Anonymised website analytics (consent required)\n  Opt-out tool: tools.google.com/dlpage/gaoptout\n  Privacy policy: policies.google.com/privacy",
  },
  {
    title: "7. Updates to This Policy",
    content: "We will update this Cookie Policy when we add or remove services that use cookies. The 'Last updated' date reflects the most recent revision. For material changes we will notify you via our cookie banner on your next visit.\n\nFor questions about our use of cookies, contact us at legal@everythingstreet.ge.",
  },
];

export default function CookiePolicyPage() {
  return (
    <>
      <div className="k-page-hdr">
        <div className="wrap" style={{ textAlign: "center" }}>
          <p className="page-hd-eyebrow">Legal</p>
          <h1 className="page-hd-title">Cookie Policy</h1>
          <p style={{ fontSize: 11, color: "var(--chalk3)", marginTop: 8, letterSpacing: "0.08em" }}>Last updated: August 10, 2026</p>
        </div>
      </div>

      <div style={{ paddingTop: 48, paddingBottom: 96 }}>
        <div className="wrap" style={{ maxWidth: 760 }}>
          <p style={{ fontSize: 14, color: "var(--chalk2)", lineHeight: 1.8, marginBottom: 48, paddingBottom: 48, borderBottom: "1px solid var(--border)" }}>
            This Cookie Policy explains what cookies we use on everythingstreet.ge, why we use them, and how you can control them. We keep it short and honest — we use fewer cookies than most e-commerce sites.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
            {SECTIONS.map(s => (
              <div key={s.title} style={{ borderTop: "1px solid var(--border)", paddingTop: 28 }}>
                <h2 style={{ fontFamily: "var(--serif)", fontSize: 17, fontWeight: 700, color: "var(--chalk)", marginBottom: 12 }}>{s.title}</h2>
                <p style={{ fontSize: 13, color: "var(--chalk2)", lineHeight: 1.85, whiteSpace: "pre-line" }}>{s.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
