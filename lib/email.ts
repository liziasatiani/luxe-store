import { Resend } from "resend";
import { formatPrice as fmt } from "@/lib/utils";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM ?? "Everything Street <hello@everythingstreet.ge>";
const ADMIN_EMAIL = process.env.EMAIL_ADMIN ?? "admin@everythingstreet.ge";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const WELCOME_COUPON = process.env.WELCOME_COUPON_CODE ?? "WELCOME15";
const WELCOME_DISCOUNT = process.env.WELCOME_COUPON_PCT ?? "15";

function isConfigured(): boolean {
  return !!process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== "[YOUR-RESEND-API-KEY]";
}

function baseTemplate(title: string, previewText: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#F9FAFB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;">${previewText}</div>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9FAFB;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <tr>
            <td style="background:#111827;border-radius:12px 12px 0 0;padding:28px 40px;text-align:center;">
              <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:0.06em;text-transform:uppercase;">Everything Street</p>
            </td>
          </tr>
          <tr>
            <td style="background:#ffffff;padding:40px;border-left:1px solid #E5E7EB;border-right:1px solid #E5E7EB;">
              ${body}
            </td>
          </tr>
          <tr>
            <td style="background:#F9FAFB;border:1px solid #E5E7EB;border-top:none;border-radius:0 0 12px 12px;padding:20px 40px;text-align:center;">
              <p style="margin:0 0 4px;font-size:12px;color:#9CA3AF;">Questions? Email us at <a href="mailto:hello@everythingstreet.ge" style="color:#6B7280;">hello@everythingstreet.ge</a></p>
              <p style="margin:0;font-size:12px;color:#D1D5DB;">© ${new Date().getFullYear()} Everything Street. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function btn(href: string, label: string): string {
  return `<div style="text-align:center;margin:28px 0 0;">
    <a href="${href}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:14px 36px;border-radius:8px;letter-spacing:0.04em;">${label}</a>
  </div>`;
}

interface OrderItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productImage?: string | null;
}

interface OrderEmailData {
  orderNumber: string;
  orderId: string;
  recipientName: string;
  recipientEmail: string;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  taxAmount: number;
  total: number;
  shippingName?: string | null;
  shippingLine1?: string | null;
  shippingCity?: string | null;
  shippingState?: string | null;
  shippingPostal?: string | null;
  shippingCountry?: string | null;
  couponCode?: string | null;
  isGuest?: boolean;
}

function formatPrice(amount: number): string {
  return fmt(amount);
}

function buildOrderEmail(data: OrderEmailData): string {
  const {
    orderNumber, orderId, recipientName, items,
    subtotal, discountAmount, shippingAmount, taxAmount, total,
    shippingName, shippingLine1, shippingCity, shippingState, shippingPostal, shippingCountry,
    couponCode, isGuest,
  } = data;

  const orderUrl = isGuest
    ? `${APP_URL}/checkout/success?orderId=${orderId}`
    : `${APP_URL}/account/orders/${orderId}`;

  const itemRows = items.map((item) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#374151;">
        ${item.productName}
      </td>
      <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#6B7280;text-align:center;">
        ×${item.quantity}
      </td>
      <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#111827;text-align:right;font-variant-numeric:tabular-nums;">
        ${formatPrice(item.totalPrice)}
      </td>
    </tr>`).join("");

  const shippingAddress = [shippingName, shippingLine1, `${shippingCity ?? ""} ${shippingState ?? ""} ${shippingPostal ?? ""}`.trim(), shippingCountry]
    .filter(Boolean)
    .join("<br>");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Order Confirmation – ${orderNumber}</title>
</head>
<body style="margin:0;padding:0;background:#F9FAFB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9FAFB;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <tr>
            <td style="background:#111827;border-radius:12px 12px 0 0;padding:32px 40px;text-align:center;">
              <p style="margin:0;font-size:26px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">
                Everything Street
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#ffffff;padding:40px;border-left:1px solid #E5E7EB;border-right:1px solid #E5E7EB;">

              <p style="margin:0 0 6px;font-size:13px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#9CA3AF;">Order Confirmed</p>
              <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#111827;letter-spacing:-0.5px;">
                Thank you, ${recipientName.split(" ")[0]}!
              </h1>
              <p style="margin:0 0 32px;font-size:15px;color:#6B7280;line-height:1.6;">
                We've received your order and will have it on its way soon.
              </p>
              <div style="background:#F3F4F6;border-radius:8px;padding:16px 20px;margin-bottom:32px;display:flex;justify-content:space-between;">
                <span style="font-size:13px;color:#6B7280;">Order number</span>
                <span style="font-size:13px;font-weight:700;color:#111827;font-family:monospace;">${orderNumber}</span>
              </div>
              <h2 style="margin:0 0 16px;font-size:14px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#6B7280;">Items ordered</h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <thead>
                  <tr>
                    <th style="font-size:12px;font-weight:600;color:#9CA3AF;text-align:left;padding-bottom:8px;border-bottom:1px solid #E5E7EB;">Product</th>
                    <th style="font-size:12px;font-weight:600;color:#9CA3AF;text-align:center;padding-bottom:8px;border-bottom:1px solid #E5E7EB;">Qty</th>
                    <th style="font-size:12px;font-weight:600;color:#9CA3AF;text-align:right;padding-bottom:8px;border-bottom:1px solid #E5E7EB;">Price</th>
                  </tr>
                </thead>
                <tbody>${itemRows}</tbody>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td style="font-size:14px;color:#6B7280;padding:4px 0;">Subtotal</td>
                  <td style="font-size:14px;color:#111827;text-align:right;padding:4px 0;font-variant-numeric:tabular-nums;">${formatPrice(subtotal)}</td>
                </tr>
                ${discountAmount > 0 ? `
                <tr>
                  <td style="font-size:14px;color:#059669;padding:4px 0;">Discount${couponCode ? ` (${couponCode})` : ""}</td>
                  <td style="font-size:14px;color:#059669;text-align:right;padding:4px 0;font-variant-numeric:tabular-nums;">−${formatPrice(discountAmount)}</td>
                </tr>` : ""}
                <tr>
                  <td style="font-size:14px;color:#6B7280;padding:4px 0;">Shipping</td>
                  <td style="font-size:14px;color:#111827;text-align:right;padding:4px 0;">${shippingAmount === 0 ? "FREE" : formatPrice(shippingAmount)}</td>
                </tr>
                <tr>
                  <td style="font-size:14px;color:#6B7280;padding:4px 0;">Tax</td>
                  <td style="font-size:14px;color:#111827;text-align:right;padding:4px 0;font-variant-numeric:tabular-nums;">${formatPrice(taxAmount)}</td>
                </tr>
                <tr>
                  <td style="font-size:16px;font-weight:700;color:#111827;padding:12px 0 4px;border-top:2px solid #E5E7EB;">Total</td>
                  <td style="font-size:16px;font-weight:700;color:#111827;text-align:right;padding:12px 0 4px;border-top:2px solid #E5E7EB;font-variant-numeric:tabular-nums;">${formatPrice(total)}</td>
                </tr>
              </table>

              ${shippingAddress ? `
              <h2 style="margin:0 0 12px;font-size:14px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#6B7280;">Shipping to</h2>
              <p style="margin:0 0 32px;font-size:14px;color:#374151;line-height:1.7;">${shippingAddress}</p>
              ` : ""}
              <div style="text-align:center;margin-top:8px;">
                <a href="${orderUrl}"
                  style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:14px 32px;border-radius:8px;letter-spacing:0.02em;">
                  View Order
                </a>
              </div>

            </td>
          </tr>
          <tr>
            <td style="background:#F9FAFB;border:1px solid #E5E7EB;border-top:none;border-radius:0 0 12px 12px;padding:24px 40px;text-align:center;">
              <p style="margin:0 0 4px;font-size:12px;color:#9CA3AF;">Questions? Reply to this email or visit <a href="${APP_URL}/contact" style="color:#6B7280;">our contact page</a>.</p>
              <p style="margin:0;font-size:12px;color:#D1D5DB;">© ${new Date().getFullYear()} Everything Street. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendOrderConfirmation(data: OrderEmailData): Promise<void> {
  if (!isConfigured()) return;

  const { error } = await resend.emails.send({
    from: FROM,
    to: data.recipientEmail,
    subject: `Order confirmed – ${data.orderNumber}`,
    html: buildOrderEmail(data),
  });

  if (error) {
    console.error(`[email] Failed to send order confirmation for ${data.orderNumber}:`, error);
  }
}


interface AbandonedCartEmailData {
  email: string;
  name: string;
  items: Array<{ name: string; price: number; quantity: number; image?: string }>;
}

function buildAbandonedCartEmail({ name, items }: AbandonedCartEmailData): string {
  // TODO: add back when we have reviews API — show rating stars per item
  const itemRows = items
    .slice(0, 5)
    .map(
      (item) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#374151;">
        ${item.name}${item.quantity > 1 ? ` ×${item.quantity}` : ""}
      </td>
      <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#111827;text-align:right;font-variant-numeric:tabular-nums;">
        ${formatPrice(item.price * item.quantity)}
      </td>
    </tr>`
    )
    .join("");

  const cartUrl = `${APP_URL}/cart`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>You left something behind</title>
</head>
<body style="margin:0;padding:0;background:#F9FAFB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9FAFB;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <tr>
            <td style="background:#111827;border-radius:12px 12px 0 0;padding:32px 40px;text-align:center;">
              <p style="margin:0;font-size:26px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">
                Everything Street<span style="color:#D4A84B;">.</span>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#ffffff;padding:40px;border-left:1px solid #E5E7EB;border-right:1px solid #E5E7EB;">
              <p style="margin:0 0 6px;font-size:13px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#9CA3AF;">You left something behind</p>
              <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#111827;letter-spacing:-0.5px;">
                Still thinking it over, ${name.split(" ")[0]}?
              </h1>
              <p style="margin:0 0 32px;font-size:15px;color:#6B7280;line-height:1.6;">
                Your cart is saved and waiting for you. These items are still available, but they won't be forever.
              </p>
              <h2 style="margin:0 0 16px;font-size:14px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#6B7280;">Items in your cart</h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tbody>${itemRows}</tbody>
              </table>
              <div style="text-align:center;margin-top:8px;">
                <a href="${cartUrl}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:14px 40px;border-radius:8px;letter-spacing:0.02em;">
                  Return to Cart
                </a>
              </div>
              <p style="margin:28px 0 0;font-size:13px;color:#9CA3AF;text-align:center;line-height:1.6;">
                Free shipping on orders over $75 · 30-day free returns · 100% authentic
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#F9FAFB;border:1px solid #E5E7EB;border-top:none;border-radius:0 0 12px 12px;padding:24px 40px;text-align:center;">
              <p style="margin:0 0 4px;font-size:12px;color:#9CA3AF;">
                You received this because you started a checkout at <a href="${APP_URL}" style="color:#6B7280;">everythingstreet.ge</a>.
                If you'd rather not receive these emails, <a href="mailto:hello@everythingstreet.ge?subject=Unsubscribe" style="color:#6B7280;">unsubscribe here</a>.
              </p>
              <p style="margin:0;font-size:12px;color:#D1D5DB;">© ${new Date().getFullYear()} Everything Street. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendAbandonedCartEmail(data: AbandonedCartEmailData): Promise<void> {
  if (!isConfigured()) return;
  const { error } = await resend.emails.send({
    from: FROM,
    to: data.email,
    subject: "You left something behind — your cart is waiting",
    html: buildAbandonedCartEmail(data),
  });
  if (error) console.error(`[email] abandoned cart to ${data.email}:`, error);
}


export async function sendShippingNotification(data: {
  recipientName: string;
  recipientEmail: string;
  orderNumber: string;
  orderId: string;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
}): Promise<void> {
  if (!isConfigured()) return;
  const { recipientName, recipientEmail, orderNumber, orderId, trackingNumber, trackingUrl } = data;
  const orderUrl = `${APP_URL}/account/orders/${orderId}`;
  const html = baseTemplate(
    `Your order ${orderNumber} is on its way`,
    `Good news — your order has been shipped!`,
    `<p style="margin:0 0 6px;font-size:13px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#9CA3AF;">On its way</p>
    <h1 style="margin:0 0 12px;font-size:24px;font-weight:700;color:#111827;">Your order has shipped, ${recipientName.split(" ")[0]}!</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#6B7280;line-height:1.6;">Great news — your order <strong style="color:#111827;">${orderNumber}</strong> is on its way to you.</p>
    ${trackingNumber ? `<div style="background:#F3F4F6;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0 0 4px;font-size:12px;color:#9CA3AF;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">Tracking number</p>
      <p style="margin:0;font-size:16px;font-weight:700;color:#111827;font-family:monospace;">${trackingNumber}</p>
      ${trackingUrl ? `<a href="${trackingUrl}" style="font-size:13px;color:#6B7280;text-decoration:underline;">Track your package →</a>` : ""}
    </div>` : ""}
    ${btn(orderUrl, "View Order")}`
  );
  const { error } = await resend.emails.send({
    from: FROM, to: recipientEmail,
    subject: `Your order ${orderNumber} has shipped 📦`,
    html,
  });
  if (error) console.error(`[email] shipping notification to ${recipientEmail}:`, error);
}

export async function sendOrderStatusEmail(data: {
  recipientName: string;
  recipientEmail: string;
  orderNumber: string;
  orderId: string;
  status: "CONFIRMED" | "DELIVERED" | "CANCELLED";
}): Promise<void> {
  if (!isConfigured()) return;
  const { recipientName, recipientEmail, orderNumber, orderId, status } = data;
  const orderUrl = `${APP_URL}/account/orders/${orderId}`;
  const firstName = recipientName.split(" ")[0];
  const configs = {
    CONFIRMED: {
      subject: `Your order ${orderNumber} is confirmed ✅`,
      eyebrow: "Order Confirmed",
      heading: `Your order is confirmed, ${firstName}!`,
      body: `We've received your order <strong style="color:#111827;">${orderNumber}</strong> and it's being prepared. You'll receive another email when it ships.`,
    },
    DELIVERED: {
      subject: `Your order ${orderNumber} has been delivered 🎉`,
      eyebrow: "Delivered",
      heading: `Your order has arrived, ${firstName}!`,
      body: `Your order <strong style="color:#111827;">${orderNumber}</strong> has been marked as delivered. We hope you love your purchase!`,
    },
    CANCELLED: {
      subject: `Your order ${orderNumber} has been cancelled`,
      eyebrow: "Order Cancelled",
      heading: `Your order has been cancelled`,
      body: `Your order <strong style="color:#111827;">${orderNumber}</strong> has been cancelled. If you have questions or didn't request this, please contact us at <a href="mailto:hello@everythingstreet.ge" style="color:#6B7280;">hello@everythingstreet.ge</a>.`,
    },
  };
  const { subject, eyebrow, heading, body } = configs[status];
  const html = baseTemplate(
    heading,
    subject,
    `<p style="margin:0 0 6px;font-size:13px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#9CA3AF;">${eyebrow}</p>
    <h1 style="margin:0 0 12px;font-size:24px;font-weight:700;color:#111827;">${heading}</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#6B7280;line-height:1.6;">${body}</p>
    ${btn(orderUrl, "View Order")}`
  );
  const { error } = await resend.emails.send({ from: FROM, to: recipientEmail, subject, html });
  if (error) console.error(`[email] order status email (${status}) to ${recipientEmail}:`, error);
}

export async function sendWelcomeEmail(data: {
  name: string;
  email: string;
}): Promise<void> {
  if (!isConfigured()) return;
  const html = baseTemplate(
    "Welcome to Everything Street",
    "Your account is ready — start exploring.",
    `<h1 style="margin:0 0 12px;font-size:24px;font-weight:700;color:#111827;">Welcome, ${data.name.split(" ")[0]}!</h1>
    <p style="margin:0 0 20px;font-size:15px;color:#6B7280;line-height:1.6;">Your Everything Street account is all set. Browse our selection of tech and beauty products — all hand-picked and verified by our team.</p>
    <p style="margin:0 0 8px;font-size:14px;color:#374151;">As a new member, use code <strong style="background:#F3F4F6;padding:2px 8px;border-radius:4px;font-family:monospace;">${WELCOME_COUPON}</strong> for ${WELCOME_DISCOUNT}% off your first order.</p>
    ${btn(`${APP_URL}`, "Start Shopping")}`
  );
  const { error } = await resend.emails.send({
    from: FROM, to: data.email,
    subject: "Welcome to Everything Street",
    html,
  });
  if (error) console.error(`[email] welcome to ${data.email}:`, error);
}


export async function sendPasswordResetEmail(data: {
  name: string;
  email: string;
  resetUrl: string;
}): Promise<void> {
  if (!isConfigured()) return;
  const html = baseTemplate(
    "Reset your password",
    "We received a request to reset your password.",
    `<h1 style="margin:0 0 12px;font-size:24px;font-weight:700;color:#111827;">Reset your password</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#6B7280;line-height:1.6;">Hi ${data.name.split(" ")[0]}, we received a request to reset your password. Click the button below — this link expires in 1 hour.</p>
    ${btn(data.resetUrl, "Reset Password")}
    <p style="margin:24px 0 0;font-size:13px;color:#9CA3AF;text-align:center;">If you didn't request this, you can safely ignore this email.</p>`
  );
  const { error } = await resend.emails.send({
    from: FROM, to: data.email,
    subject: "Reset your Everything Street password",
    html,
  });
  if (error) console.error(`[email] password reset to ${data.email}:`, error);
}


export async function sendNewsletterConfirmation(email: string): Promise<void> {
  if (!isConfigured()) return;
  const html = baseTemplate(
    "You're subscribed",
    "Welcome to the Everything Street inner circle.",
    `<h1 style="margin:0 0 12px;font-size:24px;font-weight:700;color:#111827;">You're in.</h1>
    <p style="margin:0 0 20px;font-size:15px;color:#6B7280;line-height:1.6;">Thanks for subscribing. You'll be the first to know about new arrivals, exclusive offers, and beauty secrets — dropping five days a week.</p>
    <p style="margin:0 0 8px;font-size:14px;color:#374151;">Use code <strong style="background:#F3F4F6;padding:2px 8px;border-radius:4px;font-family:monospace;">${WELCOME_COUPON}</strong> for ${WELCOME_DISCOUNT}% off your first order.</p>
    ${btn(`${APP_URL}`, "Explore the Store")}
    <p style="margin:24px 0 0;font-size:12px;color:#9CA3AF;text-align:center;">You're receiving this because you subscribed at everythingstreet.ge. <a href="mailto:hello@everythingstreet.ge?subject=Unsubscribe" style="color:#9CA3AF;">Unsubscribe</a>.</p>`
  );
  const { error } = await resend.emails.send({
    from: FROM, to: email,
    subject: "You're subscribed to Everything Street",
    html,
  });
  if (error) console.error(`[email] newsletter confirmation to ${email}:`, error);
}


export async function sendContactAutoReply(data: {
  name: string;
  email: string;
  subject?: string;
}): Promise<void> {
  if (!isConfigured()) return;
  const html = baseTemplate(
    "We received your message",
    "We'll get back to you within 24 hours.",
    `<h1 style="margin:0 0 12px;font-size:24px;font-weight:700;color:#111827;">Got your message, ${data.name.split(" ")[0]}.</h1>
    <p style="margin:0 0 20px;font-size:15px;color:#6B7280;line-height:1.6;">Thanks for reaching out${data.subject ? ` about <em>${data.subject}</em>` : ""}. Our team will get back to you within 24 hours.</p>
    <p style="margin:0;font-size:14px;color:#6B7280;">In the meantime, check our <a href="${APP_URL}/faq" style="color:#111827;">FAQ</a> — your question might already be answered there.</p>`
  );
  await Promise.all([
    resend.emails.send({ from: FROM, to: data.email, subject: "We received your message — Everything Street", html }),
    resend.emails.send({
      from: FROM, to: ADMIN_EMAIL,
      subject: `New contact form submission from ${data.name}`,
      html: baseTemplate("New contact message", "", `<p style="font-size:15px;color:#374151;"><strong>${data.name}</strong> (${data.email}) sent a message${data.subject ? `: <em>${data.subject}</em>` : ""}.</p><p style="font-size:14px;color:#6B7280;">Reply directly to <a href="mailto:${data.email}">${data.email}</a>.</p>`),
    }),
  ]);
}


export async function sendAdminNewOrderAlert(data: {
  orderNumber: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  total: number;
  itemCount: number;
}): Promise<void> {
  if (!isConfigured()) return;
  const orderUrl = `${APP_URL}/admin/orders`;
  const html = baseTemplate(
    `New order ${data.orderNumber}`,
    `${data.customerName} just placed an order for $${data.total.toFixed(2)}`,
    `<h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#111827;">New order received 🛍️</h1>
    <div style="background:#F3F4F6;border-radius:8px;padding:16px 20px;margin-bottom:20px;">
      <p style="margin:0 0 6px;font-size:13px;color:#6B7280;">Order <strong style="color:#111827;font-family:monospace;">${data.orderNumber}</strong></p>
      <p style="margin:0 0 6px;font-size:14px;color:#374151;"><strong>${data.customerName}</strong> — ${data.customerEmail}</p>
      <p style="margin:0;font-size:16px;font-weight:700;color:#111827;">$${data.total.toFixed(2)} · ${data.itemCount} item${data.itemCount !== 1 ? "s" : ""}</p>
    </div>
    ${btn(orderUrl, "View in Admin")}`
  );
  const { error } = await resend.emails.send({
    from: FROM, to: ADMIN_EMAIL,
    subject: `New order: ${data.orderNumber}`,
    html,
  });
  if (error) console.error(`[email] admin order alert:`, error);
}
