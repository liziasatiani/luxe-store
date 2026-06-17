import { Container, Skeleton } from "@/components/ui";

export default function Loading() {
  return (
    <Container className="py-12">
      <div className="mb-8 space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y divide-black/8 dark:divide-white/8 border border-black/8 dark:border-white/8">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="p-4 space-y-3">
            <Skeleton className="aspect-square w-full" />
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-5 w-1/3" />
          </div>
        ))}
      </div>
    </Container>
  );
}
