import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { newsletterSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = newsletterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid email address" }, { status: 400 });
    }

    await prisma.newsletterSubscriber.upsert({
      where: { email: parsed.data.email },
      update: { isActive: true, unsubscribedAt: null },
      create: { email: parsed.data.email, source: "website" },
    });

    return NextResponse.json({ success: true, message: "Subscribed successfully!" });
  } catch (err) {
    console.error("[newsletter/POST]", err);
    return NextResponse.json({ success: false, error: "Failed to subscribe" }, { status: 500 });
  }
}
