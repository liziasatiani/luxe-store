import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { contactSchema } from "@/lib/validations";
import { rateLimit, getIP, rateLimitResponse } from "@/lib/rateLimit";
import { sendContactAutoReply } from "@/lib/email";

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

    await prisma.contactMessage.create({ data: { name, email, subject, message } });

    sendContactAutoReply({ name, email, subject }).catch(() => {});

    return NextResponse.json({ success: true, message: "Message sent! We'll reply within 24 hours." });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to send message" }, { status: 500 });
  }
}
