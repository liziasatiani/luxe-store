import { getLocale } from "next-intl/server";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const locale = await getLocale();
  return buildMetadata({ title: "Terms & Conditions", description: "Terms and Conditions governing purchases and use of Everything Street.", locale });
}

const SECTIONS = [
  {
    title: "1. About These Terms",
    content: "These Terms and Conditions govern your use of everythingstreet.ge and the purchase of products from Everything Street. Please read them carefully before placing an order.\n\nBusiness details:\nEverything Street\nShalva Nutsubidze St, Tbilisi, Georgia\nEmail: legal@everythingstreet.ge\nPhone: +995 500 09 06 14\n\nBy using our website or placing an order you agree to these Terms. If you do not agree, please do not use our services.",
  },
  {
    title: "2. Who Can Purchase",
    content: "You must be at least 18 years of age to create an account or purchase from Everything Street. Under Georgian law (Civil Code), legally binding contracts require the parties to have full legal capacity, which begins at age 18.\n\nInternational buyers: You are responsible for ensuring that the products you order are legal to import and use in your country. Some beauty ingredients and electronic devices may be subject to import restrictions. Everything Street is not responsible for items seized or refused at customs.",
  },
  {
    title: "3. Account Registration & Security",
    content: "When you create an account, you must provide accurate, complete, and current information. You are responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account.\n\nNotify us immediately at hello@everythingstreet.ge if you suspect unauthorised access to your account. We reserve the right to suspend accounts that show signs of fraudulent or abusive activity.",
  },
  {
    title: "4. Products & Descriptions",
    content: "We aim to ensure that all product descriptions, images, and specifications are accurate. However:\n\n• Beauty products: Ingredient formulations may vary between product batches due to manufacturer updates. Always check the physical label on the product you receive before use, especially if you have known allergies or sensitivities.\n• Tech products: Product images are representative and may differ slightly from the actual item. Technical specifications are sourced from manufacturers and are correct to the best of our knowledge at time of listing.\n• If you receive a product that materially differs from its description, you are entitled to a return or refund under our Return Policy and Georgian consumer law.",
  },
  {
    title: "5. Pricing & Currency",
    content: "All prices are displayed in Georgian Lari (₾ GEL) and include applicable taxes unless otherwise stated. We reserve the right to change prices at any time. The price applicable to your order is the price shown at the time you complete your purchase.\n\nIn the event of a pricing error on our website, we reserve the right to cancel orders placed at the incorrect price. We will notify you promptly and issue a full refund if payment has already been taken.\n\nInternational customers: Payment is charged in GEL. Currency conversion and any fees charged by your card issuer are your responsibility.",
  },
  {
    title: "6. Placing an Order",
    content: "When you place an order, you are making an offer to purchase. We will send you an order confirmation email when your payment is successfully processed — this is an acknowledgement of your order, not an acceptance.\n\nA binding contract between you and Everything Street is formed when we dispatch your goods and send you a dispatch confirmation email.\n\nWe reserve the right to cancel any order at our sole discretion, including in cases of:\n• Product being out of stock after your order was placed\n• Suspected fraudulent activity identified by Stripe Radar or manual review\n• Pricing error on our website\n• Failure to obtain payment authorisation\n\nIf we cancel your order we will notify you promptly and issue a full refund.",
  },
  {
    title: "7. Payment via Stripe",
    content: "All payments are processed securely by Stripe Payments Europe Ltd. By placing an order, you confirm that you are authorised to use the payment method provided.\n\nAccepted payment methods: Visa, Mastercard, and Apple Pay (where available in your region).\n\nPCI DSS compliance: Your card number, CVV, and full payment details are transmitted directly to Stripe and are never seen, stored, or processed by Everything Street. We maintain PCI DSS compliance through Stripe's certified infrastructure.\n\nFraud screening: Stripe Radar analyses each transaction automatically for fraud indicators. Occasionally a legitimate order may be flagged. If your payment is declined and you believe it should not have been, contact us at hello@everythingstreet.ge and we will investigate promptly.\n\nChargebacks: If you have a problem with an order — wrong item, damaged goods, non-delivery — please contact us at hello@everythingstreet.ge before filing a chargeback with your card issuer. We are committed to resolving issues quickly. Filing a chargeback without first giving us the opportunity to resolve the matter may result in your account being suspended.",
  },
  {
    title: "8. Beauty & Cosmetic Products",
    content: "All beauty and cosmetic products sold by Everything Street are cosmetic products as defined by Georgian and EU cosmetics regulations. They are not medicines, medical devices, or therapeutic products, and no medical claims are made on our website.\n\nResults vary: Cosmetic results differ between individuals due to skin type, age, health status, and usage method. We do not guarantee specific outcomes.\n\nPatch test: We strongly recommend performing a patch test before using any new skincare or cosmetic product — particularly if you have sensitive skin or known allergies. Apply a small amount to the inside of your wrist and wait 24 hours before wider application.\n\nIngredients: Full ingredient lists are provided on product pages where available. Always verify ingredients before purchase if you have known allergies. Formulations may change between batches — the physical product label is the definitive reference.\n\nAllergens: Some products contain fragrance allergens, preservatives, or sensitisers as disclosed in the ingredient list. You are responsible for checking these before purchase.\n\nProduct authenticity and expiry: We source all products from authorised distributors. We do not sell products past their stated expiry date or Period After Opening (PAO) date.\n\nLiability: Everything Street is not liable for adverse reactions where the full ingredient list was clearly disclosed and you proceeded with purchase.",
  },
  {
    title: "9. Tech & Electronics",
    content: "Legal guarantee: Georgian consumer protection law provides a mandatory 2-year legal guarantee on goods sold to consumers. Within the first 6 months of purchase, any defect is presumed to have existed at the time of sale. This statutory guarantee cannot be excluded or reduced by contract and applies in addition to any manufacturer warranty.\n\nManufacturer warranty: Product pages state the manufacturer warranty period where known. Manufacturer warranty terms are set by the manufacturer, not by Everything Street.\n\nSoftware & digital content: Where a product includes software, a licence key, or downloadable digital content, once the software has been activated or the digital content downloaded, the right of return does not apply unless the product is defective. You receive a licence to use the software, not ownership of it.\n\nVoltage & compatibility: Georgia uses 220V / 50Hz electricity and Type C/F plugs. If you are purchasing from outside Georgia, verify that the product is compatible with your local voltage and socket standard before use. We are not liable for damage caused by voltage incompatibility.\n\nRegional locking: Some products (smartphones, gaming consoles, streaming devices) may be region-locked. Verify regional compatibility before purchase.\n\nLithium batteries: Products containing lithium-ion or lithium-metal batteries may be subject to shipping restrictions under IATA air freight regulations. We will notify you if a product in your order cannot be shipped by air to your destination.\n\nRadio-frequency devices: Bluetooth, Wi-Fi, and cellular devices sold in Georgia are approved for the Georgian market. If you purchase from outside Georgia, ensure the device meets radio-frequency certification requirements in your country.\n\nThird-party repair: Repairs carried out by non-authorised service providers may void the manufacturer warranty. This does not affect your statutory rights under Georgian consumer law.",
  },
  {
    title: "10. Intellectual Property",
    content: "All content on everythingstreet.ge — including text, images, logos, design, and software — is owned by Everything Street or its licensors and is protected under Georgian and international intellectual property law. You may not reproduce, distribute, modify, or create derivative works from any content on our website without our express written permission.",
  },
  {
    title: "11. Prohibited Uses",
    content: "When using our website, you must not:\n• Use the service for any unlawful purpose\n• Attempt to gain unauthorised access to any part of our systems\n• Transmit malicious code, viruses, or harmful software\n• Harvest or scrape data from our website by automated means\n• Submit fraudulent orders or use stolen payment credentials\n• Impersonate any person or entity\n• Engage in any activity that disrupts or damages our website or services",
  },
  {
    title: "12. Limitation of Liability",
    content: "To the maximum extent permitted by applicable Georgian law, Everything Street's total liability for any claim arising from these Terms or your use of our services shall not exceed the total amount paid by you for the specific order giving rise to the claim.\n\nWe shall not be liable for:\n• Indirect, special, incidental, or consequential losses\n• Loss of profit, revenue, or business opportunity\n• Loss or corruption of data\n\nThese limitations do not exclude or restrict:\n• Death or personal injury caused by our negligence\n• Fraud or fraudulent misrepresentation\n• Any liability that cannot be excluded by mandatory Georgian law\n• Your statutory consumer rights under Georgian consumer protection legislation",
  },
  {
    title: "13. Governing Law & Disputes",
    content: "These Terms are governed by the laws of Georgia (country). Any dispute arising from these Terms or your use of our services shall be subject to the jurisdiction of the courts of Tbilisi, Georgia.\n\nEU and EEA customers: Nothing in these Terms affects your rights under your local mandatory consumer protection laws. EU consumers may also access the European Commission's Online Dispute Resolution platform at ec.europa.eu/consumers/odr.\n\nUK customers: You retain rights under UK consumer protection law.",
  },
  {
    title: "14. Changes to These Terms",
    content: "We may update these Terms from time to time. Material changes will be communicated to registered customers by email at least 14 days before taking effect. Your continued use of our website after the effective date constitutes acceptance of the updated Terms.",
  },
  {
    title: "15. Contact",
    content: "For questions about these Terms:\n\nEmail: legal@everythingstreet.ge\nPhone: +995 500 09 06 14\nAddress: Everything Street, Shalva Nutsubidze St, Tbilisi, Georgia",
  },
];

export default function TermsPage() {
  return (
    <>
      <div className="k-page-hdr">
        <div className="wrap" style={{ textAlign: "center" }}>
          <p className="page-hd-eyebrow">Legal</p>
          <h1 className="page-hd-title">Terms & Conditions</h1>
          <p style={{ fontSize: 11, color: "var(--chalk3)", marginTop: 8, letterSpacing: "0.08em" }}>Last updated: August 10, 2026 · Effective: August 10, 2026</p>
        </div>
      </div>
      <div style={{ paddingTop: 48, paddingBottom: 96 }}>
        <div className="wrap" style={{ maxWidth: 760 }}>
          <p style={{ fontSize: 14, color: "var(--chalk2)", lineHeight: 1.8, marginBottom: 48, paddingBottom: 48, borderBottom: "1px solid var(--border)" }}>
            Please read these Terms carefully before using Everything Street or placing an order. They set out the rules for using our platform and your rights as a customer.
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
