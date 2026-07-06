import { NextRequest, NextResponse } from "next/server";
import { contactSchema } from "@/lib/validations";
import { rateLimit, getIP, rateLimitResponse } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const rl = await rateLimit(`contact:${getIP(req)}`, 5, 60 * 1000);
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

  try {
    const body = await req.json();
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { name, email, subject, message } = parsed.data;

    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== "[YOUR-RESEND-API-KEY]") {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.EMAIL_FROM ?? "Everything Street <noreply@everythingstreet.com>",
        to: process.env.CONTACT_EMAIL ?? "hello@everythingstreet.com",
        replyTo: email,
        subject: `[Contact] ${subject}`,
        text: `From: ${name} <${email}>\n\n${message}`,
      });
    }

    return NextResponse.json({ success: true, message: "Message sent! We'll reply within 24 hours." });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to send message" }, { status: 500 });
  }
}
