import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-ink-300/15 bg-surface shadow-sm shadow-ink-900/5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function Badge({
  className,
  children,
  tone = "brand",
}: {
  className?: string;
  children: ReactNode;
  tone?: "brand" | "accent" | "neutral" | "success";
}) {
  const tones = {
    brand: "bg-brand-100 text-brand-700 dark:bg-brand-200/40 dark:text-brand-300",
    accent: "bg-accent-400/15 text-accent-600 dark:text-accent-300",
    neutral: "bg-ink-900/5 text-ink-700",
    success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  } as const;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
