"use client";
import { useEffect, useState, useCallback } from "react";
import { Search, ChevronLeft, ChevronRight, Mail } from "lucide-react";
import { Input, Spinner, Badge } from "@/components/ui";
import { formatDate, formatPrice } from "@/lib/utils";
import { useDebounce } from "@/hooks";

interface Customer {
  id: string; name: string; email: string; image?: string | null;
  createdAt: string; isActive: boolean;
  _count: { orders: number };
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20", ...(debouncedSearch && { search: debouncedSearch }) });
      const res = await fetch(`/api/admin/customers?${params}`);
      const data = await res.json();
      setCustomers(data.data?.customers ?? []);
      setTotal(data.data?.total ?? 0);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-surface-900 dark:text-white">Customers</h1>
        <p className="text-surface-500 text-sm mt-1">{total} total customers</p>
      </div>

      <div className="w-64"><Input placeholder="Search by name or email…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} leftIcon={<Search size={16} />} /></div>

      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner size={28} /></div>
        ) : (
          <table className="w-full">
            <thead className="bg-surface-50 dark:bg-surface-800/50 border-b border-surface-100 dark:border-surface-800">
              <tr>
                {["Customer", "Orders", "Joined", "Status", ""].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
              {customers.map(c => (
                <tr key={c.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-surface-900 dark:text-white">{c.name}</p>
                    <p className="text-xs text-surface-400">{c.email}</p>
                  </td>
                  <td className="px-4 py-3 text-sm">{c._count.orders} orders</td>
                  <td className="px-4 py-3 text-xs text-surface-400">{formatDate(c.createdAt, { month: "short", day: "numeric", year: "numeric" })}</td>
                  <td className="px-4 py-3"><Badge variant={c.isActive ? "success" : "error"} size="sm">{c.isActive ? "Active" : "Inactive"}</Badge></td>
                  <td className="px-4 py-3">
                    <a href={`mailto:${c.email}`} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500 inline-flex"><Mail size={14} /></a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {total > 20 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-surface-100 dark:border-surface-800">
            <p className="text-xs text-surface-400">Showing {Math.min((page-1)*20+1, total)}–{Math.min(page*20, total)} of {total}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="p-1.5 rounded-lg border border-surface-200 dark:border-surface-700 disabled:opacity-40"><ChevronLeft size={14} /></button>
              <button onClick={() => setPage(p => p+1)} disabled={page * 20 >= total} className="p-1.5 rounded-lg border border-surface-200 dark:border-surface-700 disabled:opacity-40"><ChevronRight size={14} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
