import Link from "next/link";

interface Subcategory {
  name: string;
  slug: string;
  count: number;
}

interface Props {
  basePath: string;
  all: { label: string; href: string; active: boolean };
  subcategories: Subcategory[];
  activeSlug?: string;
}

export function SubcategoryNav({ basePath, all, subcategories, activeSlug }: Props) {
  return (
    <div style={{ borderBottom: "1px solid var(--border)", marginBottom: 48 }}>
      <div style={{ display: "flex", overflowX: "auto", gap: 0 }}>
        <Link
          href={all.href}
          style={{
            flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            padding: "16px 24px", borderBottom: `2px solid ${all.active ? "var(--gold)" : "transparent"}`,
            textDecoration: "none", transition: "border-color 0.2s",
          }}
        >
          <span style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600, color: all.active ? "var(--gold)" : "var(--chalk2)", transition: "color 0.2s" }}>{all.label}</span>
        </Link>

        {subcategories.map((sc) => {
          const active = sc.slug === activeSlug;
          return (
            <Link
              key={sc.slug}
              href={`${basePath}/${sc.slug}`}
              style={{
                flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                padding: "16px 24px", borderBottom: `2px solid ${active ? "var(--gold)" : "transparent"}`,
                textDecoration: "none", transition: "border-color 0.2s",
              }}
            >
              <span style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600, color: active ? "var(--gold)" : "var(--chalk2)", whiteSpace: "nowrap", transition: "color 0.2s" }}>{sc.name}</span>
              <span style={{ fontSize: 9, letterSpacing: "0.06em", marginTop: 3, color: "var(--chalk3)" }}>{sc.count}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
