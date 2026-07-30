"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import type { ProductCard } from "@/types";

export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export function useScrolled(threshold = 80): boolean {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > threshold);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [threshold]);
  return scrolled;
}

export function useClickOutside<T extends HTMLElement>(callback: () => void) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) callback();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [callback]);
  return ref;
}

export function useSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductCard[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 350);

  useEffect(() => {
    if (!debouncedQuery.trim()) { setResults([]); return; }
    const ctrl = new AbortController();
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}&limit=8`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((d) => setResults(d.data?.products ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [debouncedQuery]);

  return { query, setQuery, results, loading };
}

export function useCountdown(target: Date) {
  const [h, setH] = useState(0);
  const [m, setM] = useState(0);
  const [s, setS] = useState(0);
  const targetTime = target.getTime();

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, targetTime - Date.now());
      setH(Math.floor(diff / 3600000));
      setM(Math.floor((diff % 3600000) / 60000));
      setS(Math.floor((diff % 60000) / 1000));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetTime]);

  return { h, m, s };
}

export function useCartSync() {
  const [syncing, setSyncing] = useState(false);
  const syncToServer = useCallback(async (items: unknown[]) => {
    setSyncing(true);
    try {
      await fetch("/api/cart/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
    } finally {
      setSyncing(false);
    }
  }, []);
  return { syncing, syncToServer };
}
