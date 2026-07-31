import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reviewSchema } from "@/lib/validations";
import { parseIntParam } from "@/lib/utils";
import { rateLimit, getIP, rateLimitResponse } from "@/lib/rateLimit";

export async function GET(req: NextRequest) {
  try {
    const productId = req.nextUrl.searchParams.get("productId");
    if (!productId) return NextResponse.json({ success: false, error: "productId required" }, { status: 400 });

    const limit = parseIntParam(req.nextUrl.searchParams.get("limit"), 20, { min: 1, max: 50 });
    const page = parseIntParam(req.nextUrl.searchParams.get("page"), 1, { min: 1 });

    const reviews = await prisma.review.findMany({
      where: { productId, isApproved: true },
      include: { user: { select: { id: true, name: true, image: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    const stats = await prisma.review.aggregate({
      where: { productId, isApproved: true },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const distribution = await prisma.review.groupBy({
      by: ["rating"],
      where: { productId, isApproved: true },
      _count: true,
    });

    return NextResponse.json({
      success: true,
      data: {
        reviews,
        avg: stats._avg.rating ?? 0,
        count: stats._count.rating,
        distribution: Object.fromEntries(distribution.map(d => [d.rating, d._count])),
      },
    });
  } catch (err) {
    console.error("[reviews/GET]", err);
    return NextResponse.json({ success: false, error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const rl = await rateLimit(`reviews:${getIP(req)}`, 5, 60 * 1000);
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { productId } = parsed.data;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });
    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    // Check if user purchased this product
    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: { userId: session.user.id, status: { in: ["DELIVERED", "CONFIRMED"] } },
      },
    });

    const existing = await prisma.review.findUnique({
      where: { productId_userId: { productId, userId: session.user.id } },
    });
    if (existing) return NextResponse.json({ success: false, error: "You've already reviewed this product" }, { status: 400 });

    // Auto-approve setting
    const setting = await prisma.siteSetting.findUnique({ where: { key: "review_auto_approve" } });
    const autoApprove = setting?.value === "true";

    const review = await prisma.review.create({
      data: {
        productId,
        userId: session.user.id,
        rating: parsed.data.rating,
        title: parsed.data.title,
        body: parsed.data.body,
        isVerified: !!hasPurchased,
        isApproved: autoApprove,
      },
    });

    // Update product rating denormalized fields
    const agg = await prisma.review.aggregate({
      where: { productId, isApproved: true },
      _avg: { rating: true },
      _count: { rating: true },
    });
    await prisma.product.update({
      where: { id: productId },
      data: {
        ratingAvg: parseFloat((agg._avg.rating ?? 0).toFixed(2)),
        ratingCount: agg._count.rating,
      },
    });

    return NextResponse.json({
      success: true,
      data: { review },
      message: autoApprove ? "Review published!" : "Review submitted for approval.",
    });
  } catch (err) {
    console.error("[reviews/POST]", err);
    return NextResponse.json({ success: false, error: "Failed to submit review" }, { status: 500 });
  }
}
