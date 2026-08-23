import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  try {
    const { name } = await req.json();
    if (!name?.trim()) return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 });
    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const brand = await prisma.brand.create({
      data: { name: name.trim(), slug },
      select: { id: true, name: true, slug: true },
    });
    return NextResponse.json({ success: true, data: { brand } }, { status: 201 });
  } catch (err: unknown) {
    const isDupe = err instanceof Error && err.message.includes("Unique constraint");
    return NextResponse.json({ success: false, error: isDupe ? "A brand with this name already exists" : "Failed to create brand" }, { status: 500 });
  }
}
