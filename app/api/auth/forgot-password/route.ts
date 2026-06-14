import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validations";
import { rateLimit, getIP, rateLimitResponse } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const rl = await rateLimit(`forgot-password:${getIP(req)}`, 3, 15 * 60 * 1000);
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

  try {
    const body = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid email address" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ success: true });
    }

    // TODO: Generate a reset token, store it on the user record, and send via Resend.
    // This requires adding a passwordResetToken + passwordResetExpiry field to the User model.
    // For now we acknowledge the request without leaking whether the account exists.

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to process request" }, { status: 500 });
  }
}
