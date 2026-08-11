"use client";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface Subcategory { name: string; slug: string; count: number }

export interface CategoryGroup {
  label: string;
  allLabel: string;
  allHref: string;
  basePath: string;
  subcategories: Subcategory[];
  activeSubcategorySlug?: string;
  isGroupActive?: boolean;
}

export function CategoryNav({ groups }: { groups: CategoryGroup[] }) {
  const t = useTranslations("filters");
  if (!groups || groups.length === 0) return null;
  return (
    <div className="border-b border-black/8 dark:border-white/8 pb-5 mb-6">
      <p className="text-[11px] tracking-[0.12em] uppercase text-black dark:text-white mb-4">{t("category")}</p>
      <div className="space-y-5">
        {groups.map((group) => (
          <div key={group.basePath}>
            <Link
              href={group.allHref}
              className={cn(
                "text-[10px] tracking-[0.15em] uppercase mb-1.5 block transition-colors",
                group.isGroupActive
                  ? "text-black dark:text-white font-semibold"
                  : "text-black/35 dark:text-white/35 hover:text-black dark:hover:text-white"
              )}
            >
              {group.label}
            </Link>
            <div className="space-y-0.5">
              <Link
                href={group.allHref}
                className={cn(
                  "flex items-center justify-between py-1 text-sm transition-colors",
                  group.isGroupActive && !group.activeSubcategorySlug
                    ? "text-black dark:text-white font-medium"
                    : "text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white"
                )}
              >
                <span>{group.allLabel}</span>
              </Link>
              {group.subcategories.map((sc) => (
                <Link
                  key={sc.slug}
                  href={`${group.basePath}/${sc.slug}`}
                  className={cn(
                    "flex items-center justify-between py-1 text-sm transition-colors",
                    group.activeSubcategorySlug === sc.slug
                      ? "text-black dark:text-white font-medium"
                      : "text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white"
                  )}
                >
                  <span>{sc.name}</span>
                  <span className="text-[11px] text-black/30 dark:text-white/30">{sc.count}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
