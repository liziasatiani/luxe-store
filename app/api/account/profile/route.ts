import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { profileSchema } from "@/lib/validations";

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const parsed = profileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    // Only whitelisted fields are written; email and role are never client-settable.
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { name: parsed.data.name, phone: parsed.data.phone ?? null },
      select: { id: true, name: true, email: true, phone: true },
    });

    return NextResponse.json({ success: true, data: { user } });
  } catch (err) {
    console.error("[account/profile/PUT]", err);
    return NextResponse.json({ success: false, error: "Failed to update profile" }, { status: 500 });
  }
}
