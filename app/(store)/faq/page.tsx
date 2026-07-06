"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/components/ui";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    category: "Orders & Shipping",
    items: [
      { q: "How long does shipping take?", a: "Standard shipping takes 3–5 business days within the US. Express shipping (1–2 business days) is available at checkout. International orders typically take 7–14 business days." },
      { q: "Do you offer free shipping?", a: "Yes! All orders over $75 qualify for free standard shipping within the US. Orders below $75 have a flat $9.99 shipping fee." },
      { q: "Can I track my order?", a: "Absolutely. Once your order ships, you'll receive an email with a tracking number. You can also track your order in your account under 'My Orders'." },
      { q: "Do you ship internationally?", a: "Yes, we ship to over 50 countries worldwide. Shipping costs and delivery times vary by destination. Duties and taxes may apply." },
    ],
  },
  {
    category: "Products & Authenticity",
    items: [
      { q: "Are all products authentic?", a: "100% yes. Every product at Luxe Store is sourced directly from authorized brand distributors. We have strict verification processes and zero-tolerance for counterfeits." },
      { q: "Where do you source your products?", a: "We partner directly with official brand distributors and authorized retailers in the US, Europe, and Asia. Every brand on our platform has been vetted and approved." },
      { q: "What if I receive a damaged product?", a: "Contact us within 7 days of delivery and we'll arrange a full replacement or refund immediately. We'll also cover return shipping costs for damaged items." },
    ],
  },
  {
    category: "Returns & Refunds",
    items: [
      { q: "What is your return policy?", a: "We offer 30-day hassle-free returns on all products. Items must be unused, in original packaging, with all tags attached. Beauty products must be unopened and sealed." },
      { q: "How long does a refund take?", a: "Once we receive your returned item, refunds are processed within 3–5 business days and appear on your original payment method within 5–10 business days." },
      { q: "Are there any items that cannot be returned?", a: "Opened beauty products (for hygiene reasons), personalized items, and digital downloads cannot be returned unless defective." },
    ],
  },
  {
    category: "Payment & Security",
    items: [
      { q: "What payment methods do you accept?", a: "We accept all major credit and debit cards (Visa, Mastercard, American Express), and Cash on Delivery in select regions." },
      { q: "Is my payment information secure?", a: "Yes. All payments are processed through Stripe, a PCI-DSS Level 1 certified payment processor. We never store your card information on our servers." },
      { q: "Do you offer gift cards?", a: "Gift cards are coming soon! Sign up for our newsletter to be notified when they launch." },
    ],
  },
  {
    category: "Account & Coupons",
    items: [
      { q: "How do I use a coupon code?", a: "Enter your coupon code in the 'Coupon' field on the cart page or during checkout. Valid codes will automatically apply the discount to your order total." },
      { q: "Can I combine multiple coupon codes?", a: "Only one coupon code can be applied per order. However, coupons can be combined with sale prices." },
      { q: "How do I change my password?", a: "Go to Account → Profile and use the 'Change Password' option. You can also use 'Forgot Password' on the login page to reset via email." },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-surface-100 dark:border-surface-800 last:border-0">
      <button onClick={() => setOpen(o => !o)} className="flex items-center justify-between w-full py-4 text-left gap-4">
        <span className="font-medium text-surface-900 dark:text-white text-sm">{q}</span>
        <ChevronDown size={16} className={cn("text-surface-400 shrink-0 transition-transform duration-200", open && "rotate-180")} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-sm text-surface-600 dark:text-surface-400 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQPage() {
  return (
    <>
      <div className="bg-surface-50 dark:bg-surface-900/50 border-b border-surface-100 dark:border-surface-800 py-14">
        <Container className="text-center">
          <h1 className="font-display text-5xl text-surface-900 dark:text-white mb-3">Frequently Asked Questions</h1>
          <p className="text-surface-500 max-w-md mx-auto">Everything you need to know about Luxe Store.</p>
        </Container>
      </div>

      <Container className="py-16 max-w-3xl">
        <div className="space-y-10">
          {FAQS.map(section => (
            <div key={section.category}>
              <h2 className="font-display text-2xl text-surface-900 dark:text-white mb-4">{section.category}</h2>
              <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 px-6">
                {section.items.map(item => <FAQItem key={item.q} {...item} />)}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center p-8 rounded-2xl bg-surface-50 dark:bg-surface-900/50 border border-surface-100 dark:border-surface-800">
          <p className="font-semibold text-surface-900 dark:text-white mb-2">Still have questions?</p>
          <p className="text-surface-500 text-sm mb-4">Our support team is available Monday–Saturday, 9AM–6PM EST.</p>
          <a href="/contact" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors">
            Contact Support
          </a>
        </div>
      </Container>
    </>
  );
}
