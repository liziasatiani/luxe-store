import Stripe from "stripe";

export const STRIPE_ENABLED =
  process.env.NEXT_PUBLIC_STRIPE_ENABLED === "true";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!STRIPE_ENABLED) throw new Error("Stripe is disabled.");
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2024-06-20",
      appInfo: { name: "Luxe Store", version: "1.0.0" },
    });
  }
  return _stripe;
}

export async function createCheckoutSession(opts: {
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[];
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
}): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();
  return stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: opts.lineItems,
    mode: "payment",
    success_url: opts.successUrl,
    cancel_url: opts.cancelUrl,
    customer_email: opts.customerEmail,
    metadata: opts.metadata,
    shipping_address_collection: { allowed_countries: ["US", "CA", "GB", "AU", "AE"] },
    billing_address_collection: "required",
  });
}

export async function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Promise<Stripe.Event> {
  const stripe = getStripe();
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
}
