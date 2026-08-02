import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { resetPasswordSchema } from "@/lib/validations";
import { rateLimit, getIP, rateLimitResponse } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const rl = await rateLimit(`reset-password:${getIP(req)}`, 5, 15 * 60 * 1000);
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

  try {
    const body = await req.json();
    const { token, ...rest } = body as { token?: string; password?: string; confirmPassword?: string };

    if (!token || typeof token !== "string") {
      return NextResponse.json({ success: false, error: "Invalid or missing token" }, { status: 400 });
    }

    const parsed = resetPasswordSchema.safeParse(rest);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    const record = await prisma.passwordResetToken.findUnique({ where: { token } });

    if (!record || record.expires < new Date()) {
      return NextResponse.json({ success: false, error: "Reset link is invalid or has expired" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);

    await prisma.$transaction([
      prisma.user.update({ where: { email: record.email }, data: { passwordHash } }),
      prisma.passwordResetToken.delete({ where: { token } }),
    ]);

    return NextResponse.json({ success: true, message: "Password updated. You can now log in." });
  } catch (err) {
    console.error("[reset-password]", err);
    return NextResponse.json({ success: false, error: "Failed to reset password" }, { status: 500 });
  }
}
