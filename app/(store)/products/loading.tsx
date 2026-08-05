import { Container, Skeleton } from "@/components/ui";

export default function Loading() {
  return (
    <Container className="py-12 max-w-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Skeleton className="aspect-square w-full rounded-3xl" />
        <div className="space-y-4 py-4">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-32" />
          <div className="space-y-2 pt-4">
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
          </div>
        </div>
      </div>
    </Container>
  );
}
