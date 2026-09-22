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

