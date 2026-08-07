import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    // Fetch user details before deletion to snapshot onto orders
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, phone: true },
    });

    // Anonymize orders — preserve name/email/phone so admin can still identify them
    await prisma.order.updateMany({
      where: { userId },
      data: {
        userId: null,
        guestName: user?.name ?? undefined,
        guestEmail: user?.email ?? undefined,
        guestPhone: user?.phone ?? undefined,
      },
    });

    await prisma.user.delete({ where: { id: userId } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[account/delete]", err);
    return NextResponse.json({ success: false, error: "Failed to delete account" }, { status: 500 });
  }
}
