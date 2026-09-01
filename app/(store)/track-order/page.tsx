"use client";
import { useState } from "react";
import { Package, Truck, CheckCircle, Clock, Search } from "lucide-react";
import { formatPrice, formatDate, isValidEmail } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface OrderResult {
  id: string; orderNumber: string; status: string; total: number; createdAt: string;
  trackingNumber?: string | null; trackingUrl?: string | null;
  items: Array<{ productName: string; quantity: number; totalPrice: number }>;
  shippingName?: string | null; shippingLine1?: string | null;
  shippingCity?: string | null; shippingState?: string | null; shippingPostal?: string | null;
}

const STATUS_COLOR: Record<string, string> = {
  PENDING: "#b8962e", PROCESSING: "var(--chalk3)", CONFIRMED: "#4a9d6f",
  SHIPPED: "var(--gold)", DELIVERED: "#4a9d6f", CANCELLED: "var(--crimson)",
};

const STATUS_ORDER = ["PENDING", "PROCESSING", "CONFIRMED", "SHIPPED", "DELIVERED"];

function KInput({ label, error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--chalk2)", marginBottom: 6 }}>{label}</label>
      <input
        style={{ width: "100%", padding: "10px 13px", background: "transparent", border: `1px solid ${error ? "var(--crimson)" : "var(--borderg)"}`, color: "var(--chalk)", fontSize: 13, outline: "none" }}
        onFocus={e => { if (!error) e.currentTarget.style.borderColor = "var(--gold)"; }}
        onBlur={e => { e.currentTarget.style.borderColor = error ? "var(--crimson)" : "var(--borderg)"; }}
        {...props}
      />
      {error && <p style={{ fontSize: 11, color: "var(--crimson)", marginTop: 4 }}>{error}</p>}
    </div>
  );
}

export default function TrackOrderPage() {
  const t = useTranslations("trackOrder");
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<OrderResult | null>(null);
  const [error, setError] = useState("");

  const STEPS = [
    { key: "PENDING",   icon: Clock,       label: t("steps.placed")    },
    { key: "CONFIRMED", icon: CheckCircle, label: t("steps.confirmed") },
    { key: "SHIPPED",   icon: Truck,       label: t("steps.shipped")   },
    { key: "DELIVERED", icon: Package,     label: t("steps.delivered") },
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
      <div className="k-page-hdr">
        <div className="wrap">
          <p className="page-hd-eyebrow">Order Status</p>
          <h1 className="page-hd-title">{t("title")}</h1>
          <p style={{ fontSize: 14, color: "var(--chalk3)", marginTop: 12 }}>{t("subtitle")}</p>
        </div>
      </div>
      <div style={{ paddingTop: 64, paddingBottom: 96 }}>
        <div className="wrap" style={{ maxWidth: 560 }}>
          {/* Search form */}
          <div className="glass-card" style={{ padding: 28, marginBottom: 32, display: "flex", flexDirection: "column", gap: 16 }}>
            <KInput
              label={t("orderNumber")}
              placeholder={t("orderNumberPlaceholder")}
              value={orderNumber}
              onChange={e => setOrderNumber(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleTrack()}
            />
            <KInput
              label={t("emailLabel")}
              type="email"
              placeholder={t("emailPlaceholder")}
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleTrack()}
            />
            {error && <p style={{ fontSize: 12, color: "var(--crimson)" }}>{error}</p>}
            <button
              onClick={handleTrack}
              disabled={loading}
              style={{ width: "100%", height: 48, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, background: "var(--gold)", color: "#000", fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", border: "none", cursor: loading ? "wait" : "pointer", opacity: loading ? 0.7 : 1 }}
            >
              <Search size={15} /> {loading ? "…" : t("trackBtn")}
            </button>
          </div>

          {order && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Status card */}
              <div style={{ border: "1px solid var(--border)", padding: 24 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, gap: 12 }}>
                  <div>
                    <p style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 700, color: "var(--chalk)", letterSpacing: "0.04em" }}>#{order.orderNumber}</p>
                    <p style={{ fontSize: 11, color: "var(--chalk3)", marginTop: 3 }}>{t("placed", { date: formatDate(order.createdAt) })}</p>
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "4px 10px",
                    color: STATUS_COLOR[order.status] ?? "var(--chalk3)",
                    border: `1px solid ${STATUS_COLOR[order.status] ?? "var(--border)"}`,
                  }}>
                    {order.status}
                  </span>
                </div>

                {!["CANCELLED", "REFUNDED"].includes(order.status) && (
                  <div style={{ position: "relative" }}>
                    {/* Track line background */}
                    <div style={{ position: "absolute", top: 16, left: 16, right: 16, height: 1, background: "var(--border)" }} />
                    {/* Track line progress */}
                    <div style={{ position: "absolute", top: 16, left: 16, height: 1, background: "var(--gold)", width: `${Math.max(0, (currentIdx / (STEPS.length - 1)) * (100 - 8))}%`, transition: "width 0.4s ease" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
                      {STEPS.map((step, i) => {
                        const done = i <= currentIdx;
                        return (
                          <div key={step.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                            <div style={{
                              width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
                              background: done ? "var(--gold)" : "var(--s2)",
                              border: `1px solid ${done ? "var(--gold)" : "var(--border)"}`,
                            }}>
                              <step.icon size={14} style={{ color: done ? "#000" : "var(--chalk3)" }} />
                            </div>
                            <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: done ? "var(--chalk)" : "var(--chalk3)", textAlign: "center", maxWidth: 60 }}>
                              {step.label}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {order.trackingNumber && (
                  <div style={{ marginTop: 24, padding: "12px 16px", border: "1px solid var(--gold)", background: "var(--s1)" }}>
                    <p style={{ fontSize: 12, color: "var(--chalk2)" }}>
                      {t("tracking")}{" "}
                      {order.trackingUrl
                        ? <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "monospace", fontWeight: 700, color: "var(--gold)" }}>{order.trackingNumber}</a>
                        : <span style={{ fontFamily: "monospace", fontWeight: 700, color: "var(--chalk)" }}>{order.trackingNumber}</span>
                      }
                    </p>
                  </div>
                )}
              </div>

              {/* Items */}
              <div style={{ border: "1px solid var(--border)", padding: 24, display: "flex", flexDirection: "column", gap: 10 }}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--chalk2)", marginBottom: 6 }}>{t("itemsOrdered")}</p>
                {order.items.map((item, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: "var(--chalk2)" }}>{item.productName} ×{item.quantity}</span>
                    <span style={{ fontWeight: 500, color: "var(--chalk)" }}>{formatPrice(item.totalPrice)}</span>
                  </div>
                ))}
                <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, marginTop: 4, display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--chalk)" }}>{t("total")}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--chalk)" }}>{formatPrice(order.total)}</span>
                </div>
              </div>

              {/* Shipping address */}
              {order.shippingName && (
                <div style={{ border: "1px solid var(--border)", padding: 24 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--chalk2)", marginBottom: 12 }}>{t("shippingTo")}</p>
                  <p style={{ fontSize: 13, color: "var(--chalk)", marginBottom: 4 }}>{order.shippingName}</p>
                  <p style={{ fontSize: 12, color: "var(--chalk3)" }}>{order.shippingLine1}</p>
                  <p style={{ fontSize: 12, color: "var(--chalk3)" }}>{order.shippingCity}, {order.shippingState} {order.shippingPostal}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
