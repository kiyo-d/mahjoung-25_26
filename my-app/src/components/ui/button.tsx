import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "outline" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const base =
  "inline-flex items-center justify-center gap-1 whitespace-nowrap select-none",
  shape = "rounded-md",
  font = "text-sm font-medium",
  disabled = "disabled:pointer-events-none disabled:opacity-50",
  focus = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]",
  sizes: Record<Size, string> = {
    sm: "h-8 px-3",
    md: "h-9 px-3.5",
    lg: "h-10 px-4",
  },
  variants: Record<Variant, string> = {
    default:
      "bg-[var(--color-text)] text-white hover:opacity-90 border border-[var(--color-text)]",
    outline:
      "bg-transparent text-[var(--color-text)] border border-[var(--color-border-strong)] hover:bg-[var(--color-surface-muted)]",
    ghost: "bg-transparent text-[var(--color-text-subtle)] hover:bg-[var(--color-surface-muted)] border border-transparent",
    destructive:
      "bg-rose-600 text-white hover:bg-rose-500 border border-rose-700",
  };

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(base, shape, font, disabled, focus, sizes[size], variants[variant], className)}
      {...props}
    />
  )
);
Button.displayName = "Button";
