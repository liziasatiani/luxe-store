"use client";
import { useCurrencyStore } from "@/store";
import { GEL_RATE, formatPrice } from "@/lib/utils";

export function useCurrency() {
  const { currency, setCurrency } = useCurrencyStore();

  function format(usdAmount: number | string | null | undefined): string {
    const num = typeof usdAmount === "string" ? parseFloat(usdAmount) : (usdAmount ?? 0);
    if (isNaN(num)) return currency === "GEL" ? "₾0.00" : "$0.00";
    if (currency === "GEL") return "₾" + (num * GEL_RATE).toFixed(2);
    return formatPrice(num, "USD", "en-US");
  }

  return { currency, setCurrency, format };
}
