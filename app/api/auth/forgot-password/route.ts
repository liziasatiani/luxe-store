import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validations";
import { rateLimit, getIP, rateLimitResponse } from "@/lib/rateLimit";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const rl = await rateLimit(`forgot-password:${getIP(req)}`, 3, 15 * 60 * 1000);
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

  try {
    const body = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid email address" }, { status: 400 });
    }

    const { email } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success — never reveal whether the email exists
    if (!user || !user.passwordHash) {
      return NextResponse.json({ success: true });
    }

    // Invalidate any existing tokens for this email then create a fresh one
    await prisma.passwordResetToken.deleteMany({ where: { email } });

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await prisma.passwordResetToken.create({ data: { email, token, expires } });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/reset-password?token=${token}`;

    if (process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.startsWith("[")) {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      const from = process.env.EMAIL_FROM ?? "Everything Street <noreply@everythingstreet.com>";
      await resend.emails.send({
        from,
        to: email,
        subject: "Reset your Everything Street password",
        html: `<p>Hi ${user.name ?? "there"},</p>
<p>Click the link below to reset your password. This link expires in 1 hour.</p>
<p><a href="${resetUrl}">${resetUrl}</a></p>
<p>If you didn't request this, you can safely ignore this email.</p>`,
      });
    } else {
      console.log(`[forgot-password] Reset URL for ${email}: ${resetUrl}`);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[forgot-password]", err);
    return NextResponse.json({ success: false, error: "Failed to process request" }, { status: 500 });
  }
}
