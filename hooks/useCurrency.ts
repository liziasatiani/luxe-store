"use client";
import { useEffect } from "react";
import { useCurrencyStore } from "@/store";
import { formatPrice, formatGEL } from "@/lib/utils";

let ratesFetchPromise: Promise<void> | null = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fetchRatesOnce(setRates: (r: any) => void) {
  if (ratesFetchPromise) return ratesFetchPromise;
  ratesFetchPromise = fetch("/api/rates")
    .then((r) => r.json())
    .then((d) => { if (d.success) setRates(d.data); })
    .catch(() => {});
  return ratesFetchPromise;
}

export function useCurrency() {
  const { currency, rates, setCurrency, setRates } = useCurrencyStore();

  useEffect(() => {
    fetchRatesOnce(setRates);
  }, [setRates]);

  function format(usdAmount: number | string | null | undefined): string {
    const num = typeof usdAmount === "string" ? parseFloat(usdAmount) : (usdAmount ?? 0);
    if (isNaN(num)) {
      if (currency === "GEL") return "₾0.00";
      if (currency === "EUR") return "€0.00";
      return "$0.00";
    }
    if (currency === "GEL") return formatGEL(num, rates.USD_GEL);
    if (currency === "EUR") return "€" + (num * rates.USD_EUR).toFixed(2);
    return formatPrice(num, "USD", "en-US");
  }

  return { currency, setCurrency, format };
}
