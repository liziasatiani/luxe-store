"use client";
import { useState, useEffect } from "react";
import { RefreshCw, Save, CheckCircle, AlertTriangle } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface RateData {
  USD_GEL: number;
  EUR_GEL: number;
  USD_EUR: number;
  source: "live" | "cache" | "stale" | "fallback" | "manual";
  updatedAt: string | null;
}

export default function AdminSettings() {
  const [rates, setRates] = useState<RateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [usdGel, setUsdGel] = useState("");
  const [eurGel, setEurGel] = useState("");

  useEffect(() => {
    fetch("/api/rates")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setRates(d.data);
          setUsdGel(String(d.data.USD_GEL));
          setEurGel(String(d.data.EUR_GEL));
        }
      })
      .catch(() => setError("Failed to load rates"))
      .finally(() => setLoading(false));
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    setError(null);
    try {
      const r = await fetch("/api/rates?force=true");
      const d = await r.json();
      if (d.success) {
        setRates(d.data);
        setUsdGel(String(d.data.USD_GEL));
        setEurGel(String(d.data.EUR_GEL));
      } else {
        setError("Refresh failed — API may be down");
      }
    } catch {
      setError("Network error during refresh");
    } finally {
      setRefreshing(false);
    }
  }

  async function handleSave() {
    const parsedUsd = parseFloat(usdGel);
    const parsedEur = parseFloat(eurGel);
    if (isNaN(parsedUsd) || parsedUsd <= 0 || isNaN(parsedEur) || parsedEur <= 0) {
      setError("Enter valid positive numbers for both rates");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const r = await fetch("/api/rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ USD_GEL: parsedUsd, EUR_GEL: parsedEur }),
      });
      const d = await r.json();
      if (d.success) {
        setRates(d.data);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(d.error ?? "Save failed");
      }
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  const sourceLabel: Record<string, string> = {
    live: "Live — fetched now",
    cache: "Cached — within 24h",
    stale: "Stale — API was down",
    fallback: "Hardcoded fallback",
    manual: "Manually set",
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-display font-bold text-surface-900 dark:text-white mb-1">Settings</h1>
      <p className="text-sm text-surface-400 mb-8">Site configuration and exchange rates</p>

      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-semibold text-surface-900 dark:text-white">Exchange Rates</h2>
            <p className="text-xs text-surface-400 mt-0.5">Rates are cached 24h via frankfurter.app</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold tracking-wide uppercase border border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-300 hover:text-surface-900 dark:hover:text-white hover:border-surface-400 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Fetching…" : "Refresh Now"}
          </button>
        </div>

        {loading ? (
          <div className="h-32 flex items-center justify-center text-surface-400 text-sm">Loading…</div>
        ) : (
          <>
            {rates && (
              <div className="mb-5 p-3 rounded-lg bg-surface-50 dark:bg-surface-800 flex items-center justify-between">
                <div className="text-xs text-surface-500">
                  <span className="font-medium text-surface-700 dark:text-surface-300">
                    {sourceLabel[rates.source] ?? rates.source}
                  </span>
                  {rates.updatedAt && (
                    <span className="ml-2 text-surface-400">· {formatDate(rates.updatedAt)}</span>
                  )}
                </div>
                <div className="text-xs text-surface-400">
                  1 USD = {rates.USD_EUR.toFixed(4)} EUR
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs font-semibold tracking-widest uppercase text-surface-400 mb-2">
                  1 USD → GEL (₾)
                </label>
                <input
                  type="number"
                  step="0.0001"
                  min="0"
                  value={usdGel}
                  onChange={(e) => setUsdGel(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-transparent border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-widest uppercase text-surface-400 mb-2">
                  1 EUR → GEL (₾)
                </label>
                <input
                  type="number"
                  step="0.0001"
                  min="0"
                  value={eurGel}
                  onChange={(e) => setEurGel(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-transparent border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-500 mb-4">
                <AlertTriangle size={14} /> {error}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold tracking-widest uppercase bg-surface-900 dark:bg-white text-white dark:text-surface-900 hover:opacity-80 transition-opacity disabled:opacity-50"
              >
                <Save size={13} />
                {saving ? "Saving…" : "Save Manual Rates"}
              </button>
              {saved && (
                <div className="flex items-center gap-1.5 text-green-500 text-xs font-medium">
                  <CheckCircle size={13} /> Saved
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
