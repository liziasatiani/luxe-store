import { Container } from "@/components/ui";

export default function ProductLoading() {
  return (
    <Container className="py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
        <div className="aspect-square bg-surface-100 dark:bg-surface-800 rounded-2xl" />
        <div className="space-y-4">
          <div className="h-4 w-24 bg-surface-100 dark:bg-surface-800 rounded" />
          <div className="h-8 w-3/4 bg-surface-100 dark:bg-surface-800 rounded" />
          <div className="h-6 w-1/4 bg-surface-100 dark:bg-surface-800 rounded" />
          <div className="h-24 bg-surface-100 dark:bg-surface-800 rounded" />
          <div className="h-12 bg-surface-100 dark:bg-surface-800 rounded-xl" />
        </div>
      </div>
    </Container>
  );
}
