"use client";
import { useEffect } from "react";

export function PWAInit() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .catch(() => {/* silently ignore SW registration failures in dev */});
    }
  }, []);
  return null;
}
