import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    const { name, phone } = await req.json();
    const user = await prisma.user.update({ where: { id: session.user.id }, data: { name, phone } });
    return NextResponse.json({ success: true, data: { user: { id: user.id, name: user.name, email: user.email } } });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to update profile" }, { status: 500 });
  }
}
