import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn.js";

export const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full font-bold uppercase tracking-wider select-none",
  {
    variants: {
      variant: {
        default: "bg-subtle text-ink border border-border",
        accent: "bg-accent text-accent-ink font-extrabold",
        success: "bg-success/10 text-success border border-success/30",
        warning: "bg-warning/10 text-warning border border-warning/30",
        danger: "bg-danger/10 text-danger border border-danger/30",
        info: "bg-info/10 text-info border border-info/30",
        outline: "border border-border text-ink bg-transparent",
      },
      size: {
        sm: "px-2.5 py-0.5 text-[10px]",
        default: "px-3 py-1 text-xs",
        lg: "px-3.5 py-1.5 text-xs font-mono",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export function Badge({ className, variant, size, dot, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            variant === "success" && "bg-success",
            variant === "warning" && "bg-warning",
            variant === "danger" && "bg-danger",
            variant === "info" && "bg-info",
            (!variant || variant === "default") && "bg-ink",
            variant === "accent" && "bg-accent-ink"
          )}
        />
      )}
      {children}
    </div>
  );
}
