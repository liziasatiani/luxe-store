"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { CheckCircle, CreditCard, Truck, Lock } from "lucide-react";
import { Container, Input, Divider, Spinner } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/store";
import { formatPrice } from "@/lib/utils";
import { STRIPE_ENABLED } from "@/lib/stripe";
import toast from "react-hot-toast";

interface Address { id: string; label: string; firstName: string; lastName: string; line1: string; city: string; state: string; postalCode: string; country: string }

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { items, subtotal, discount, shipping, tax, total, coupon, clearCart } = useCartStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"STRIPE" | "CASH_ON_DELIVERY">(STRIPE_ENABLED ? "STRIPE" : "CASH_ON_DELIVERY");
  const [notes, setNotes] = useState("");
  const [placing, setPlacing] = useState(false);
  const [newAddress, setNewAddress] = useState({ firstName: "", lastName: "", line1: "", city: "", state: "", postalCode: "", country: "US" });
  const [useNewAddress, setUseNewAddress] = useState(false);

  useEffect(() => {
    if (session) {
      fetch("/api/account/addresses").then(r => r.json()).then(d => {
        setAddresses(d.data?.addresses ?? []);
        const def = d.data?.addresses?.find((a: Address) => a);
        if (def) setSelectedAddress(def.id);
      });
    }
  }, [session]);

  if (status === "loading") return <div className="flex justify-center py-20"><Spinner /></div>;
  if (!session) {
    router.push("/login?redirect=/checkout");
    return null;
  }
  if (items.length === 0) {
    router.push("/cart");
    return null;
  }

  const placeOrder = async () => {
    if (!selectedAddress && !useNewAddress) { toast.error("Please select or enter a shipping address"); return; }
    setPlacing(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addressId: useNewAddress ? undefined : selectedAddress,
          newAddress: useNewAddress ? newAddress : undefined,
          paymentMethod,
          couponCode: coupon?.code,
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const orderId = data.data.order.id;

      if (paymentMethod === "STRIPE" && STRIPE_ENABLED) {
        const stripeRes = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId }),
        });
        const stripeData = await stripeRes.json();
        if (stripeData.data?.url) {
          window.location.href = stripeData.data.url;
          return;
        }
      }

      clearCart();
      router.push(`/checkout/success?orderId=${orderId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to place order");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <Container className="py-12 max-w-5xl">
      <h1 className="font-display text-4xl text-surface-900 dark:text-white mb-10">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Left — form */}
        <div className="lg:col-span-3 space-y-8">
          {/* Shipping */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Truck size={20} className="text-brand-500" />
              <h2 className="font-semibold text-lg text-surface-900 dark:text-white">Shipping Address</h2>
            </div>

            {addresses.length > 0 && !useNewAddress && (
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
                <button onClick={() => setUseNewAddress(true)} className="text-sm text-brand-500 hover:text-brand-600">+ Use a different address</button>
              </div>
            )}

            {(useNewAddress || addresses.length === 0) && (
              <div className="grid grid-cols-2 gap-4">
                <Input label="First Name" value={newAddress.firstName} onChange={e => setNewAddress(p => ({ ...p, firstName: e.target.value }))} />
                <Input label="Last Name" value={newAddress.lastName} onChange={e => setNewAddress(p => ({ ...p, lastName: e.target.value }))} />
                <div className="col-span-2"><Input label="Address" value={newAddress.line1} onChange={e => setNewAddress(p => ({ ...p, line1: e.target.value }))} /></div>
                <Input label="City" value={newAddress.city} onChange={e => setNewAddress(p => ({ ...p, city: e.target.value }))} />
                <Input label="State" value={newAddress.state} onChange={e => setNewAddress(p => ({ ...p, state: e.target.value }))} />
                <Input label="Postal Code" value={newAddress.postalCode} onChange={e => setNewAddress(p => ({ ...p, postalCode: e.target.value }))} />
                <Input label="Country" value={newAddress.country} onChange={e => setNewAddress(p => ({ ...p, country: e.target.value }))} />
                {addresses.length > 0 && <button onClick={() => setUseNewAddress(false)} className="text-sm text-surface-500 col-span-2">← Use saved address</button>}
              </div>
            )}
          </section>

          {/* Payment */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <CreditCard size={20} className="text-brand-500" />
              <h2 className="font-semibold text-lg text-surface-900 dark:text-white">Payment</h2>
            </div>
            <div className="space-y-3">
              {STRIPE_ENABLED && (
                <label className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${paymentMethod === "STRIPE" ? "border-brand-500 bg-brand-50 dark:bg-brand-900/10" : "border-surface-200 dark:border-surface-700"}`}>
                  <input type="radio" checked={paymentMethod === "STRIPE"} onChange={() => setPaymentMethod("STRIPE")} className="text-brand-500" />
                  <CreditCard size={18} />
                  <span className="font-medium text-sm">Credit / Debit Card</span>
                  <div className="ml-auto flex gap-1 text-xs text-surface-400">Visa · Mastercard · Amex</div>
                </label>
              )}
              <label className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${paymentMethod === "CASH_ON_DELIVERY" ? "border-brand-500 bg-brand-50 dark:bg-brand-900/10" : "border-surface-200 dark:border-surface-700"}`}>
                <input type="radio" checked={paymentMethod === "CASH_ON_DELIVERY"} onChange={() => setPaymentMethod("CASH_ON_DELIVERY")} className="text-brand-500" />
                <Truck size={18} />
                <span className="font-medium text-sm">Cash on Delivery</span>
              </label>
            </div>
          </section>

          {/* Notes */}
          <Input label="Order notes (optional)" placeholder="Any special instructions…" value={notes} onChange={e => setNotes(e.target.value)} />
        </div>

        {/* Right — summary */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 rounded-2xl border border-surface-100 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 space-y-4">
            <h2 className="font-semibold text-surface-900 dark:text-white">Order Summary</h2>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-surface-600 dark:text-surface-400 line-clamp-1 flex-1 mr-2">{item.product.name} ×{item.quantity}</span>
                  <span className="font-medium shrink-0">{formatPrice(Number(item.product.price) * item.quantity)}</span>
                </div>
              ))}
            </div>
            <Divider />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-surface-500">Subtotal</span><span>{formatPrice(subtotal())}</span></div>
              {discount() > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>−{formatPrice(discount())}</span></div>}
              <div className="flex justify-between"><span className="text-surface-500">Shipping</span><span>{shipping() === 0 ? "FREE" : formatPrice(shipping())}</span></div>
              <div className="flex justify-between"><span className="text-surface-500">Tax</span><span>{formatPrice(tax())}</span></div>
            </div>
            <Divider />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span><span>{formatPrice(total())}</span>
            </div>
            <Button onClick={placeOrder} loading={placing} variant="gold" size="lg" fullWidth leftIcon={<Lock size={16} />}>
              {paymentMethod === "STRIPE" ? "Pay Securely" : "Place Order"}
            </Button>
            <p className="text-xs text-center text-surface-400">By placing your order, you agree to our Terms of Service and Privacy Policy.</p>
          </div>
        </div>
      </div>
    </Container>
  );
}
