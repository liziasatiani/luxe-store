import { NextRequest, NextResponse } from "next/server";
import { contactSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    // In production: send email via Resend or similar
    // const { name, email, subject, message } = parsed.data;
    // await resend.emails.send({ from: process.env.EMAIL_FROM, to: "hello@luxestore.com", ... });

    console.log("[contact]", parsed.data);

    return NextResponse.json({ success: true, message: "Message sent! We'll reply within 24 hours." });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Failed to send message" }, { status: 500 });
  }
}
