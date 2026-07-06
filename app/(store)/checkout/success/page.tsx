import Link from "next/link";
import { Package, ArrowRight, CheckCircle } from "lucide-react";
import { Container } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { prisma } from "@/lib/prisma";
import { serializeDecimal, formatPrice } from "@/lib/utils";
import { auth } from "@/lib/auth";

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  totalPrice: number;
}

interface SerializedOrder {
  id: string;
  orderNumber: string;
  total: number;
  items: OrderItem[];
}

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: { orderId?: string };
}) {
  const session = await auth();
  let order: SerializedOrder | null = null;

  if (searchParams.orderId && session?.user?.id) {
    const found = await prisma.order.findFirst({
      where: { id: searchParams.orderId, userId: session.user.id },
      include: { items: true },
    });
    if (found) order = serializeDecimal(found) as SerializedOrder;
  }

  return (
    <Container className="py-20 max-w-lg text-center">
      <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
        <CheckCircle size={40} className="text-green-500" />
      </div>
      <h1 className="font-display text-4xl text-surface-900 dark:text-white mb-4">Order Confirmed!</h1>
      {order && (
        <p className="text-surface-500 mb-2">
          Order <span className="font-mono font-bold text-surface-900 dark:text-white">#{order.orderNumber}</span>
        </p>
      )}
      <p className="text-surface-500 mb-8">
        Thank you for your order. You'll receive a confirmation email shortly.
      </p>

      {order && (
        <div className="text-left rounded-2xl border border-surface-100 dark:border-surface-800 p-6 mb-8 space-y-3">
          <h3 className="font-semibold text-surface-900 dark:text-white">Order Summary</h3>
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-surface-600 dark:text-surface-400">
                {item.productName} ×{item.quantity}
              </span>
              <span className="font-medium">{formatPrice(item.totalPrice)}</span>
            </div>
          ))}
          <div className="border-t border-surface-100 dark:border-surface-800 pt-3 flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {order && (
          <Button variant="outline" size="lg" leftIcon={<Package size={18} />} asChild>
            <Link href={`/account/orders/${order.id}`}>Track Order</Link>
          </Button>
        )}
        <Button variant="gold" size="lg" rightIcon={<ArrowRight size={18} />} asChild>
          <Link href="/">Continue Shopping</Link>
        </Button>
      </div>
    </Container>
  );
}
