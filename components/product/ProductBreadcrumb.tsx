"use client";
import Link from "next/link";

interface Crumb { name: string; url: string; }

export function ProductBreadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "var(--chalk2)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 44 }}>
      {crumbs.map((crumb, i) => (
        <span key={crumb.url} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          {i > 0 && <span style={{ opacity: 0.3 }}>/</span>}
          {i < crumbs.length - 1
            ? <Link href={crumb.url} className="transition-colors hover:text-[var(--chalk)]" style={{ color: "var(--chalk2)" }}>{crumb.name}</Link>
            : <span style={{ color: "var(--chalk)" }}>{crumb.name}</span>
          }
        </span>
      ))}
    </div>
  );
}
