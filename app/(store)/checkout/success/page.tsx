import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Package, ArrowRight, CheckCircle, UserPlus } from "lucide-react";
import { Container } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = { title: "Order Confirmed", robots: { index: false, follow: false } };
import { prisma } from "@/lib/prisma";
import { serializeDecimal, formatPrice, getProductImageUrl } from "@/lib/utils";
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

interface Props {
  searchParams: Promise<{ orderId?: string }>;
}

export default async function SuccessPage({ searchParams }: Props) {
  const { orderId } = await searchParams;
  const session = await auth();
  const t = await getTranslations("orderSuccess");
  const tProduct = await getTranslations("product");
  let order: SerializedOrder | null = null;

  if (orderId) {
    const userId = session?.user?.id;
    const found = userId
      ? await prisma.order.findFirst({ where: { id: orderId, userId }, include: { items: true } })
      : null;
    if (found) order = serializeDecimal(found) as SerializedOrder;
  }

  const upsellProducts = await prisma.product.findMany({
    where: { isActive: true, isBestSeller: true },
    select: { id: true, name: true, slug: true, price: true, comparePrice: true, images: { select: { url: true, isPrimary: true } }, brand: { select: { name: true } } },
    orderBy: { ratingAvg: "desc" },
    take: 4,
  }).then(rows => rows.map(r => serializeDecimal(r)));

  return (
    <Container className="py-20 max-w-lg text-center">
      <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
        <CheckCircle size={40} className="text-green-500" />
      </div>
      <h1 className="font-display text-4xl text-surface-900 dark:text-white mb-4">{t("title")}</h1>
      {order && (
        <p className="text-surface-500 mb-2">
          Order <span className="font-mono font-bold text-surface-900 dark:text-white">#{order.orderNumber}</span>
        </p>
      )}
      <p className="text-surface-500 mb-8">{t("subtitle")}</p>

      {order && (
        <div className="text-left rounded-2xl border border-surface-100 dark:border-surface-800 p-6 mb-8 space-y-3">
          <h3 className="font-semibold text-surface-900 dark:text-white">{t("orderSummary")}</h3>
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-surface-600 dark:text-surface-400">{item.productName} ×{item.quantity}</span>
              <span className="font-medium">{formatPrice(item.totalPrice)}</span>
            </div>
          ))}
          <div className="border-t border-surface-100 dark:border-surface-800 pt-3 flex justify-between font-semibold">
            <span>{t("total")}</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {order && (
          <Button variant="outline" size="lg" leftIcon={<Package size={18} />} asChild>
            <Link href={`/account/orders/${order.id}`}>{t("trackOrder")}</Link>
          </Button>
        )}
        <Button variant="gold" size="lg" rightIcon={<ArrowRight size={18} />} asChild>
          <Link href="/">{t("continueShopping")}</Link>
        </Button>
      </div>

      {!session && order && (
        <div className="mt-10 border border-surface-200 dark:border-surface-700 rounded-2xl p-6 text-left">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center shrink-0">
              <UserPlus size={16} className="text-surface-600 dark:text-surface-400" />
            </div>
            <div>
              <h3 className="font-semibold text-surface-900 dark:text-white text-sm mb-1">{t("saveHistory")}</h3>
              <p className="text-xs text-surface-500 dark:text-surface-400 leading-relaxed mb-4">{t("saveHistoryDesc")}</p>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/register?orderId=${order.id}`}>{t("createAccount")}</Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {upsellProducts.length > 0 && (
        <div className="mt-16 text-left border-t border-surface-100 dark:border-surface-800 pt-12">
          <div className="flex items-baseline justify-between mb-8">
            <div>
              <p className="text-[10px] tracking-[0.22em] uppercase text-brand-500 mb-2">{t("completeCollection")}</p>
              <h2 className="font-display text-2xl text-surface-900 dark:text-white uppercase tracking-[0.04em]">{tProduct("youMayAlsoLike")}</h2>
            </div>
            <Link href="/best" className="hidden sm:flex items-center gap-1 text-[11px] tracking-[0.1em] uppercase text-black dark:text-white hover:opacity-50 transition-opacity">
              {t("viewAll")} <ArrowRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {upsellProducts.map((p) => {
              const img = getProductImageUrl((p as { images?: { url: string; isPrimary?: boolean }[] }).images ?? []);
              const price = formatPrice(Number((p as { price: number }).price));
              return (
                <Link key={(p as { id: string }).id} href={`/products/${(p as { slug: string }).slug}`} className="group block">
                  <div className="relative aspect-square bg-surface-50 dark:bg-surface-800 overflow-hidden mb-3">
                    {img && (
                      <Image src={img} alt={(p as { name: string }).name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="200px" />
                    )}
                  </div>
                  <p className="text-[10px] tracking-[0.1em] uppercase text-surface-400 mb-1">{(p as { brand?: { name: string } }).brand?.name}</p>
                  <p className="text-sm text-surface-900 dark:text-white leading-snug mb-1 line-clamp-2">{(p as { name: string }).name}</p>
                  <p className="text-sm font-medium text-surface-900 dark:text-white">{price}</p>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </Container>
  );
}
