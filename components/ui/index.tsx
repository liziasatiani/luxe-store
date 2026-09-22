"use client";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "gold" | "success" | "warning" | "error" | "outline";
  size?: "sm" | "md";
  className?: string;
}
export function Badge({ children, variant = "default", size = "sm", className }: BadgeProps) {
  const v = {
    default: "bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-surface-300",
    gold:    "bg-gradient-gold text-white",
    success: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    error:   "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    outline: "border border-surface-300 dark:border-surface-700 text-surface-600 dark:text-surface-400",
  };
  const s = { sm: "text-xs px-2 py-0.5 rounded-full", md: "text-xs px-3 py-1 rounded-full" };
  return (
    <span className={cn("inline-flex items-center font-medium", v[variant], s[size], className)}>
      {children}
    </span>
  );
}

export function Spinner({ size = 20, className }: { size?: number; className?: string }) {
  return <Loader2 size={size} className={cn("animate-spin text-brand-500", className)} />;
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-xl bg-surface-100 dark:bg-surface-800", className)} />
  );
}

export function Container({
  children,
  className,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}) {
  return (
    <Tag className={cn("mx-auto w-full max-w-screen-xl px-4 sm:px-6 lg:px-8", className)}>
      {children}
    </Tag>
  );
}

export function RatingStars({
  rating,
  count,
  size = 14,
  showCount = true,
}: {
  rating?: number;
  count?: number;
  size?: number;
  showCount?: boolean;
}) {
  const r = rating ?? 0;
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={star <= Math.round(r) ? "#c4821f" : "none"}
            stroke="#c4821f"
            strokeWidth={1.5}
          >
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
          </svg>
        ))}
      </div>
      {showCount && count !== undefined && (
        <span className="text-xs text-surface-400">({count.toLocaleString()})</span>
      )}
    </div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}
export function Input({ label, error, leftIcon, rightIcon, className, id, ...props }: InputProps) {
  const errorId = error && id ? `${id}-error` : undefined;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400">{leftIcon}</span>
        )}
        <input
          id={id}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={errorId}
          className={cn(
            "w-full h-11 rounded-xl border bg-white dark:bg-surface-900 text-surface-900 dark:text-white",
            "border-surface-200 dark:border-surface-700",
            "focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500",
            "placeholder:text-surface-400 transition-colors",
            "text-base", // ≥16px prevents iOS auto-zoom on focus
            leftIcon && "pl-10",
            rightIcon && "pr-10",
            !leftIcon && "pl-4",
            !rightIcon && "pr-4",
            error && "border-red-500 focus:ring-red-500/30",
            className
          )}
          {...props}
        />
        {rightIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400">{rightIcon}</span>
        )}
      </div>
      {error && <p id={errorId} role="alert" className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export { Price } from "./Price";
