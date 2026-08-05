import { Container } from "@/components/ui";

export default function BrandLoading() {
  return (
    <Container className="py-12 animate-pulse">
      <div className="flex items-center gap-6 mb-12">
        <div className="w-20 h-20 bg-surface-100 dark:bg-surface-800 rounded-full" />
        <div className="space-y-2">
          <div className="h-8 w-48 bg-surface-100 dark:bg-surface-800 rounded" />
          <div className="h-4 w-64 bg-surface-100 dark:bg-surface-800 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-square bg-surface-100 dark:bg-surface-800 rounded-xl" />
            <div className="h-4 w-3/4 bg-surface-100 dark:bg-surface-800 rounded" />
            <div className="h-4 w-1/2 bg-surface-100 dark:bg-surface-800 rounded" />
          </div>
        ))}
      </div>
    </Container>
  );
}
