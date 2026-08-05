import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";
import { rateLimit, getIP, rateLimitResponse } from "@/lib/rateLimit";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const rl = await rateLimit(`register:${getIP(req)}`, 5, 15 * 60 * 1000);
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { name, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ success: false, error: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    let user;
    try {
      user = await prisma.user.create({
        // `emailVerified` is set eagerly because there is no verification flow
        // yet; revisit when one is added.
        data: { name, email, passwordHash, emailVerified: new Date() },
        select: { id: true, name: true, email: true },
      });
    } catch (err) {
      // Two concurrent registrations can both pass the check above.
      if (
        typeof err === "object" && err !== null &&
        (err as { code?: string }).code === "P2002"
      ) {
        return NextResponse.json({ success: false, error: "Email already registered" }, { status: 409 });
      }
      throw err;
    }

    sendWelcomeEmail({ name: user.name ?? "there", email: user.email }).catch(() => {});

    return NextResponse.json({ success: true, data: { user }, message: "Account created!" }, { status: 201 });
  } catch (err) {
    console.error("[auth/register]", err);
    return NextResponse.json({ success: false, error: "Failed to create account" }, { status: 500 });
  }
}
