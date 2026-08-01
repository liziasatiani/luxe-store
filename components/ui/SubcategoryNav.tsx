import Link from "next/link";
import { cn } from "@/lib/utils";

interface Subcategory {
  name: string;
  slug: string;
  count: number;
}

interface Props {
  basePath: string; // e.g. "/beauty" or "/tech"
  all: { label: string; href: string; active: boolean };
  subcategories: Subcategory[];
  activeSlug?: string;
}

export function SubcategoryNav({ basePath, all, subcategories, activeSlug }: Props) {
  return (
    <div className="border-b border-black/8 dark:border-white/8 mb-10 -mx-4 px-4 sm:mx-0 sm:px-0">
      <div className="flex overflow-x-auto gap-0 scrollbar-hide -mb-px">
        {/* All tab */}
        <Link
          href={all.href}
          className={cn(
            "shrink-0 flex flex-col items-center justify-center px-6 py-5 border-b-2 transition-colors group",
            all.active
              ? "border-black dark:border-white text-black dark:text-white"
              : "border-transparent text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white hover:border-black/20 dark:hover:border-white/20"
          )}
        >
          <span className="font-display text-[11px] tracking-[0.18em] uppercase">{all.label}</span>
        </Link>

        {subcategories.map((sc) => {
          const active = sc.slug === activeSlug;
          return (
            <Link
              key={sc.slug}
              href={`${basePath}/${sc.slug}`}
              className={cn(
                "shrink-0 flex flex-col items-center justify-center px-6 py-5 border-b-2 transition-colors group",
                active
                  ? "border-black dark:border-white text-black dark:text-white"
                  : "border-transparent text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white hover:border-black/20 dark:hover:border-white/20"
              )}
            >
              <span className="font-display text-[11px] tracking-[0.18em] uppercase whitespace-nowrap">{sc.name}</span>
              <span className="text-[9px] tracking-[0.08em] mt-1 opacity-50">{sc.count}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
