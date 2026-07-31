"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { CreditCard, Truck, Lock, User, LogIn } from "lucide-react";
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

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, subtotal, discount, shipping, tax, total, coupon, clearCart } = useCartStore();
  const [mode, setMode] = useState<CheckoutMode>("choose");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"CASH_ON_DELIVERY">("CASH_ON_DELIVERY");
  const [notes, setNotes] = useState("");
  const [placing, setPlacing] = useState(false);
  const [guest, setGuest] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    line1: "", line2: "", city: "", state: "", postalCode: "", country: "US",
  });
  const [guestErrors, setGuestErrors] = useState<Record<string, string>>({});

  // Set once the order is placed, so clearing the cart does not trip the
  // "empty cart" redirect below and bounce the user away from the success page.
  const placedRef = useRef(false);

  useEffect(() => {
    if (items.length === 0 && !placedRef.current) {
      router.push("/cart");
    }
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

  const validateGuest = () => {
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
    return Object.keys(errors).length === 0;
  };

  const placeOrder = async () => {
    if (mode === "guest" && !validateGuest()) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (mode === "login" && !selectedAddress) {
      toast.error("Please select a shipping address");
      return;
    }
    setPlacing(true);
    try {
      // The cart lives in localStorage, so every order — guest or signed-in —
      // must carry its line items. Only ids and quantities are sent; the server
      // re-derives all prices.
      const cartItems = items.map(i => ({
        productId: i.productId,
        variantId: i.variantId ?? null,
        quantity: i.quantity,
      }));

      const body = mode === "guest"
        ? {
            guest: true as const,
            guestInfo: {
              firstName: guest.firstName,
              lastName: guest.lastName,
              email: guest.email,
              phone: guest.phone,
            },
            paymentMethod,
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
            paymentMethod,
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

  const setG = (k: string, v: string) => {
    setGuest(g => ({ ...g, [k]: v }));
    if (guestErrors[k]) setGuestErrors(e => ({ ...e, [k]: "" }));
  };

  if (!session && mode === "choose") {
    return (
      <Container className="py-16 max-w-lg">
        <h1 className="font-display text-4xl text-surface-900 dark:text-white mb-2 text-center">Checkout</h1>
        <p className="text-center text-sm text-surface-400 mb-10">How would you like to continue?</p>
        <div className="space-y-3">
          {/* Guest first — primary path per Baymard */}
          <button onClick={() => setMode("guest")}
            className="w-full p-6 border border-black dark:border-white bg-black dark:bg-white text-white dark:text-black text-left group">
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
            className="w-full p-6 border border-surface-200 dark:border-surface-700 hover:border-black dark:hover:border-white transition-colors text-left group">
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

  const progressStep = placing ? 2 : 1;
  const steps = ["Details", "Payment", "Confirm"];

  return (
    <Container className="py-12 max-w-5xl">
      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-0 mb-10">
        {steps.map((label, i) => {
          const done = i < progressStep;
          const active = i === progressStep;
          return (
            <div key={label} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-medium transition-colors ${done ? "bg-black dark:bg-white text-white dark:text-black" : active ? "border-2 border-black dark:border-white text-black dark:text-white" : "border border-surface-300 dark:border-surface-600 text-surface-400"}`}>
                  {done ? "✓" : i + 1}
                </div>
                <span className={`text-[10px] tracking-[0.1em] uppercase ${active ? "text-black dark:text-white" : "text-surface-400"}`}>{label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-16 sm:w-24 h-px mx-3 mb-5 ${done ? "bg-black dark:bg-white" : "bg-surface-200 dark:bg-surface-700"}`} />
              )}
            </div>
          );
        })}
      </div>

      <h1 className="font-display text-4xl text-surface-900 dark:text-white mb-10">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        <div className="lg:col-span-3 space-y-8">
          {mode === "guest" && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User size={20} className="text-brand-500" />
                  <h2 className="font-semibold text-lg text-surface-900 dark:text-white">Your Details</h2>
                </div>
                <button onClick={() => setMode("choose")} className="text-sm text-brand-500 hover:text-brand-600">← Back</button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input id="guest-firstName" label="First Name *" value={guest.firstName} onChange={e => setG("firstName", e.target.value)} error={guestErrors.firstName} />
                <Input id="guest-lastName" label="Last Name *" value={guest.lastName} onChange={e => setG("lastName", e.target.value)} error={guestErrors.lastName} />
                <div className="col-span-2"><Input id="guest-email" label="Email Address *" type="email" value={guest.email} onChange={e => setG("email", e.target.value)} error={guestErrors.email} /></div>
                <div className="col-span-2"><Input id="guest-phone" label="Phone Number" value={guest.phone} onChange={e => setG("phone", e.target.value)} placeholder="+1 555 000 0000" /></div>
              </div>
              <div className="pt-2">
                <h3 className="font-medium text-surface-900 dark:text-white mb-3 flex items-center gap-2">
                  <Truck size={18} className="text-brand-500" /> Shipping Address
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2"><Input id="guest-line1" label="Address *" value={guest.line1} onChange={e => setG("line1", e.target.value)} error={guestErrors.line1} /></div>
                  <div className="col-span-2"><Input id="guest-line2" label="Apartment, suite, etc." value={guest.line2} onChange={e => setG("line2", e.target.value)} /></div>
                  <Input id="guest-city" label="City *" value={guest.city} onChange={e => setG("city", e.target.value)} error={guestErrors.city} />
                  <Input id="guest-state" label="State *" value={guest.state} onChange={e => setG("state", e.target.value)} error={guestErrors.state} />
                  <Input id="guest-postalCode" label="Postal Code *" value={guest.postalCode} onChange={e => setG("postalCode", e.target.value)} error={guestErrors.postalCode} />
                  <Input id="guest-country" label="Country" value={guest.country} onChange={e => setG("country", e.target.value)} />
                </div>
              </div>
            </section>
          )}

          {mode === "login" && (
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Truck size={20} className="text-brand-500" />
                <h2 className="font-semibold text-lg text-surface-900 dark:text-white">Shipping Address</h2>
              </div>
              {addresses.length > 0 ? (
                <div className="space-y-3">
                  {addresses.map(addr => (
                    <label key={addr.id} className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${selectedAddress === addr.id ? "border-brand-500 bg-brand-50 dark:bg-brand-900/10" : "border-surface-200 dark:border-surface-700"}`}>
                      <input type="radio" name="address" value={addr.id} checked={selectedAddress === addr.id} onChange={() => setSelectedAddress(addr.id)} className="mt-1 text-brand-500" />
                      <div>
                        <p className="font-medium text-sm text-surface-900 dark:text-white">{addr.label} — {addr.firstName} {addr.lastName}</p>
                        <p className="text-sm text-surface-500">{addr.line1}, {addr.city}, {addr.state} {addr.postalCode}</p>
                      </div>
                    </label>
                  ))}
                  <Link href="/account/addresses?redirect=/checkout" className="text-sm text-brand-500 hover:text-brand-600">+ Add new address</Link>
                </div>
              ) : (
                <div className="p-4 rounded-2xl border border-dashed border-surface-200 dark:border-surface-700 text-center">
                  <p className="text-surface-500 text-sm mb-3">No saved addresses</p>
                  <Link href="/account/addresses?redirect=/checkout" className="text-brand-500 text-sm font-medium">+ Add address</Link>
                </div>
              )}
            </section>
          )}

          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <CreditCard size={20} className="text-brand-500" />
              <h2 className="font-semibold text-lg text-surface-900 dark:text-white">Payment</h2>
            </div>
            <label className="flex items-center gap-3 p-4 rounded-2xl border border-brand-500 bg-brand-50 dark:bg-brand-900/10 cursor-pointer">
              <input type="radio" checked readOnly className="text-brand-500" />
              <Truck size={18} />
              <span className="font-medium text-sm">Cash on Delivery</span>
            </label>
          </section>

          <Input id="order-notes" label="Order notes (optional)" placeholder="Any special instructions…" value={notes} onChange={e => setNotes(e.target.value)} />
        </div>

        <div className="lg:col-span-2">
          <div className="sticky top-24 rounded-2xl border border-surface-100 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 space-y-4">
            <h2 className="font-semibold text-surface-900 dark:text-white">Order Summary</h2>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-surface-600 dark:text-surface-400 line-clamp-1 flex-1 mr-2">{item.product.name} x{item.quantity}</span>
                  <span className="font-medium shrink-0">{formatPrice(Number(item.product.price) * item.quantity)}</span>
                </div>
              ))}
            </div>
            <Divider />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-surface-500">Subtotal</span><span>{formatPrice(subtotal())}</span></div>
              {discount() > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatPrice(discount())}</span></div>}
              <div className="flex justify-between"><span className="text-surface-500">Shipping</span><span>{shipping() === 0 ? "FREE" : formatPrice(shipping())}</span></div>
              <div className="flex justify-between"><span className="text-surface-500">Tax</span><span>{formatPrice(tax())}</span></div>
            </div>
            <Divider />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span><span>{formatPrice(total())}</span>
            </div>
            <Button onClick={placeOrder} loading={placing} variant="gold" size="lg" fullWidth leftIcon={<Lock size={16} />}>
              Place Order
            </Button>
            <p className="text-xs text-center text-surface-400">By placing your order you agree to our Terms of Service.</p>
          </div>
        </div>
      </div>
    </Container>
  );
}
