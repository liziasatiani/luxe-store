"use client";
import { useEffect, useState, useCallback } from "react";
import { Search, ChevronLeft, ChevronRight, Mail, X, MapPin, ShoppingBag } from "lucide-react";
import { Input, Spinner, Badge } from "@/components/ui";
import { formatDate, formatPrice } from "@/lib/utils";
import { useDebounce } from "@/hooks";
import toast from "react-hot-toast";

interface Customer {
  id: string; name: string; email: string; image?: string | null;
  createdAt: string; isActive: boolean;
  _count: { orders: number };
}

interface Address {
  id: string; label: string; firstName: string; lastName: string;
  line1: string; line2?: string | null; city: string; state: string;
  postalCode: string; country: string; phone?: string | null; isDefault: boolean;
}

interface OrderItem { productName: string; quantity: number; unitPrice: number }

interface CustomerOrder {
  id: string; orderNumber: string; status: string; paymentStatus: string;
  total: number; createdAt: string; items: OrderItem[];
}

interface CustomerDetail {
  id: string; name: string; email: string; phone?: string | null;
  createdAt: string; isActive: boolean;
  addresses: Address[];
  orders: CustomerOrder[];
}

const STATUS_BADGE: Record<string, "warning" | "default" | "success" | "gold" | "error"> = {
  PENDING: "warning", CONFIRMED: "success", SHIPPED: "gold", DELIVERED: "success", CANCELLED: "error",
};

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<CustomerDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const debouncedSearch = useDebounce(search, 400);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20", ...(debouncedSearch && { search: debouncedSearch }) });
      const res = await fetch(`/api/admin/customers?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCustomers(data.data?.customers ?? []);
      setTotal(data.data?.total ?? 0);
    } catch {
      setCustomers([]);
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const openDetail = async (id: string) => {
    setDetailLoading(true);
    setDetail(null);
    try {
      const res = await fetch(`/api/admin/customers?id=${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error();
      setDetail(data.data.customer);
    } catch {
      toast.error("Failed to load customer details");
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-surface-900 dark:text-white">Customers</h1>
        <p className="text-surface-500 text-sm mt-1">{total} total customers</p>
      </div>

      <div className="w-64">
        <Input placeholder="Search by name or email…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} leftIcon={<Search size={16} />} />
      </div>

      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner size={28} /></div>
        ) : (
          <table className="w-full">
            <thead className="bg-surface-50 dark:bg-surface-800/50 border-b border-surface-100 dark:border-surface-800">
              <tr>
                {["Customer", "Orders", "Joined", "Status", ""].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
              {customers.length === 0 && (
                <tr><td colSpan={5} className="text-center py-12 text-surface-400 text-sm">No customers found</td></tr>
              )}
              {customers.map(c => (
                <tr
                  key={c.id}
                  onClick={() => openDetail(c.id)}
                  className="hover:bg-surface-50 dark:hover:bg-surface-800/30 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-surface-900 dark:text-white">{c.name}</p>
                    <p className="text-xs text-surface-400">{c.email}</p>
                  </td>
                  <td className="px-4 py-3 text-sm">{c._count.orders} orders</td>
                  <td className="px-4 py-3 text-xs text-surface-400">{formatDate(c.createdAt, { month: "short", day: "numeric", year: "numeric" })}</td>
                  <td className="px-4 py-3"><Badge variant={c.isActive ? "success" : "error"} size="sm">{c.isActive ? "Active" : "Inactive"}</Badge></td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => { navigator.clipboard.writeText(c.email); toast.success("Email copied"); }}
                      className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500 inline-flex"
                      title="Copy email"
                    >
                      <Mail size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {total > 20 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-surface-100 dark:border-surface-800">
            <p className="text-xs text-surface-400">Showing {Math.min((page-1)*20+1, total)}–{Math.min(page*20, total)} of {total}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="p-1.5 rounded-lg border border-surface-200 dark:border-surface-700 disabled:opacity-40"><ChevronLeft size={14} /></button>
              <button onClick={() => setPage(p => p+1)} disabled={page * 20 >= total} className="p-1.5 rounded-lg border border-surface-200 dark:border-surface-700 disabled:opacity-40"><ChevronRight size={14} /></button>
            </div>
          </div>
        )}
      </div>

      {/* Detail drawer */}
      {(detail || detailLoading) && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setDetail(null)} />
          <div className="w-full max-w-md bg-white dark:bg-surface-900 h-full overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100 dark:border-surface-800 shrink-0">
              <h2 className="font-semibold text-surface-900 dark:text-white">Customer Details</h2>
              <button onClick={() => setDetail(null)} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500">
                <X size={16} />
              </button>
            </div>

            {detailLoading ? (
              <div className="flex justify-center py-16"><Spinner size={28} /></div>
            ) : detail ? (
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Basic info */}
                <div>
                  <p className="text-lg font-semibold text-surface-900 dark:text-white">{detail.name}</p>
                  <a href={`mailto:${detail.email}`} className="text-sm text-brand-500 hover:underline flex items-center gap-1 mt-0.5">
                    <Mail size={12} /> {detail.email}
                  </a>
                  {detail.phone && <p className="text-sm text-surface-500 mt-0.5">{detail.phone}</p>}
                  <p className="text-xs text-surface-400 mt-1">
                    Joined {formatDate(detail.createdAt, { month: "long", day: "numeric", year: "numeric" })}
                    {" · "}<Badge variant={detail.isActive ? "success" : "error"} size="sm">{detail.isActive ? "Active" : "Inactive"}</Badge>
                  </p>
                </div>

                {/* Addresses */}
                <div>
                  <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <MapPin size={12} /> Saved Addresses
                  </p>
                  {detail.addresses.length === 0 ? (
                    <p className="text-sm text-surface-400">No saved addresses</p>
                  ) : (
                    <div className="space-y-3">
                      {detail.addresses.map(addr => (
                        <div key={addr.id} className="rounded-xl border border-surface-100 dark:border-surface-800 p-3 text-sm">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-surface-500 uppercase tracking-wide">{addr.label}</span>
                            {addr.isDefault && <Badge variant="gold" size="sm">Default</Badge>}
                          </div>
                          <p className="text-surface-900 dark:text-white">{addr.firstName} {addr.lastName}</p>
                          <p className="text-surface-500">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}</p>
                          <p className="text-surface-500">{addr.city}, {addr.state} {addr.postalCode}</p>
                          <p className="text-surface-500">{addr.country}</p>
                          {addr.phone && <p className="text-surface-400 mt-0.5">{addr.phone}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Orders */}
                <div>
                  <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <ShoppingBag size={12} /> Order History ({detail.orders.length})
                  </p>
                  {detail.orders.length === 0 ? (
                    <p className="text-sm text-surface-400">No orders yet</p>
                  ) : (
                    <div className="space-y-3">
                      {detail.orders.map(order => (
                        <div key={order.id} className="rounded-xl border border-surface-100 dark:border-surface-800 p-3">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-mono text-xs font-bold text-surface-900 dark:text-white">#{order.orderNumber}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant={STATUS_BADGE[order.status] ?? "default"} size="sm">{order.status}</Badge>
                              <span className="text-sm font-semibold">{formatPrice(order.total)}</span>
                            </div>
                          </div>
                          <div className="text-xs text-surface-500 space-y-0.5">
                            {order.items.map((item, i) => (
                              <p key={i}>{item.quantity > 1 ? `${item.quantity}× ` : ""}{item.productName}</p>
                            ))}
                          </div>
                          <p className="text-xs text-surface-400 mt-1.5">{formatDate(order.createdAt, { month: "short", day: "numeric", year: "numeric" })}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
