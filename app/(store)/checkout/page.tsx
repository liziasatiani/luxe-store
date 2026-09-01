"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Banknote, CreditCard, Truck, Lock, User, LogIn, ChevronRight, Check, ChevronDown, Plus } from "lucide-react";
import { useCartStore, useCurrencyStore } from "@/store";
import { isValidEmail } from "@/lib/utils";
import { useCurrency } from "@/hooks/useCurrency";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

interface Address {
  id: string; label: string; firstName: string; lastName: string;
  line1: string; city: string; state: string; postalCode: string; country: string;
}

type CheckoutMode = "choose" | "guest" | "login";
type Step = 1 | 2;

function KInput({ label, error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  return (
    <div style={{ width: "100%" }}>
      {label && <label style={{ display: "block", fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--chalk2)", marginBottom: 6 }}>{label}</label>}
      <input
        style={{ width: "100%", padding: "10px 13px", background: "transparent", border: `1px solid ${error ? "var(--crimson)" : "var(--borderg)"}`, color: "var(--chalk)", fontSize: 13, outline: "none", transition: "border-color 0.2s" }}
        onFocus={e => { if (!error) e.currentTarget.style.borderColor = "var(--gold)"; }}
        onBlur={e => { e.currentTarget.style.borderColor = error ? "var(--crimson)" : "var(--borderg)"; }}
        {...props}
      />
      {error && <p style={{ fontSize: 11, color: "var(--crimson)", marginTop: 3 }}>{error}</p>}
    </div>
  );
}

function KDivider() {
  return <div style={{ height: 1, background: "var(--border)", margin: "4px 0" }} />;
}

function AddressSummary({ addresses, selectedId }: { addresses: Address[]; selectedId: string }) {
  const a = addresses.find(x => x.id === selectedId);
  if (!a) return null;
  return <p style={{ fontSize: 13, color: "var(--chalk)" }}>{a.firstName} {a.lastName} · {a.line1}, {a.city}, {a.state}</p>;
}

export default function CheckoutPage() {
  const t = useTranslations("checkout");
  const router = useRouter();
  const { data: session } = useSession();
  const { items, subtotal, discount, shipping, tax, total, coupon, clearCart } = useCartStore();
  const { format } = useCurrency();
  const { rates } = useCurrencyStore();
  const [mode, setMode] = useState<CheckoutMode>("choose");
  const [step, setStep] = useState<Step>(1);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [placing, setPlacing] = useState(false);

  const COD_MAX_GEL = 100;
  const totalGEL = total() * rates.USD_GEL;
  const codAvailable = totalGEL < COD_MAX_GEL;
  const [paymentMethod, setPaymentMethod] = useState<"CASH_ON_DELIVERY" | "STRIPE">("CASH_ON_DELIVERY");
  const [addingAddress, setAddingAddress] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [newAddr, setNewAddr] = useState({
    label: "", firstName: "", lastName: "", line1: "", line2: "",
    city: "", state: "", postalCode: "", country: "GE", phone: "",
  });
  const setNA = (k: string, v: string) => setNewAddr(a => ({ ...a, [k]: v }));

  useEffect(() => {
    if (!codAvailable) setPaymentMethod("STRIPE");
  }, [codAvailable]);

  const [guest, setGuest] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    line1: "", line2: "", city: "", state: "", postalCode: "", country: "US",
  });
  const [guestErrors, setGuestErrors] = useState<Record<string, string>>({});
  const placedRef = useRef(false);

  useEffect(() => {
    if (items.length === 0 && !placedRef.current) router.push("/cart");
  }, [items.length, router]);

  useEffect(() => {
    if (session?.user?.id) {
      setMode("login");
      fetch("/api/account/addresses").then(r => r.json()).then(d => {
        const addrs = d.data?.addresses ?? [];
        setAddresses(addrs);
        if (addrs[0]) setSelectedAddress(addrs[0].id);
      });
    }
  }, [session]);

  if (items.length === 0 && !placedRef.current) return null;

  const saveNewAddress = async () => {
    if (!newAddr.label || !newAddr.firstName || !newAddr.lastName || !newAddr.line1 || !newAddr.city || !newAddr.state || !newAddr.postalCode) {
      toast.error(t("errors.required")); return;
    }
    setSavingAddress(true);
    try {
      const res = await fetch("/api/account/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAddr),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const saved = data.data?.address;
      setAddresses(prev => [...prev, saved]);
      setSelectedAddress(saved.id);
      setAddingAddress(false);
      setNewAddr({ label: "", firstName: "", lastName: "", line1: "", line2: "", city: "", state: "", postalCode: "", country: "GE", phone: "" });
      toast.success(t("addressSaved"));
    } catch {
      toast.error(t("addressFailed"));
    } finally {
      setSavingAddress(false);
    }
  };

  const setG = (k: string, v: string) => {
    setGuest(g => ({ ...g, [k]: v }));
    if (guestErrors[k]) setGuestErrors(e => ({ ...e, [k]: "" }));
  };

  const validateStep1 = () => {
    if (mode === "login") {
      if (!selectedAddress) { toast.error(t("errors.selectAddress")); return false; }
      return true;
    }
    const errors: Record<string, string> = {};
    if (!guest.firstName) errors.firstName = t("errors.fieldRequired");
    if (!guest.lastName) errors.lastName = t("errors.fieldRequired");
    if (!guest.email) errors.email = t("errors.fieldRequired");
    else if (!isValidEmail(guest.email)) errors.email = t("errors.invalidEmail");
    if (!guest.line1) errors.line1 = t("errors.fieldRequired");
    if (!guest.city) errors.city = t("errors.fieldRequired");
    if (!guest.state) errors.state = t("errors.fieldRequired");
    if (!guest.postalCode) errors.postalCode = t("errors.fieldRequired");
    setGuestErrors(errors);
    if (Object.keys(errors).length > 0) { toast.error(t("errors.required")); return false; }
    return true;
  };

  const placeOrder = async () => {
    setPlacing(true);
    try {
      const cartItems = items.map(i => ({
        productId: i.productId,
        variantId: i.variantId ?? null,
        quantity: i.quantity,
      }));
      const body = mode === "guest"
        ? {
            guest: true as const,
            guestInfo: { firstName: guest.firstName, lastName: guest.lastName, email: guest.email, phone: guest.phone },
            paymentMethod: paymentMethod === "STRIPE" ? "STRIPE" : "CASH_ON_DELIVERY",
            couponCode: coupon?.code,
            notes,
            shippingSnapshot: {
              shippingName: `${guest.firstName} ${guest.lastName}`,
              shippingLine1: guest.line1,
              shippingLine2: guest.line2,
              shippingCity: guest.city,
              shippingState: guest.state,
              shippingPostal: guest.postalCode,
              shippingCountry: guest.country,
              shippingPhone: guest.phone,
            },
            cartItems,
          }
        : {
            guest: false as const,
            addressId: selectedAddress,
            paymentMethod: paymentMethod === "STRIPE" ? "STRIPE" : "CASH_ON_DELIVERY",
            couponCode: coupon?.code,
            notes,
            cartItems,
          };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t("errors.failedOrder"));

      const orderId = data.data.order.id;

      if (paymentMethod === "STRIPE") {
        const stripeRes = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId, guestEmail: mode === "guest" ? guest.email : undefined }),
        });
        const stripeData = await stripeRes.json();
        if (!stripeRes.ok || !stripeData.data?.url) throw new Error(t("errors.failedOrder"));
        placedRef.current = true;
        clearCart();
        window.location.href = stripeData.data.url;
        return;
      }

      placedRef.current = true;
      clearCart();
      const guestEmail = mode === "guest" ? guest.email : undefined;
      router.push(`/checkout/success?orderId=${orderId}${guestEmail ? `&email=${encodeURIComponent(guestEmail)}` : ""}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("errors.failedOrder"));
    } finally {
      setPlacing(false);
    }
  };

  /* ── Mode selection ─────────────────────────────────────────── */
  if (!session && mode === "choose") {
    return (
      <div style={{ paddingTop: 64, paddingBottom: 96 }}>
        <div className="wrap" style={{ maxWidth: 480 }}>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: 32, fontWeight: 700, color: "var(--chalk)", marginBottom: 8, textAlign: "center" }}>{t("title")}</h1>
          <p style={{ textAlign: "center", fontSize: 13, color: "var(--chalk3)", marginBottom: 40 }}>{t("howToContinue")}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <button
              onClick={() => setMode("guest")}
              style={{ width: "100%", padding: 24, background: "var(--chalk)", color: "var(--bg)", border: "1px solid var(--chalk)", textAlign: "left", cursor: "pointer" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 40, height: 40, border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <User size={18} />
                </div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>{t("continueAsGuest")}</p>
                  <p style={{ fontSize: 11, opacity: 0.6, marginTop: 3 }}>{t("guestSubtitle")}</p>
                </div>
              </div>
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "4px 0" }}>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
              <span style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--chalk3)" }}>or</span>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            </div>

            <button
              onClick={() => router.push("/login?redirect=/checkout")}
              style={{ width: "100%", padding: 24, background: "transparent", border: "1px solid var(--borderg)", textAlign: "left", cursor: "pointer", transition: "border-color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--chalk)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--borderg)")}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <LogIn size={18} style={{ color: "var(--chalk2)" }} />
                </div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--chalk)" }}>{t("signIn")}</p>
                  <p style={{ fontSize: 11, color: "var(--chalk3)", marginTop: 3 }}>{t("signInSubtitle")}</p>
                </div>
              </div>
            </button>

            <p style={{ textAlign: "center", fontSize: 11, color: "var(--chalk3)", paddingTop: 8 }}>
              {t("newHere")}{" "}
              <Link href="/register?redirect=/checkout" style={{ color: "var(--chalk2)", textDecoration: "underline" }}>{t("createAccount")}</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  const stepLabels = [t("shippingAddress"), t("payment")];

  return (
    <div style={{ paddingTop: 48, paddingBottom: 96 }}>
      <div className="wrap" style={{ maxWidth: 1100 }}>
        {/* Step indicator */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: 48 }}>
          {stepLabels.map((label, i) => {
            const idx = i + 1;
            const done = idx < step;
            const active = idx === step;
            return (
              <div key={label} style={{ display: "flex", alignItems: "center" }}>
                <button
                  onClick={() => done ? setStep(idx as Step) : undefined}
                  disabled={!done}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, background: "none", border: "none", cursor: done ? "pointer" : "default", padding: 0 }}
                >
                  <div style={{
                    width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 500, transition: "all 0.2s",
                    background: done ? "var(--chalk)" : "transparent",
                    color: done ? "var(--bg)" : active ? "var(--chalk)" : "var(--chalk3)",
                    border: done ? "1px solid var(--chalk)" : active ? "2px solid var(--chalk)" : "1px solid var(--border)",
                  }}>
                    {done ? <Check size={13} /> : idx}
                  </div>
                  <span style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600, color: active ? "var(--chalk)" : done ? "var(--chalk2)" : "var(--chalk3)" }}>
                    {label}
                  </span>
                </button>
                {i < stepLabels.length - 1 && (
                  <div style={{ width: 80, height: 1, margin: "0 16px", marginBottom: 20, background: done ? "var(--chalk)" : "var(--border)", transition: "background 0.3s" }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile summary toggle */}
        <div className="lg:hidden" style={{ marginBottom: 24, border: "1px solid var(--border)" }}>
          <button
            onClick={() => setSummaryOpen(o => !o)}
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "none", border: "none", cursor: "pointer" }}
          >
            <span style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--chalk3)" }}>
              {summaryOpen ? t("hideSummary") : `${t("showSummary")} · ${format(total())}`}
            </span>
            <ChevronDown size={14} style={{ color: "var(--chalk3)", transition: "transform 0.2s", transform: summaryOpen ? "rotate(180deg)" : "none" }} />
          </button>
          {summaryOpen && (
            <div style={{ padding: "0 16px 16px", borderTop: "1px solid var(--border)" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 12, maxHeight: 160, overflowY: "auto" }}>
                {items.map(item => (
                  <div key={item.id} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <span style={{ fontSize: 12, color: "var(--chalk2)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.product.name} × {item.quantity}</span>
                    <span style={{ fontSize: 12, fontWeight: 500, flexShrink: 0, color: "var(--chalk)" }}>{format(Number(item.variant?.price ?? item.product.price) * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 12, color: "var(--chalk3)" }}>{t("subtotal")}</span><span style={{ fontSize: 12, color: "var(--chalk)" }}>{format(subtotal())}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 12, color: "var(--chalk3)" }}>{t("shipping")}</span><span style={{ fontSize: 12, color: "var(--chalk)" }}>{shipping() === 0 ? t("free") : format(shipping())}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 4 }}><span style={{ fontSize: 13, fontWeight: 600, color: "var(--chalk)" }}>{t("total")}</span><span style={{ fontSize: 13, fontWeight: 600, color: "var(--chalk)" }}>{format(total())}</span></div>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 40 }} className="lg:grid-checkout">
          <style>{`@media(min-width:1024px){.lg\\:grid-checkout{grid-template-columns:3fr 2fr;}}`}</style>

          {/* Main form */}
          <div>
            {step === 1 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                <h2 style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 700, color: "var(--chalk)" }}>{t("shippingInfo")}</h2>

                {mode === "guest" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <p style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--chalk3)" }}>{t("contact")}</p>
                      <button onClick={() => setMode("choose")} style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--chalk3)", background: "none", border: "none", cursor: "pointer" }}>{t("change")}</button>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <KInput id="firstName" label={t("firstName")} autoComplete="given-name" value={guest.firstName} onChange={e => setG("firstName", e.target.value)} error={guestErrors.firstName} />
                      <KInput id="lastName" label={t("lastName")} autoComplete="family-name" value={guest.lastName} onChange={e => setG("lastName", e.target.value)} error={guestErrors.lastName} />
                      <div style={{ gridColumn: "span 2" }}>
                        <KInput id="email" label={t("email")} type="email" autoComplete="email" inputMode="email" value={guest.email} onChange={e => setG("email", e.target.value)} error={guestErrors.email} />
                      </div>
                      <div style={{ gridColumn: "span 2" }}>
                        <KInput id="phone" label={t("phone")} autoComplete="tel" inputMode="tel" value={guest.phone} onChange={e => setG("phone", e.target.value)} />
                      </div>
                    </div>

                    <p style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--chalk3)", paddingTop: 8 }}>{t("address")}</p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div style={{ gridColumn: "span 2" }}>
                        <KInput id="line1" label={t("address")} autoComplete="address-line1" value={guest.line1} onChange={e => setG("line1", e.target.value)} error={guestErrors.line1} />
                      </div>
                      <div style={{ gridColumn: "span 2" }}>
                        <KInput id="line2" label={t("apartment")} autoComplete="address-line2" value={guest.line2} onChange={e => setG("line2", e.target.value)} />
                      </div>
                      <KInput id="city" label={t("city")} autoComplete="address-level2" value={guest.city} onChange={e => setG("city", e.target.value)} error={guestErrors.city} />
                      <KInput id="state" label={t("state")} autoComplete="address-level1" value={guest.state} onChange={e => setG("state", e.target.value)} error={guestErrors.state} />
                      <KInput id="postalCode" label={t("postalCode")} autoComplete="postal-code" inputMode="numeric" value={guest.postalCode} onChange={e => setG("postalCode", e.target.value)} error={guestErrors.postalCode} />
                      <KInput id="country" label={t("country")} autoComplete="country-name" value={guest.country} onChange={e => setG("country", e.target.value)} />
                    </div>
                  </div>
                )}

                {mode === "login" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <p style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--chalk3)" }}>{t("savedAddresses")}</p>
                    {addresses.map(addr => (
                      <label key={addr.id} style={{
                        display: "flex", alignItems: "flex-start", gap: 12, padding: 16, cursor: "pointer",
                        border: `1px solid ${selectedAddress === addr.id ? "var(--chalk)" : "var(--borderg)"}`,
                        background: selectedAddress === addr.id ? "var(--s2)" : "transparent",
                        transition: "border-color 0.15s",
                      }}>
                        <input type="radio" name="address" value={addr.id} checked={selectedAddress === addr.id} onChange={() => setSelectedAddress(addr.id)} style={{ marginTop: 2, accentColor: "var(--gold)" }} />
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 500, color: "var(--chalk)" }}>{addr.label} — {addr.firstName} {addr.lastName}</p>
                          <p style={{ fontSize: 12, color: "var(--chalk3)", marginTop: 3 }}>{addr.line1}, {addr.city}, {addr.state} {addr.postalCode}</p>
                        </div>
                      </label>
                    ))}

                    {addingAddress ? (
                      <div style={{ border: "1px solid var(--borderg)", padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                        <p style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--chalk3)" }}>{t("newAddress")}</p>
                        <KInput id="al" label={t("addressLabel")} value={newAddr.label} onChange={e => setNA("label", e.target.value)} />
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                          <KInput id="afn" label={t("firstName")} value={newAddr.firstName} onChange={e => setNA("firstName", e.target.value)} autoComplete="given-name" />
                          <KInput id="aln" label={t("lastName")} value={newAddr.lastName} onChange={e => setNA("lastName", e.target.value)} autoComplete="family-name" />
                          <div style={{ gridColumn: "span 2" }}><KInput id="al1" label={t("address")} value={newAddr.line1} onChange={e => setNA("line1", e.target.value)} autoComplete="address-line1" /></div>
                          <div style={{ gridColumn: "span 2" }}><KInput id="al2" label={t("apartment")} value={newAddr.line2} onChange={e => setNA("line2", e.target.value)} autoComplete="address-line2" /></div>
                          <KInput id="acity" label={t("city")} value={newAddr.city} onChange={e => setNA("city", e.target.value)} autoComplete="address-level2" />
                          <KInput id="astate" label={t("state")} value={newAddr.state} onChange={e => setNA("state", e.target.value)} autoComplete="address-level1" />
                          <KInput id="azip" label={t("postalCode")} value={newAddr.postalCode} onChange={e => setNA("postalCode", e.target.value)} autoComplete="postal-code" />
                          <KInput id="aphone" label={t("phone")} value={newAddr.phone} onChange={e => setNA("phone", e.target.value)} autoComplete="tel" />
                        </div>
                        <div style={{ display: "flex", gap: 10 }}>
                          <button onClick={saveNewAddress} disabled={savingAddress} style={{ padding: "9px 18px", background: "var(--gold)", color: "#000", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", border: "none", cursor: savingAddress ? "wait" : "pointer", opacity: savingAddress ? 0.7 : 1 }}>
                            {savingAddress ? "…" : t("saveAddress")}
                          </button>
                          <button onClick={() => setAddingAddress(false)} style={{ padding: "9px 18px", background: "transparent", color: "var(--chalk2)", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", border: "1px solid var(--borderg)", cursor: "pointer" }}>
                            {t("cancel")}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setAddingAddress(true)}
                        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--chalk3)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                      >
                        <Plus size={12} /> {t("addNewAddress")}
                      </button>
                    )}
                  </div>
                )}

                <button
                  onClick={async () => {
                    if (!validateStep1()) return;
                    setStep(2);
                    const email = mode === "guest" ? guest.email : session?.user?.email;
                    const name = mode === "guest" ? `${guest.firstName} ${guest.lastName}`.trim() : session?.user?.name ?? undefined;
                    if (email) {
                      const cartSnapshot = items.map(i => ({ name: i.product.name, price: Number(i.product.price), quantity: i.quantity }));
                      fetch("/api/checkout/save-cart", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, name, cartItems: cartSnapshot }) }).catch(() => {});
                    }
                  }}
                  style={{ width: "100%", height: 48, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "var(--chalk)", color: "var(--bg)", fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 700, border: "none", cursor: "pointer" }}
                >
                  {t("payment")} <ChevronRight size={14} />
                </button>
              </div>
            )}

            {step === 2 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <h2 style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 700, color: "var(--chalk)" }}>{t("payment")}</h2>
                  <button onClick={() => setStep(1)} style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--chalk3)", background: "none", border: "none", cursor: "pointer" }}>{t("editShipping")}</button>
                </div>

                <div className="glass-card" style={{ padding: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <Truck size={13} style={{ color: "var(--chalk3)" }} />
                    <p style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--chalk3)" }}>{t("shippingTo")}</p>
                  </div>
                  {mode === "guest" ? (
                    <p style={{ fontSize: 13, color: "var(--chalk)" }}>{guest.firstName} {guest.lastName} · {guest.line1}, {guest.city}, {guest.state} {guest.postalCode}</p>
                  ) : (
                    <AddressSummary addresses={addresses} selectedId={selectedAddress} />
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <p style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--chalk3)" }}>{t("paymentMethod")}</p>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("STRIPE")}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: 16, textAlign: "left", cursor: "pointer", transition: "border-color 0.15s", background: paymentMethod === "STRIPE" ? "var(--s2)" : "transparent", border: `1px solid ${paymentMethod === "STRIPE" ? "var(--chalk)" : "var(--borderg)"}` }}
                  >
                    <input type="radio" readOnly checked={paymentMethod === "STRIPE"} style={{ accentColor: "var(--gold)", flexShrink: 0 }} />
                    <CreditCard size={15} style={{ color: "var(--chalk2)", flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: "var(--chalk)", fontWeight: 500, flex: 1 }}>{t("cardPayment")}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {["VISA", "MC", "AMEX"].map(p => (
                        <span key={p} style={{ fontSize: 8, letterSpacing: "0.1em", border: "1px solid var(--borderg)", padding: "2px 4px", color: "var(--chalk3)" }}>{p}</span>
                      ))}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => codAvailable && setPaymentMethod("CASH_ON_DELIVERY")}
                    disabled={!codAvailable}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: 16, textAlign: "left", cursor: codAvailable ? "pointer" : "not-allowed", opacity: !codAvailable ? 0.4 : 1, transition: "border-color 0.15s", background: paymentMethod === "CASH_ON_DELIVERY" ? "var(--s2)" : "transparent", border: `1px solid ${paymentMethod === "CASH_ON_DELIVERY" ? "var(--chalk)" : "var(--borderg)"}` }}
                  >
                    <input type="radio" readOnly checked={paymentMethod === "CASH_ON_DELIVERY"} disabled={!codAvailable} style={{ accentColor: "var(--gold)", flexShrink: 0 }} />
                    <Banknote size={15} style={{ color: "var(--chalk2)", flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: "var(--chalk)", fontWeight: 500 }}>{t("cashOnDelivery")}</span>
                    <span style={{ marginLeft: "auto", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--chalk3)" }}>
                      {codAvailable ? t("payWhenReceived") : t("codUnavailable", { max: COD_MAX_GEL })}
                    </span>
                  </button>
                  {!codAvailable && (
                    <p style={{ fontSize: 11, color: "#d97706", display: "flex", alignItems: "center", gap: 6 }}>
                      <span>⚠</span> {t("codUnavailableMsg", { max: COD_MAX_GEL })}
                    </p>
                  )}
                </div>

                <KInput id="notes" label={t("orderNotes")} value={notes} onChange={e => setNotes(e.target.value)} />

                <button
                  onClick={placeOrder}
                  disabled={placing}
                  style={{ width: "100%", height: 52, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, background: "var(--gold)", color: "#000", fontSize: 12, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", border: "none", cursor: placing ? "wait" : "pointer", opacity: placing ? 0.7 : 1 }}
                >
                  <Lock size={14} />
                  {placing ? "…" : paymentMethod === "STRIPE" ? `${t("pay")} ${format(total())}` : `${t("placeOrder")} · ${format(total())}`}
                </button>
                <p style={{ fontSize: 11, textAlign: "center", color: "var(--chalk3)" }}>{t("termsNotice")}</p>
              </div>
            )}
          </div>

          {/* Order summary sidebar */}
          <div>
            <div className="glass-card" style={{ position: "sticky", top: 96, padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              <p style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--chalk3)" }}>{t("orderSummary")}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 208, overflowY: "auto" }}>
                {items.map(item => (
                  <div key={item.id} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <span style={{ fontSize: 12, color: "var(--chalk2)", flex: 1, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{item.product.name} × {item.quantity}</span>
                    <span style={{ fontSize: 12, fontWeight: 500, flexShrink: 0, color: "var(--chalk)" }}>{format(Number(item.variant?.price ?? item.product.price) * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <KDivider />
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 12, color: "var(--chalk3)" }}>{t("subtotal")}</span><span style={{ fontSize: 12, color: "var(--chalk)" }}>{format(subtotal())}</span></div>
                {discount() > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 12, color: "#4a9d6f" }}>{t("discount", { code: coupon?.code ?? "" })}</span><span style={{ fontSize: 12, color: "#4a9d6f" }}>−{format(discount())}</span></div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 12, color: "var(--chalk3)" }}>{t("shipping")}</span><span style={{ fontSize: 12, color: "var(--chalk)" }}>{shipping() === 0 ? t("free") : format(shipping())}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 12, color: "var(--chalk3)" }}>{t("tax")}</span><span style={{ fontSize: 12, color: "var(--chalk)" }}>{format(tax())}</span></div>
              </div>
              <KDivider />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--chalk)" }}>{t("total")}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "var(--chalk)" }}>{format(total())}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingTop: 4 }}>
                {[{ icon: Lock, text: t("sslEncryption") }, { icon: Truck, text: t("freeShipping") }].map(({ icon: Icon, text }) => (
                  <div key={text} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Icon size={11} style={{ color: "var(--chalk3)", flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: "var(--chalk3)" }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
