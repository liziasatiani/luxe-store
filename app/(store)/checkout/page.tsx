"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { CreditCard, Truck, Lock, User, LogIn, ChevronRight, Check } from "lucide-react";
import { Container, Input, Divider } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/store";
import { formatPrice, isValidEmail } from "@/lib/utils";
import toast from "react-hot-toast";

interface Address {
  id: string; label: string; firstName: string; lastName: string;
  line1: string; city: string; state: string; postalCode: string; country: string;
}

type CheckoutMode = "choose" | "guest" | "login";
type Step = 1 | 2;

function AddressSummary({ addresses, selectedId }: { addresses: Address[]; selectedId: string }) {
  const a = addresses.find(x => x.id === selectedId);
  if (!a) return null;
  return <p className="text-sm text-black dark:text-white">{a.firstName} {a.lastName} · {a.line1}, {a.city}, {a.state}</p>;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, subtotal, discount, shipping, tax, total, coupon, clearCart } = useCartStore();
  const [mode, setMode] = useState<CheckoutMode>("choose");
  const [step, setStep] = useState<Step>(1);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [placing, setPlacing] = useState(false);
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

  const setG = (k: string, v: string) => {
    setGuest(g => ({ ...g, [k]: v }));
    if (guestErrors[k]) setGuestErrors(e => ({ ...e, [k]: "" }));
  };

  const validateStep1 = () => {
    if (mode === "login") {
      if (!selectedAddress) { toast.error("Please select a shipping address"); return false; }
      return true;
    }
    const errors: Record<string, string> = {};
    if (!guest.firstName) errors.firstName = "Required";
    if (!guest.lastName) errors.lastName = "Required";
    if (!guest.email) errors.email = "Required";
    else if (!isValidEmail(guest.email)) errors.email = "Invalid email";
    if (!guest.line1) errors.line1 = "Required";
    if (!guest.city) errors.city = "Required";
    if (!guest.state) errors.state = "Required";
    if (!guest.postalCode) errors.postalCode = "Required";
    setGuestErrors(errors);
    if (Object.keys(errors).length > 0) { toast.error("Please fill in all required fields"); return false; }
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
            paymentMethod: "CASH_ON_DELIVERY",
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
            paymentMethod: "CASH_ON_DELIVERY",
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
      if (!res.ok) throw new Error(data.error ?? "Failed to place order");
      placedRef.current = true;
      clearCart();
      const guestEmail = mode === "guest" ? guest.email : undefined;
      router.push(`/checkout/success?orderId=${data.data.order.id}${guestEmail ? `&email=${encodeURIComponent(guestEmail)}` : ""}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to place order");
    } finally {
      setPlacing(false);
    }
  };

  // Mode selection screen
  if (!session && mode === "choose") {
    return (
      <Container className="py-16 max-w-lg">
        <h1 className="font-display text-4xl text-surface-900 dark:text-white mb-2 text-center">Checkout</h1>
        <p className="text-center text-sm text-surface-400 mb-10">How would you like to continue?</p>
        <div className="space-y-3">
          <button onClick={() => setMode("guest")}
            className="w-full p-6 border border-black dark:border-white bg-black dark:bg-white text-white dark:text-black text-left">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full border border-white/20 dark:border-black/20 flex items-center justify-center">
                <User size={18} />
              </div>
              <div>
                <p className="font-medium text-[13px] tracking-[0.06em] uppercase">Continue as Guest</p>
                <p className="text-[12px] text-white/60 dark:text-black/60 mt-0.5">No account required · Fast checkout</p>
              </div>
            </div>
          </button>
          <div className="flex items-center gap-4 py-1">
            <div className="flex-1 h-px bg-surface-200 dark:bg-surface-700" />
            <span className="text-[11px] tracking-[0.1em] uppercase text-surface-400">or</span>
            <div className="flex-1 h-px bg-surface-200 dark:bg-surface-700" />
          </div>
          <button onClick={() => router.push("/login?redirect=/checkout")}
            className="w-full p-6 border border-surface-200 dark:border-surface-700 hover:border-black dark:hover:border-white transition-colors text-left">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 flex items-center justify-center text-surface-500 dark:text-surface-400">
                <LogIn size={18} />
              </div>
              <div>
                <p className="text-[13px] tracking-[0.06em] uppercase font-medium text-surface-900 dark:text-white">Sign In</p>
                <p className="text-[12px] text-surface-400 mt-0.5">Faster checkout · Order tracking · Saved addresses</p>
              </div>
            </div>
          </button>
          <p className="text-center text-xs text-surface-400 pt-2">
            New here?{" "}
            <Link href="/register?redirect=/checkout" className="underline hover:text-surface-900 dark:hover:text-white transition-colors">Create an account</Link>
          </p>
        </div>
      </Container>
    );
  }

  const stepLabels = ["Shipping", "Payment"];

  return (
    <Container className="py-12 max-w-5xl">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-0 mb-12">
        {stepLabels.map((label, i) => {
          const idx = i + 1;
          const done = idx < step;
          const active = idx === step;
          return (
            <div key={label} className="flex items-center">
              <button
                onClick={() => done ? setStep(idx as Step) : undefined}
                disabled={!done}
                className="flex flex-col items-center gap-1.5 disabled:cursor-default"
              >
                <div className={`w-8 h-8 flex items-center justify-center text-[11px] font-medium transition-colors
                  ${done ? "bg-black dark:bg-white text-white dark:text-black cursor-pointer" :
                    active ? "border-2 border-black dark:border-white text-black dark:text-white" :
                    "border border-black/20 dark:border-white/20 text-black/30 dark:text-white/30"}`}>
                  {done ? <Check size={14} /> : idx}
                </div>
                <span className={`text-[10px] tracking-[0.12em] uppercase font-medium
                  ${active ? "text-black dark:text-white" : done ? "text-black/60 dark:text-white/60" : "text-black/30 dark:text-white/30"}`}>
                  {label}
                </span>
              </button>
              {i < stepLabels.length - 1 && (
                <div className={`w-20 sm:w-32 h-px mx-4 mb-5 transition-colors ${done ? "bg-black dark:bg-white" : "bg-black/15 dark:bg-white/15"}`} />
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        <div className="lg:col-span-3">
          {/* ── Step 1: Shipping ── */}
          {step === 1 && (
            <div className="space-y-8">
              <h2 className="font-display text-2xl text-black dark:text-white">Shipping Information</h2>

              {mode === "guest" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] tracking-[0.16em] uppercase text-black/40 dark:text-white/40">Contact</p>
                    <button onClick={() => setMode("choose")} className="text-[11px] tracking-[0.08em] uppercase text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors">← Change</button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input id="firstName" label="First Name *" autoComplete="given-name" value={guest.firstName} onChange={e => setG("firstName", e.target.value)} error={guestErrors.firstName} />
                    <Input id="lastName" label="Last Name *" autoComplete="family-name" value={guest.lastName} onChange={e => setG("lastName", e.target.value)} error={guestErrors.lastName} />
                    <div className="col-span-2">
                      <Input id="email" label="Email *" type="email" autoComplete="email" inputMode="email" value={guest.email} onChange={e => setG("email", e.target.value)} error={guestErrors.email} />
                    </div>
                    <div className="col-span-2">
                      <Input id="phone" label="Phone" autoComplete="tel" inputMode="tel" value={guest.phone} onChange={e => setG("phone", e.target.value)} placeholder="+1 555 000 0000" />
                    </div>
                  </div>

                  <p className="text-[10px] tracking-[0.16em] uppercase text-black/40 dark:text-white/40 pt-2">Address</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <Input id="line1" label="Street Address *" autoComplete="address-line1" value={guest.line1} onChange={e => setG("line1", e.target.value)} error={guestErrors.line1} />
                    </div>
                    <div className="col-span-2">
                      <Input id="line2" label="Apt, suite, etc." autoComplete="address-line2" value={guest.line2} onChange={e => setG("line2", e.target.value)} />
                    </div>
                    <Input id="city" label="City *" autoComplete="address-level2" value={guest.city} onChange={e => setG("city", e.target.value)} error={guestErrors.city} />
                    <Input id="state" label="State *" autoComplete="address-level1" value={guest.state} onChange={e => setG("state", e.target.value)} error={guestErrors.state} />
                    <Input id="postalCode" label="Postal Code *" autoComplete="postal-code" inputMode="numeric" value={guest.postalCode} onChange={e => setG("postalCode", e.target.value)} error={guestErrors.postalCode} />
                    <Input id="country" label="Country" autoComplete="country-name" value={guest.country} onChange={e => setG("country", e.target.value)} />
                  </div>
                </div>
              )}

              {mode === "login" && (
                <div className="space-y-3">
                  <p className="text-[10px] tracking-[0.16em] uppercase text-black/40 dark:text-white/40">Saved Addresses</p>
                  {addresses.length > 0 ? (
                    <>
                      {addresses.map(addr => (
                        <label key={addr.id} className={`flex items-start gap-3 p-4 border cursor-pointer transition-colors ${selectedAddress === addr.id ? "border-black dark:border-white bg-black/[0.03] dark:bg-white/[0.03]" : "border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30"}`}>
                          <input type="radio" name="address" value={addr.id} checked={selectedAddress === addr.id} onChange={() => setSelectedAddress(addr.id)} className="mt-1" />
                          <div>
                            <p className="text-sm font-medium text-black dark:text-white">{addr.label} — {addr.firstName} {addr.lastName}</p>
                            <p className="text-sm text-black/50 dark:text-white/50 mt-0.5">{addr.line1}, {addr.city}, {addr.state} {addr.postalCode}</p>
                          </div>
                        </label>
                      ))}
                      <Link href="/account/addresses?redirect=/checkout" className="text-[11px] tracking-[0.08em] uppercase text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors">+ Add new address</Link>
                    </>
                  ) : (
                    <div className="p-6 border border-dashed border-black/15 dark:border-white/15 text-center">
                      <p className="text-sm text-black/40 dark:text-white/40 mb-3">No saved addresses</p>
                      <Link href="/account/addresses?redirect=/checkout" className="text-[11px] tracking-[0.1em] uppercase text-black dark:text-white underline">Add address</Link>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => { if (validateStep1()) setStep(2); }}
                className="w-full h-12 flex items-center justify-center gap-2 bg-black dark:bg-white text-white dark:text-black text-[11px] tracking-[0.16em] uppercase font-medium hover:bg-black/80 dark:hover:bg-white/80 transition-colors"
              >
                Continue to Payment <ChevronRight size={14} />
              </button>
            </div>
          )}

          {/* ── Step 2: Payment ── */}
          {step === 2 && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl text-black dark:text-white">Payment</h2>
                <button onClick={() => setStep(1)} className="text-[11px] tracking-[0.08em] uppercase text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors">← Edit shipping</button>
              </div>

              {/* Shipping summary */}
              <div className="p-4 border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02]">
                <div className="flex items-center gap-2 mb-1">
                  <Truck size={14} className="text-black/40 dark:text-white/40" />
                  <p className="text-[10px] tracking-[0.14em] uppercase text-black/40 dark:text-white/40">Shipping to</p>
                </div>
                {mode === "guest" ? (
                  <p className="text-sm text-black dark:text-white">{guest.firstName} {guest.lastName} · {guest.line1}, {guest.city}, {guest.state} {guest.postalCode}</p>
                ) : (
                  <AddressSummary addresses={addresses} selectedId={selectedAddress} />
                )}
              </div>

              {/* Payment method */}
              <div className="space-y-3">
                <p className="text-[10px] tracking-[0.16em] uppercase text-black/40 dark:text-white/40">Payment Method</p>
                <div className="flex items-center gap-3 p-4 border border-black dark:border-white bg-black/[0.02] dark:bg-white/[0.02]">
                  <input type="radio" checked readOnly />
                  <CreditCard size={16} className="text-black/60 dark:text-white/60" />
                  <span className="text-sm text-black dark:text-white font-medium">Cash on Delivery</span>
                  <span className="ml-auto text-[10px] tracking-[0.08em] uppercase text-black/30 dark:text-white/30">Pay when received</span>
                </div>
              </div>

              <Input id="notes" label="Order notes (optional)" placeholder="Any special instructions…" value={notes} onChange={e => setNotes(e.target.value)} />

              <Button onClick={placeOrder} loading={placing} variant="gold" size="lg" fullWidth leftIcon={<Lock size={16} />}>
                Place Order · {formatPrice(total())}
              </Button>
              <p className="text-[11px] text-center text-black/30 dark:text-white/30">By placing your order you agree to our Terms of Service.</p>
            </div>
          )}
        </div>

        {/* Order summary sidebar */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 border border-black/10 dark:border-white/10 p-6 space-y-4">
            <p className="text-[10px] tracking-[0.16em] uppercase text-black/40 dark:text-white/40">Order Summary</p>
            <div className="space-y-3 max-h-52 overflow-y-auto">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-sm gap-3">
                  <span className="text-black/60 dark:text-white/60 line-clamp-2 flex-1">{item.product.name} × {item.quantity}</span>
                  <span className="font-medium shrink-0 text-black dark:text-white">{formatPrice(Number(item.product.price) * item.quantity)}</span>
                </div>
              ))}
            </div>
            <Divider />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-black/60 dark:text-white/60">
                <span>Subtotal</span><span className="text-black dark:text-white">{formatPrice(subtotal())}</span>
              </div>
              {discount() > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({coupon?.code})</span><span>−{formatPrice(discount())}</span>
                </div>
              )}
              <div className="flex justify-between text-black/60 dark:text-white/60">
                <span>Shipping</span><span className="text-black dark:text-white">{shipping() === 0 ? "FREE" : formatPrice(shipping())}</span>
              </div>
              <div className="flex justify-between text-black/60 dark:text-white/60">
                <span>Tax</span><span className="text-black dark:text-white">{formatPrice(tax())}</span>
              </div>
            </div>
            <Divider />
            <div className="flex justify-between font-medium text-lg text-black dark:text-white">
              <span>Total</span><span>{formatPrice(total())}</span>
            </div>
            <div className="flex flex-col gap-1.5 pt-1">
              {[
                { icon: Lock, text: "256-bit SSL encryption" },
                { icon: Truck, text: "Free shipping over $75" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2">
                  <Icon size={12} className="text-black/30 dark:text-white/30 shrink-0" />
                  <span className="text-[11px] text-black/40 dark:text-white/40">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
