import Link from "next/link";
import { Container } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <Container className="py-32 text-center max-w-lg">
      <p className="font-display text-9xl text-surface-100 dark:text-surface-800 font-bold select-none">404</p>
      <h1 className="font-display text-4xl text-surface-900 dark:text-white -mt-4 mb-4">Page Not Found</h1>
      <p className="text-surface-500 mb-10">The page you're looking for doesn't exist or has been moved.</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button variant="gold" size="lg" leftIcon={<Home size={18} />} asChild>
          <Link href="/">Go Home</Link>
        </Button>
        <Button variant="outline" size="lg" leftIcon={<Search size={18} />} asChild>
          <Link href="/search">Search Products</Link>
        </Button>
      </div>
    </Container>
  );
}
