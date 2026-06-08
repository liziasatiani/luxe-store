"use client";
import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Badge, Input, Spinner } from "@/components/ui";
import { formatPrice, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import { useDebounce } from "@/hooks";

interface Order {
  id: string; orderNumber: string; status: string; total: number; createdAt: string;
  user: { name: string; email: string };
  items: Array<{ productName: string; quantity: number }>;
}

const STATUS_OPTIONS = [
  { label: "All Statuses", value: "" },
  { label: "Pending",    value: "PENDING"    },
  { label: "Processing", value: "PROCESSING" },
  { label: "Confirmed",  value: "CONFIRMED"  },
  { label: "Shipped",    value: "SHIPPED"    },
  { label: "Delivered",  value: "DELIVERED"  },
  { label: "Cancelled",  value: "CANCELLED"  },
];

const STATUS_BADGE: Record<string, "warning" | "default" | "success" | "gold" | "error"> = {
  PENDING: "warning", PROCESSING: "default", CONFIRMED: "success",
  SHIPPED: "gold", DELIVERED: "success", CANCELLED: "error",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 400);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (statusFilter) params.set("status", statusFilter);
      if (debouncedSearch) params.set("search", debouncedSearch);
      const res = await fetch(`/api/admin/orders?${params}`);
      const data = await res.json();
      setOrders(data.data?.orders ?? []);
      setTotal(data.data?.total ?? 0);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, debouncedSearch]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Order updated");
      fetchOrders();
    } catch { toast.error("Failed to update order"); }
    finally { setUpdating(null); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-surface-900 dark:text-white">Orders</h1>
        <p className="text-surface-500 text-sm mt-1">{total} total orders</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="w-64">
          <Input
            placeholder="Search by order # or email…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            leftIcon={<Search size={16} />}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="h-11 px-4 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40"
        >
          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner size={28} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-50 dark:bg-surface-800/50 border-b border-surface-100 dark:border-surface-800">
                <tr>
                  {["Order", "Customer", "Items", "Total", "Status", "Date", "Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-sm font-bold text-surface-900 dark:text-white">#{order.orderNumber}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-surface-900 dark:text-white">{order.user.name}</p>
                      <p className="text-xs text-surface-400">{order.user.email}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-surface-600 dark:text-surface-400">{order.items.length}</td>
                    <td className="px-4 py-3 text-sm font-semibold">{formatPrice(order.total)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_BADGE[order.status] ?? "default"} size="sm">{order.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-surface-400">{formatDate(order.createdAt, { month: "short", day: "numeric" })}</td>
                    <td className="px-4 py-3">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        disabled={updating === order.id}
                        className="text-xs rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      >
                        {STATUS_OPTIONS.filter((o) => o.value).map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {total > 20 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-surface-100 dark:border-surface-800">
            <p className="text-xs text-surface-400">
              Showing {Math.min((page - 1) * 20 + 1, total)}–{Math.min(page * 20, total)} of {total}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg border border-surface-200 dark:border-surface-700 disabled:opacity-40">
                <ChevronLeft size={14} />
              </button>
              <button onClick={() => setPage((p) => p + 1)} disabled={page * 20 >= total} className="p-1.5 rounded-lg border border-surface-200 dark:border-surface-700 disabled:opacity-40">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
