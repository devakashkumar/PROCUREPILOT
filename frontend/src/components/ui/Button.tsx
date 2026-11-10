import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn.js";
import { Loader2 } from "lucide-react";

export const buttonVariants = cva(
  "relative inline-flex items-center justify-center font-bold tracking-tight transition-all select-none overflow-hidden active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none cursor-pointer",
  {
    variants: {
      variant: {
        primary:
          "bg-ink text-background hover:bg-ink/90 group rounded-[12px] shadow-sm",
        secondary:
          "bg-surface text-ink border border-border hover:border-ink rounded-[12px]",
        accent:
          "bg-accent text-accent-ink font-extrabold hover:bg-accent/90 rounded-[12px] shadow-sm",
        ghost:
          "text-ink hover:bg-subtle rounded-[12px]",
        danger:
          "bg-danger text-white hover:bg-danger/90 rounded-[12px]",
        outline:
          "border border-border text-ink hover:border-ink rounded-[12px]",
      },
      size: {
        default: "h-14 px-6 text-base font-bold",
        sm: "h-10 px-4 text-sm font-semibold",
        md: "h-12 px-5 text-sm font-semibold",
        lg: "h-16 px-8 text-lg font-extrabold",
        icon: "h-11 w-11 p-0",
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
            <Loader2 className="h-5 w-5 animate-spin" />
          </span>
        )}
        <span className={cn("inline-flex items-center gap-2", isLoading && "opacity-0")}>
          {children}
        </span>
      </button>
    );
  }
);
Button.displayName = "Button";
