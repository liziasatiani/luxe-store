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
      .then((d) => {
        setResults(d.data?.products ?? []);
        setLoading(false);
      })
      .catch((err) => {
        // An aborted request has been superseded; the newer one owns the state.
        if (err?.name !== "AbortError") setLoading(false);
      });
    return () => ctrl.abort();
  }, [debouncedQuery]);

  return { query, setQuery, results, loading };
}

const MS_PER_HOUR = 3_600_000;
const MS_PER_MINUTE = 60_000;
const MS_PER_SECOND = 1_000;

export function useCountdown(target: Date) {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const targetTime = target.getTime();

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, targetTime - Date.now());
      setHours(Math.floor(diff / MS_PER_HOUR));
      setMinutes(Math.floor((diff % MS_PER_HOUR) / MS_PER_MINUTE));
      setSeconds(Math.floor((diff % MS_PER_MINUTE) / MS_PER_SECOND));
    };
    tick();
    const id = setInterval(tick, MS_PER_SECOND);
    return () => clearInterval(id);
  }, [targetTime]);

  return { h: hours, m: minutes, s: seconds };
}
