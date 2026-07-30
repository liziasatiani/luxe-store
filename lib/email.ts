import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM ?? "Luxe Store <noreply@luxestore.com>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

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
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
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

          <!-- Header -->
          <tr>
            <td style="background:#111827;border-radius:12px 12px 0 0;padding:32px 40px;text-align:center;">
              <p style="margin:0;font-size:26px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">
                Luxe<span style="color:#D4A84B;">.</span>
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:40px;border-left:1px solid #E5E7EB;border-right:1px solid #E5E7EB;">

              <p style="margin:0 0 6px;font-size:13px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#9CA3AF;">Order Confirmed</p>
              <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#111827;letter-spacing:-0.5px;">
                Thank you, ${recipientName.split(" ")[0]}!
              </h1>
              <p style="margin:0 0 32px;font-size:15px;color:#6B7280;line-height:1.6;">
                We've received your order and will have it on its way soon.
              </p>

              <!-- Order number pill -->
              <div style="background:#F3F4F6;border-radius:8px;padding:16px 20px;margin-bottom:32px;display:flex;justify-content:space-between;">
                <span style="font-size:13px;color:#6B7280;">Order number</span>
                <span style="font-size:13px;font-weight:700;color:#111827;font-family:monospace;">${orderNumber}</span>
              </div>

              <!-- Items -->
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

              <!-- Totals -->
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
              <!-- Shipping address -->
              <h2 style="margin:0 0 12px;font-size:14px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#6B7280;">Shipping to</h2>
              <p style="margin:0 0 32px;font-size:14px;color:#374151;line-height:1.7;">${shippingAddress}</p>
              ` : ""}

              <!-- CTA -->
              <div style="text-align:center;margin-top:8px;">
                <a href="${orderUrl}"
                  style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:14px 32px;border-radius:8px;letter-spacing:0.02em;">
                  View Order
                </a>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F9FAFB;border:1px solid #E5E7EB;border-top:none;border-radius:0 0 12px 12px;padding:24px 40px;text-align:center;">
              <p style="margin:0 0 4px;font-size:12px;color:#9CA3AF;">Questions? Reply to this email or visit <a href="${APP_URL}/contact" style="color:#6B7280;">our contact page</a>.</p>
              <p style="margin:0;font-size:12px;color:#D1D5DB;">© ${new Date().getFullYear()} Luxe Store. All rights reserved.</p>
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
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "[YOUR-RESEND-API-KEY]") {
    console.log(`[email] RESEND_API_KEY not configured — skipping order confirmation for ${data.orderNumber}`);
    return;
  }

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
