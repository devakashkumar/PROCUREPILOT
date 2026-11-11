import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn.js";
import { Loader2 } from "lucide-react";

export const buttonVariants = cva(
  "relative inline-flex items-center justify-center text-center font-semibold tracking-tight transition-all duration-200 select-none overflow-hidden active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none cursor-pointer rounded-[8px]",
  {
    variants: {
      variant: {
        primary:
          "bg-ink text-background font-bold hover:opacity-90 hover:shadow-[0_0_25px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] border border-ink",
        secondary:
          "bg-surface text-ink border border-border hover:border-border-strong hover:bg-surface-elevated",
        accent:
          "bg-ink text-background font-extrabold hover:opacity-90 hover:shadow-[0_0_25px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_0_25px_rgba(255,255,255,0.25)] border border-ink",
        ghost:
          "text-muted hover:text-ink hover:bg-black/5 dark:hover:bg-white/[0.05]",
        danger:
          "bg-rose-950/20 text-rose-500 dark:text-rose-200 border border-rose-500/30 hover:bg-rose-900/30 hover:border-rose-500/50",
        outline:
          "border border-border bg-transparent text-ink hover:border-border-strong hover:bg-surface-elevated",
      },
      size: {
        default: "min-h-[44px] h-auto py-2.5 px-5 text-sm",
        sm: "min-h-[36px] h-auto py-1.5 px-3.5 text-xs font-medium",
        md: "min-h-[40px] h-auto py-2 px-4 text-sm font-medium",
        lg: "min-h-[48px] h-auto py-3 px-6 text-base font-bold",
        icon: "h-9 w-9 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <span className="absolute inset-0 flex items-center justify-center bg-inherit">
            <Loader2 className="h-4 w-4 animate-spin" />
          </span>
        )}
        <span className={cn("inline-flex items-center justify-center gap-2 max-w-full flex-wrap", isLoading && "opacity-0")}>
          {children}
        </span>
      </button>
    );
  }
);
Button.displayName = "Button";
