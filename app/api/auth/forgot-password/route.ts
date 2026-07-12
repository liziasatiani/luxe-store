import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validations";
import { rateLimit, getIP, rateLimitResponse } from "@/lib/rateLimit";
import { sendPasswordResetEmail } from "@/lib/email";
import crypto from "node:crypto";

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

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await prisma.passwordResetToken.create({ data: { email, token: hashedToken, expires } });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/reset-password?token=${rawToken}`;

    await sendPasswordResetEmail({
      name: user.name ?? "there",
      email,
      resetUrl,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[forgot-password]", err);
    return NextResponse.json({ success: false, error: "Failed to process request" }, { status: 500 });
  }
}
