"use client";
import { useCurrency } from "@/hooks/useCurrency";

export function Price({ amount, className }: { amount: number | string | null | undefined; className?: string }) {
  const { format } = useCurrency();
  return <span className={className}>{format(amount)}</span>;
}
