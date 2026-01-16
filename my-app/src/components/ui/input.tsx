import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;


export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)]",
        "px-3 py-1 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)]",
        "outline-none ring-0 focus-visible:border-[var(--color-border-strong)] focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
