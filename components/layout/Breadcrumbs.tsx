import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem { name: string; url: string }

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center flex-wrap gap-1">
        {items.map((item, i) => (
          <li key={item.url} className="flex items-center gap-1">
            {i > 0 && <ChevronRight size={14} className="text-surface-300 dark:text-surface-600" />}
            {i === items.length - 1 ? (
              <span className="text-sm text-surface-500 line-clamp-1">{item.name}</span>
            ) : (
              <Link href={item.url} className="text-sm text-surface-500 hover:text-surface-900 dark:hover:text-white transition-colors">
                {item.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
