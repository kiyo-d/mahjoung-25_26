import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "outline";
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const styles =
      variant === "outline"
        ? "border border-neutral-600 bg-transparent text-neutral-200"
        : "bg-neutral-800 text-neutral-100 border border-neutral-600";
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
          styles,
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";
