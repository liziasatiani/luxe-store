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

    // Anonymize orders rather than deleting them (preserves order history)
    await prisma.order.updateMany({
      where: { userId },
      data: { userId: null },
    });

    await prisma.user.delete({ where: { id: userId } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[account/delete]", err);
    return NextResponse.json({ success: false, error: "Failed to delete account" }, { status: 500 });
  }
}
