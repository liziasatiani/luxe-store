import { Container } from "@/components/ui";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Returns & Refunds" });

export default function ReturnsPage() {
  return (
    <>
      <div className="bg-surface-50 dark:bg-surface-900/50 border-b border-surface-100 dark:border-surface-800 py-14">
        <Container className="text-center">
          <h1 className="font-display text-5xl text-surface-900 dark:text-white mb-3">Returns & Refunds</h1>
          <p className="text-surface-500">30-day hassle-free returns.</p>
        </Container>
      </div>
      <Container className="py-16 max-w-3xl space-y-10">
        {[
          { title: "Return Policy Overview", content: "We want you to be completely satisfied with your purchase. If for any reason you are not happy, you may return eligible items within 30 days of the delivery date for a full refund or exchange." },
          { title: "Eligible Items for Return", content: "To be eligible for a return, your item must be:\n• Unused and in the same condition as received\n• In its original packaging with all tags attached\n• Accompanied by the original receipt or proof of purchase\n• For beauty products: unopened and sealed with security seal intact" },
          { title: "Non-Returnable Items", content: "The following items cannot be returned:\n• Opened or used beauty products (for hygiene and safety reasons)\n• Personalized or customized items\n• Digital downloads\n• Sale items marked as Final Sale\n• Gift cards" },
          { title: "How to Return an Item", content: "1. Log in to your account and go to 'My Orders'\n2. Select the order containing the item you wish to return\n3. Click 'Request Return' and select your reason\n4. Print the prepaid return shipping label (for eligible returns)\n5. Pack your item securely and drop it off at the courier\n\nAlternatively, email us at returns@luxestore.com with your order number." },
          { title: "Refund Processing", content: "Once we receive and inspect your returned item, we will notify you via email. Approved refunds are processed within 3–5 business days and appear on your original payment method within 5–10 business days depending on your bank." },
          { title: "Exchanges", content: "We currently do not offer direct exchanges. To exchange an item, please return the original item for a refund and place a new order for the item you want." },
          { title: "Damaged or Defective Items", content: "If you received a damaged or defective item, please contact us within 7 days of delivery with photos of the damage. We will arrange a free replacement or full refund at no additional cost to you." },
        ].map(s => (
          <div key={s.title}>
            <h2 className="font-display text-2xl text-surface-900 dark:text-white mb-3">{s.title}</h2>
            <p className="text-surface-600 dark:text-surface-400 text-sm leading-relaxed whitespace-pre-line">{s.content}</p>
          </div>
        ))}

        <div className="p-6 rounded-2xl bg-brand-50 dark:bg-brand-900/10 border border-brand-100 dark:border-brand-800">
          <p className="font-semibold text-brand-800 dark:text-brand-300 mb-1">Need help with a return?</p>
          <p className="text-sm text-brand-700 dark:text-brand-400">Contact us at <a href="mailto:returns@luxestore.com" className="underline">returns@luxestore.com</a> or call +1 (555) 000-0000 (Mon–Sat, 9AM–6PM EST).</p>
        </div>
      </Container>
    </>
  );
}
