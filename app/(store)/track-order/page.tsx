"use client";
import { useState } from "react";
import { Container, Input, Badge } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { Package, Truck, CheckCircle, Clock, Search } from "lucide-react";
import { formatPrice, formatDate, isValidEmail } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface OrderResult {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  items: Array<{ productName: string; quantity: number; totalPrice: number }>;
  shippingName?: string | null;
  shippingLine1?: string | null;
  shippingCity?: string | null;
  shippingState?: string | null;
  shippingPostal?: string | null;
}

const STATUS_BADGE: Record<string, "success" | "warning" | "error" | "default" | "gold"> = {
  PENDING: "warning", PROCESSING: "default", CONFIRMED: "success",
  SHIPPED: "gold", DELIVERED: "success", CANCELLED: "error",
};

const STATUS_ORDER = ["PENDING", "PROCESSING", "CONFIRMED", "SHIPPED", "DELIVERED"];

export default function TrackOrderPage() {
  const t = useTranslations("trackOrder");
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<OrderResult | null>(null);
  const [error, setError] = useState("");

  const STEPS = [
    { key: "PENDING",   icon: Clock,        label: t("steps.placed")    },
    { key: "CONFIRMED", icon: CheckCircle,  label: t("steps.confirmed") },
    { key: "SHIPPED",   icon: Truck,        label: t("steps.shipped")   },
    { key: "DELIVERED", icon: Package,      label: t("steps.delivered") },
  ];

  const handleTrack = async () => {
    setError("");
    if (!orderNumber.trim()) { setError(t("errors.orderNumber")); return; }
    if (!email.trim() || !isValidEmail(email)) { setError(t("errors.email")); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/track?orderNumber=${encodeURIComponent(orderNumber.trim())}&email=${encodeURIComponent(email.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Order not found");
      setOrder(data.data.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.notFound"));
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const currentIdx = order ? STATUS_ORDER.indexOf(order.status) : -1;

  return (
    <>
      <div className="bg-surface-50 dark:bg-surface-900/50 border-b border-surface-100 dark:border-surface-800 py-14">
        <Container className="text-center">
          <h1 className="font-display text-5xl text-surface-900 dark:text-white mb-3">{t("title")}</h1>
          <p className="text-surface-500">{t("subtitle")}</p>
        </Container>
      </div>
      <Container className="py-16 max-w-2xl">
        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-8 space-y-5 mb-8">
          <Input label={t("orderNumber")} placeholder={t("orderNumberPlaceholder")} value={orderNumber} onChange={e => setOrderNumber(e.target.value)} onKeyDown={e => e.key === "Enter" && handleTrack()} />
          <Input label={t("emailLabel")} type="email" placeholder={t("emailPlaceholder")} value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleTrack()} />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button onClick={handleTrack} loading={loading} variant="gold" size="lg" fullWidth leftIcon={<Search size={18} />}>{t("trackBtn")}</Button>
        </div>

        {order && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="font-mono font-bold text-surface-900 dark:text-white">#{order.orderNumber}</p>
                  <p className="text-sm text-surface-400 mt-0.5">{t("placed", { date: formatDate(order.createdAt) })}</p>
                </div>
                <Badge variant={STATUS_BADGE[order.status] ?? "default"}>{order.status}</Badge>
              </div>
              {!["CANCELLED","REFUNDED"].includes(order.status) && (
                <div className="flex items-center justify-between relative mt-4">
                  <div className="absolute top-5 left-10 right-10 h-0.5 bg-surface-100 dark:bg-surface-800" />
                  <div className="absolute top-5 left-10 h-0.5 bg-brand-500 transition-all" style={{ width: `${Math.max(0,(currentIdx/(STEPS.length-1))*80)}%` }} />
                  {STEPS.map((step, i) => {
                    const done = i <= currentIdx;
                    return (
                      <div key={step.key} className="flex flex-col items-center gap-2 relative z-10">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${done ? "bg-brand-500 text-white" : "bg-surface-100 dark:bg-surface-800 text-surface-400"}`}>
                          <step.icon size={18} />
                        </div>
                        <p className={`text-xs font-medium text-center ${done ? "text-brand-500" : "text-surface-400"}`}>{step.label}</p>
                      </div>
                    );
                  })}
                </div>
              )}
              {order.trackingNumber && (
                <div className="mt-5 p-3 rounded-xl bg-brand-50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-800">
                  <p className="text-sm text-surface-600 dark:text-surface-400">
                    {t("tracking")} {order.trackingUrl ? <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-brand-500 font-bold">{order.trackingNumber}</a> : <span className="font-mono font-bold">{order.trackingNumber}</span>}
                  </p>
                </div>
              )}
            </div>
            <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-6 space-y-3">
              <h3 className="font-semibold text-surface-900 dark:text-white">{t("itemsOrdered")}</h3>
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-surface-600 dark:text-surface-400">{item.productName} ×{item.quantity}</span>
                  <span className="font-medium">{formatPrice(item.totalPrice)}</span>
                </div>
              ))}
              <div className="border-t border-surface-100 dark:border-surface-800 pt-3 flex justify-between font-semibold">
                <span>{t("total")}</span><span>{formatPrice(order.total)}</span>
              </div>
            </div>
            {order.shippingName && (
              <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-6">
                <h3 className="font-semibold text-surface-900 dark:text-white mb-3">{t("shippingTo")}</h3>
                <p className="text-sm text-surface-600 dark:text-surface-400">{order.shippingName}</p>
                <p className="text-sm text-surface-500">{order.shippingLine1}</p>
                <p className="text-sm text-surface-500">{order.shippingCity}, {order.shippingState} {order.shippingPostal}</p>
              </div>
            )}
          </div>
        )}
      </Container>
    </>
  );
}
