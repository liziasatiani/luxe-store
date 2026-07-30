"use client";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { TrendingUp, TrendingDown, ShoppingBag, Users, DollarSign, Package, AlertTriangle } from "lucide-react";
import { formatPrice, formatDate, formatNumber } from "@/lib/utils";
import { Spinner, Badge } from "@/components/ui";
import Link from "next/link";
import Image from "next/image";

interface Analytics {
  summary: {
    totalRevenue: number; totalOrders: number; totalCustomers: number;
    totalProducts: number; lowStockProducts: number;
    revenueChange: number; ordersChange: number; customersChange: number; avgOrderValue: number;
  };
  recentOrders: Array<{ id: string; orderNumber: string; total: number; status: string; createdAt: string; user: { name: string; email: string } }>;
  topProducts: Array<{ id: string; name: string; salesCount: number; price: number; stock: number; images: Array<{ url: string }> }>;
  revenueChart: Array<{ date: string; revenue: number; orders: number }>;
}

export default function AdminDashboard() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics").then(r => r.json()).then(d => setData(d.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size={32} /></div>;
  if (!data) return <p className="text-error">Failed to load analytics</p>;

  const { summary, recentOrders, topProducts, revenueChart } = data;

  const StatCard = ({ title, value, change, icon: Icon, prefix = "", color = "text-brand-500" }: {
    title: string; value: string | number; change?: number; icon: typeof DollarSign; prefix?: string; color?: string;
  }) => (
    <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl bg-surface-50 dark:bg-surface-800 flex items-center justify-center ${color}`}>
          <Icon size={20} />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium ${change >= 0 ? "text-green-500" : "text-error"}`}>
            {change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-display font-bold text-surface-900 dark:text-white">{prefix}{typeof value === "number" && prefix === "$" ? formatPrice(value).replace("$","") : formatNumber(value as number)}</p>
      <p className="text-sm text-surface-400 mt-1">{title}</p>
      {change !== undefined && <p className="text-xs text-surface-400 mt-0.5">vs last month</p>}
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-surface-900 dark:text-white">Dashboard</h1>
        <p className="text-surface-500 text-sm mt-1">Welcome back! Here's what's happening this month.</p>
      </div>

      {/* Low stock alert */}
      {summary.lowStockProducts > 0 && (
        <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
          <AlertTriangle size={18} className="text-yellow-600 dark:text-yellow-400 shrink-0" />
          <p className="text-sm text-yellow-800 dark:text-yellow-300">
            <strong>{summary.lowStockProducts} products</strong> are low on stock or out of stock.{" "}
            <Link href="/admin/products?filter=lowstock" className="underline">Review now →</Link>
          </p>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Revenue (this month)" value={summary.totalRevenue} change={summary.revenueChange} icon={DollarSign} prefix="$" color="text-brand-500" />
        <StatCard title="Orders (this month)" value={summary.totalOrders} change={summary.ordersChange} icon={ShoppingBag} color="text-blue-500" />
        <StatCard title="New Customers" value={summary.totalCustomers} change={summary.customersChange} icon={Users} color="text-purple-500" />
        <StatCard title="Avg Order Value" value={summary.avgOrderValue} icon={TrendingUp} prefix="$" color="text-green-500" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-6">
          <h2 className="font-semibold text-surface-900 dark:text-white mb-5">Revenue (Last 30 Days)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={revenueChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8e5e0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${v}`} />
              <Tooltip formatter={(v) => [`$${Number(v).toFixed(2)}`, "Revenue"]} />
              <Line type="monotone" dataKey="revenue" stroke="#c4821f" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-6">
          <h2 className="font-semibold text-surface-900 dark:text-white mb-5">Orders (Last 30 Days)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8e5e0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [v, "Orders"]} />
              <Bar dataKey="orders" fill="#c4821f" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-surface-900 dark:text-white">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-brand-500 hover:text-brand-600">View all →</Link>
          </div>
          <div className="space-y-3">
            {recentOrders.map(order => (
              <Link key={order.id} href={`/admin/orders?id=${order.id}`} className="flex items-center justify-between gap-3 py-2 hover:bg-surface-50 dark:hover:bg-surface-800 -mx-2 px-2 rounded-xl transition-colors">
                <div className="min-w-0">
                  <p className="text-sm font-mono font-bold text-surface-900 dark:text-white">#{order.orderNumber}</p>
                  <p className="text-xs text-surface-400 truncate">{order.user.name} · {formatDate(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-medium">{formatPrice(order.total)}</span>
                  <Badge variant={order.status === "DELIVERED" ? "success" : order.status === "CANCELLED" ? "error" : "warning"} size="sm">
                    {order.status}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-surface-900 dark:text-white">Top Products</h2>
            <Link href="/admin/products" className="text-xs text-brand-500 hover:text-brand-600">View all →</Link>
          </div>
          <div className="space-y-3">
            {topProducts.map((product, i) => (
              <div key={product.id} className="flex items-center gap-3">
                <span className="text-xs text-surface-400 w-4 text-right">{i+1}</span>
                <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-surface-50 dark:bg-surface-800 shrink-0">
                  {product.images[0]?.url && <Image src={product.images[0].url} alt={product.name} fill className="object-cover" sizes="40px" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-900 dark:text-white line-clamp-1">{product.name}</p>
                  <p className="text-xs text-surface-400">{product.salesCount} sold · Stock: {product.stock}</p>
                </div>
                <p className="text-sm font-semibold shrink-0">{formatPrice(product.price)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
