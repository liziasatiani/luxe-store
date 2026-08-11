"use client";
import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Search, X, Truck, MapPin, Package, Trash2 } from "lucide-react";
import { Badge, Input, Spinner } from "@/components/ui";
import { formatPrice, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import { useDebounce } from "@/hooks";

interface Order {
  id: string; orderNumber: string; status: string; total: number; createdAt: string;
  user: { name: string; email: string } | null;
  guestName: string | null; guestEmail: string | null;
  items: Array<{ productName: string; quantity: number }>;
}

interface OrderDetail {
  id: string; orderNumber: string; status: string; paymentStatus: string; createdAt: string;
  subtotal: number; discountAmount: number; shippingAmount: number; taxAmount: number; total: number;
  couponCode: string | null; notes: string | null;
  trackingNumber: string | null; trackingUrl: string | null; shippedAt: string | null;
  guestName: string | null; guestEmail: string | null; guestPhone: string | null;
  shippingName: string | null; shippingLine1: string | null; shippingLine2: string | null;
  shippingCity: string | null; shippingState: string | null; shippingPostal: string | null;
  shippingCountry: string | null; shippingPhone: string | null;
  user: { name: string; email: string } | null;
  items: Array<{ productName: string; productImage: string | null; productSku: string | null; quantity: number; unitPrice: number; totalPrice: number; variantName: string | null }>;
}

const STATUS_OPTIONS = [
  { label: "All Statuses", value: ""          },
  { label: "Pending",      value: "PENDING"   },
  { label: "Confirmed",    value: "CONFIRMED" },
  { label: "Shipped",      value: "SHIPPED"   },
  { label: "Delivered",    value: "DELIVERED" },
  { label: "Cancelled",    value: "CANCELLED" },
];

const STATUS_BADGE: Record<string, "warning" | "default" | "success" | "gold" | "error"> = {
  PENDING: "warning", CONFIRMED: "success",
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
  const [shipModal, setShipModal] = useState<{ orderId: string; orderNumber: string } | null>(null);
  const [tracking, setTracking] = useState({ number: "", url: "" });
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 400);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (statusFilter) params.set("status", statusFilter);
      if (debouncedSearch) params.set("search", debouncedSearch);
      const res = await fetch(`/api/admin/orders?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setOrders(data.data?.orders ?? []);
      setTotal(data.data?.total ?? 0);
    } catch {
      setOrders([]);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, debouncedSearch]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const openDetail = async (id: string) => {
    setDetailLoading(true);
    setDetail(null);
    try {
      const res = await fetch(`/api/admin/orders?id=${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error();
      setDetail(data.data.order);
    } catch {
      toast.error("Failed to load order details");
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id");
    if (id) openDetail(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateStatus = async (id: string, status: string, trackingNumber?: string, trackingUrl?: string) => {
    setUpdating(id);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, trackingNumber: trackingNumber || undefined, trackingUrl: trackingUrl || undefined }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(status === "SHIPPED" ? "Order marked as shipped — notification sent" : "Order updated");
      fetchOrders();
      if (detail?.id === id) {
        const r = await fetch(`/api/admin/orders?id=${id}`);
        const d = await r.json();
        if (r.ok) setDetail(d.data.order);
      }
    } catch { toast.error("Failed to update order"); }
    finally { setUpdating(null); }
  };

  const handleStatusChange = (order: Order, newStatus: string) => {
    if (newStatus === "SHIPPED") {
      setTracking({ number: "", url: "" });
      setShipModal({ orderId: order.id, orderNumber: order.orderNumber });
    } else {
      updateStatus(order.id, newStatus);
    }
  };

  const confirmShip = async () => {
    if (!shipModal) return;
    await updateStatus(shipModal.orderId, "SHIPPED", tracking.number, tracking.url);
    setShipModal(null);
  };

  const deleteOrder = async (id: string) => {
    try {
      const res = await fetch("/api/admin/orders", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error();
      toast.success("Order deleted");
      setConfirmingDelete(null);
      if (detail?.id === id) setDetail(null);
      fetchOrders();
    } catch { toast.error("Failed to delete order"); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-surface-900 dark:text-white">Orders</h1>
        <p className="text-surface-500 text-sm mt-1">{total} total orders</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="w-64">
          <Input placeholder="Search by order # or email…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} leftIcon={<Search size={16} />} />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="h-11 px-4 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40">
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
                {orders.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-12 text-surface-400 text-sm">No orders found</td></tr>
                )}
                {orders.map((order) => (
                  <tr key={order.id} onClick={() => openDetail(order.id)} className="hover:bg-surface-50 dark:hover:bg-surface-800/30 transition-colors cursor-pointer">
                    <td className="px-4 py-3 font-mono text-sm font-bold text-surface-900 dark:text-white">#{order.orderNumber}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-surface-900 dark:text-white">{order.user?.name ?? order.guestName ?? "Guest"}</p>
                      <p className="text-xs text-surface-400">{order.user?.email ?? order.guestEmail ?? "—"}</p>
                    </td>
                    <td className="px-4 py-3">
                      {order.items.map((item, i) => (
                        <p key={i} className="text-sm text-surface-900 dark:text-white leading-snug">
                          {item.quantity > 1 && <span className="text-surface-400 mr-1">{item.quantity}×</span>}{item.productName}
                        </p>
                      ))}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold">{formatPrice(order.total)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_BADGE[order.status] ?? "default"} size="sm">{order.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-surface-400">{formatDate(order.createdAt, { month: "short", day: "numeric" })}</td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      {confirmingDelete === order.id ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-surface-500">Delete?</span>
                          <button onClick={() => deleteOrder(order.id)} className="text-xs px-2 py-1 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors">Yes</button>
                          <button onClick={() => setConfirmingDelete(null)} className="text-xs px-2 py-1 rounded-lg border border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors">No</button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order, e.target.value)}
                            disabled={updating === order.id}
                            className="text-xs rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-500"
                          >
                            {STATUS_OPTIONS.filter((o) => o.value).map((o) => (
                              <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                          </select>
                          <button onClick={() => setConfirmingDelete(order.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-surface-400 hover:text-red-500 transition-colors">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {total > 20 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-surface-100 dark:border-surface-800">
            <p className="text-xs text-surface-400">Showing {Math.min((page - 1) * 20 + 1, total)}–{Math.min(page * 20, total)} of {total}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg border border-surface-200 dark:border-surface-700 disabled:opacity-40"><ChevronLeft size={14} /></button>
              <button onClick={() => setPage((p) => p + 1)} disabled={page * 20 >= total} className="p-1.5 rounded-lg border border-surface-200 dark:border-surface-700 disabled:opacity-40"><ChevronRight size={14} /></button>
            </div>
          </div>
        )}
      </div>

      {/* Order detail drawer */}
      {(detail || detailLoading) && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setDetail(null)} />
          <div className="w-full max-w-lg bg-white dark:bg-surface-900 h-full overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100 dark:border-surface-800 shrink-0">
              <div>
                <h2 className="font-semibold text-surface-900 dark:text-white">
                  {detail ? `#${detail.orderNumber}` : "Order Details"}
                </h2>
                {detail && (
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant={STATUS_BADGE[detail.status] ?? "default"} size="sm">{detail.status}</Badge>
                    <span className="text-xs text-surface-400">{formatDate(detail.createdAt, { month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                )}
              </div>
              <button onClick={() => setDetail(null)} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500"><X size={16} /></button>
            </div>

            {detailLoading ? (
              <div className="flex justify-center py-16"><Spinner size={28} /></div>
            ) : detail ? (
              <div className="flex-1 overflow-y-auto p-6 space-y-6">

                {/* Customer */}
                <div>
                  <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Customer</p>
                  <p className="text-sm font-medium text-surface-900 dark:text-white">
                    {detail.user?.name ?? detail.guestName ?? "Guest"}
                    {!detail.user && <span className="ml-2 text-xs text-surface-400 font-normal">Guest order</span>}
                  </p>
                  <p className="text-sm text-surface-500">{detail.user?.email ?? detail.guestEmail ?? "—"}</p>
                  {detail.guestPhone && <p className="text-sm text-surface-500">{detail.guestPhone}</p>}
                </div>

                {/* Shipping address */}
                <div>
                  <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <MapPin size={12} /> Ship To
                  </p>
                  {detail.shippingLine1 ? (
                    <div className="rounded-xl border border-surface-100 dark:border-surface-800 p-3 text-sm space-y-0.5">
                      <p className="font-medium text-surface-900 dark:text-white">{detail.shippingName}</p>
                      <p className="text-surface-600 dark:text-surface-400">{detail.shippingLine1}</p>
                      {detail.shippingLine2 && <p className="text-surface-600 dark:text-surface-400">{detail.shippingLine2}</p>}
                      <p className="text-surface-600 dark:text-surface-400">{detail.shippingCity}{detail.shippingState ? `, ${detail.shippingState}` : ""} {detail.shippingPostal}</p>
                      <p className="text-surface-600 dark:text-surface-400">{detail.shippingCountry}</p>
                      {detail.shippingPhone && <p className="text-surface-400 text-xs mt-1">{detail.shippingPhone}</p>}
                    </div>
                  ) : (
                    <p className="text-sm text-surface-400">No shipping address recorded</p>
                  )}
                </div>

                {/* Items */}
                <div>
                  <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Package size={12} /> Items
                  </p>
                  <div className="space-y-2">
                    {detail.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between gap-3 py-2 border-b border-surface-50 dark:border-surface-800 last:border-0">
                        <div className="min-w-0">
                          <p className="text-sm text-surface-900 dark:text-white leading-snug">{item.productName}</p>
                          {item.variantName && <p className="text-xs text-surface-400">{item.variantName}</p>}
                          {item.productSku && <p className="text-xs text-surface-400">SKU: {item.productSku}</p>}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-medium">{formatPrice(item.totalPrice)}</p>
                          <p className="text-xs text-surface-400">{item.quantity} × {formatPrice(item.unitPrice)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="rounded-xl border border-surface-100 dark:border-surface-800 p-3 space-y-1.5 text-sm">
                  <div className="flex justify-between text-surface-600 dark:text-surface-400">
                    <span>Subtotal</span><span>{formatPrice(detail.subtotal)}</span>
                  </div>
                  {detail.discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount{detail.couponCode ? ` (${detail.couponCode})` : ""}</span>
                      <span>−{formatPrice(detail.discountAmount)}</span>
                    </div>
                  )}
                  {detail.shippingAmount > 0 && (
                    <div className="flex justify-between text-surface-600 dark:text-surface-400">
                      <span>Shipping</span><span>{formatPrice(detail.shippingAmount)}</span>
                    </div>
                  )}
                  {detail.taxAmount > 0 && (
                    <div className="flex justify-between text-surface-600 dark:text-surface-400">
                      <span>Tax</span><span>{formatPrice(detail.taxAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-surface-900 dark:text-white border-t border-surface-100 dark:border-surface-800 pt-1.5 mt-1.5">
                    <span>Total</span><span>{formatPrice(detail.total)}</span>
                  </div>
                </div>

                {/* Tracking */}
                {detail.trackingNumber && (
                  <div>
                    <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Truck size={12} /> Tracking
                    </p>
                    <p className="text-sm text-surface-900 dark:text-white">{detail.trackingNumber}</p>
                    {detail.trackingUrl && (
                      <a href={detail.trackingUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-500 hover:underline">{detail.trackingUrl}</a>
                    )}
                    {detail.shippedAt && <p className="text-xs text-surface-400 mt-0.5">Shipped {formatDate(detail.shippedAt, { month: "short", day: "numeric", year: "numeric" })}</p>}
                  </div>
                )}

                {/* Notes */}
                {detail.notes && (
                  <div>
                    <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1">Customer Notes</p>
                    <p className="text-sm text-surface-600 dark:text-surface-400 bg-surface-50 dark:bg-surface-800 rounded-xl p-3">{detail.notes}</p>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Shipping modal */}
      {shipModal && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-surface-900 rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Truck size={18} className="text-brand-500" />
                <h2 className="font-semibold text-surface-900 dark:text-white">Mark as Shipped</h2>
              </div>
              <button onClick={() => setShipModal(null)} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800"><X size={16} /></button>
            </div>
            <p className="text-sm text-surface-500 mb-5">
              Order <span className="font-mono font-bold text-surface-900 dark:text-white">#{shipModal.orderNumber}</span> — a shipping notification will be emailed to the customer.
            </p>
            <div className="space-y-3">
              <Input label="Tracking Number (optional)" placeholder="e.g. 1Z999AA10123456784" value={tracking.number} onChange={(e) => setTracking((t) => ({ ...t, number: e.target.value }))} />
              <Input label="Tracking URL (optional)" placeholder="https://track.carrier.com/..." value={tracking.url} onChange={(e) => setTracking((t) => ({ ...t, url: e.target.value }))} />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShipModal(null)} className="flex-1 h-10 rounded-xl border border-surface-200 dark:border-surface-700 text-sm text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors">Cancel</button>
              <button onClick={confirmShip} disabled={updating === shipModal.orderId} className="flex-1 h-10 rounded-xl bg-black dark:bg-white text-white dark:text-black text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-50">
                {updating === shipModal.orderId ? "Sending…" : "Confirm & Notify Customer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
