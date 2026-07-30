"use client";
import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={36} className="text-red-500" />
        </div>
        <h1 className="font-display text-4xl text-surface-900 dark:text-white mb-4">Something went wrong</h1>
        <p className="text-surface-500 mb-8">We encountered an unexpected error. Please try again or go back home.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} variant="gold" size="lg" leftIcon={<RefreshCw size={18} />}>Try Again</Button>
          <Button variant="outline" size="lg" leftIcon={<Home size={18} />} asChild>
            <Link href="/">Go Home</Link>
          </Button>
        </div>
        {error.digest && <p className="text-xs text-surface-300 mt-6">Error ID: {error.digest}</p>}
      </div>
    </div>
  );
}
