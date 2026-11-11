import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn.js";

export const badgeVariants = cva(
  "inline-flex items-center gap-1.5 font-mono text-[11px] tracking-wider uppercase select-none rounded-[4px] px-2 py-0.5 border whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-white/[0.03] text-muted border-border",
        accent: "bg-ink text-background font-bold border-white",
        success: "bg-emerald-950/30 text-emerald-300 border-emerald-500/30",
        warning: "bg-amber-950/30 text-amber-300 border-amber-500/30",
        danger: "bg-rose-950/30 text-rose-300 border-rose-500/30",
        info: "bg-sky-950/30 text-sky-300 border-sky-500/30",
        outline: "border-border-strong text-muted bg-transparent",
      },
      size: {
        sm: "px-1.5 py-0.2 text-[10px]",
        default: "px-2 py-0.5 text-[11px]",
        lg: "px-2.5 py-1 text-xs",
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
            "h-1.5 w-1.5 rounded-full shrink-0",
            variant === "success" && "bg-emerald-400",
            variant === "warning" && "bg-amber-400",
            variant === "danger" && "bg-rose-400",
            variant === "info" && "bg-sky-400",
            (!variant || variant === "default") && "bg-white/60",
            variant === "accent" && "bg-black"
          )}
        />
      )}
      {children}
    </div>
  );
}
