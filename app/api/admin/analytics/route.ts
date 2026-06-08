import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeDecimal } from "@/lib/utils";

export async function GET() {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string })?.role;
    if (!["ADMIN", "SUPER_ADMIN"].includes(role ?? "")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalOrders, lastMonthOrders,
      revenueAgg, lastMonthRevAgg,
      totalCustomers, lastMonthCustomers,
      totalProducts, lowStockProducts,
      recentOrders, topProducts,
    ] = await prisma.$transaction([
      prisma.order.count({ where: { createdAt: { gte: thisMonthStart } } }),
      prisma.order.count({ where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd } } }),
      prisma.order.aggregate({ where: { paymentStatus: "PAID", createdAt: { gte: thisMonthStart } }, _sum: { total: true } }),
      prisma.order.aggregate({ where: { paymentStatus: "PAID", createdAt: { gte: lastMonthStart, lte: lastMonthEnd } }, _sum: { total: true } }),
      prisma.user.count({ where: { role: "USER", createdAt: { gte: thisMonthStart } } }),
      prisma.user.count({ where: { role: "USER", createdAt: { gte: lastMonthStart, lte: lastMonthEnd } } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.count({ where: { stockStatus: { in: ["LOW_STOCK", "OUT_OF_STOCK"] } } }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" }, take: 10,
        include: { user: { select: { name: true, email: true } }, items: { take: 1 } },
      }),
      prisma.product.findMany({
        orderBy: { salesCount: "desc" }, take: 5,
        select: { id: true, name: true, salesCount: true, price: true, stock: true, images: { take: 1 } },
      }),
    ]);

    // Revenue chart — last 30 days
    const revenueChart = await prisma.$queryRaw<Array<{ date: string; revenue: number; orders: bigint }>>`
      SELECT 
        DATE(created_at)::text as date,
        SUM(total)::float as revenue,
        COUNT(*)::bigint as orders
      FROM orders
      WHERE created_at >= NOW() - INTERVAL '30 days'
        AND payment_status = 'PAID'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    const thisRevenue = Number(revenueAgg._sum.total ?? 0);
    const lastRevenue = Number(lastMonthRevAgg._sum.total ?? 0);

    const pct = (curr: number, prev: number) =>
      prev === 0 ? 100 : parseFloat((((curr - prev) / prev) * 100).toFixed(1));

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalRevenue: thisRevenue,
          totalOrders,
          totalCustomers,
          totalProducts,
          lowStockProducts,
          revenueChange: pct(thisRevenue, lastRevenue),
          ordersChange: pct(totalOrders, lastMonthOrders),
          customersChange: pct(totalCustomers, lastMonthCustomers),
          avgOrderValue: totalOrders ? parseFloat((thisRevenue / totalOrders).toFixed(2)) : 0,
        },
        recentOrders: serializeDecimal(recentOrders),
        topProducts: serializeDecimal(topProducts),
        revenueChart: revenueChart.map(r => ({
          date: r.date,
          revenue: r.revenue,
          orders: Number(r.orders),
        })),
      },
    });
  } catch (err) {
    console.error("[admin/analytics]", err);
    return NextResponse.json({ success: false, error: "Failed to fetch analytics" }, { status: 500 });
  }
}
