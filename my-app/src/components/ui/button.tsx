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
  focus = "focus-visible:outline-none focus-visible:ring-0",
  sizes: Record<Size, string> = {
    sm: "h-8 px-3",
    md: "h-9 px-3.5",
    lg: "h-10 px-4",
  },
  variants: Record<Variant, string> = {
    default:
      "bg-emerald-600 text-white hover:bg-emerald-500 border border-emerald-700",
    outline:
      "bg-transparent text-neutral-200 border border-neutral-700 hover:bg-neutral-800/40",
    ghost: "bg-transparent text-neutral-200 hover:bg-neutral-800/50 border border-transparent",
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
