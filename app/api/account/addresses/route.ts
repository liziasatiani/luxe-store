import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addressSchema } from "@/lib/validations";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  try {
    const addresses = await prisma.address.findMany({ where: { userId: session.user.id }, orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }] });
    return NextResponse.json({ success: true, data: { addresses } });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch addresses" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const parsed = addressSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    if (parsed.data.isDefault) {
      await prisma.address.updateMany({ where: { userId: session.user.id }, data: { isDefault: false } });
    }
    const address = await prisma.address.create({ data: { ...parsed.data, userId: session.user.id } });
    return NextResponse.json({ success: true, data: { address } }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to save address" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ success: false, error: "Address ID required" }, { status: 400 });
    await prisma.address.deleteMany({ where: { id, userId: session.user.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to delete address" }, { status: 500 });
  }
}
