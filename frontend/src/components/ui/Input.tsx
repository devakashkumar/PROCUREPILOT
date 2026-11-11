import * as React from "react";
import { cn } from "../../lib/cn.js";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  startIcon?: React.ReactNode;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, startIcon, helperText, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-[11px] font-mono font-medium uppercase tracking-wider text-muted">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {startIcon && (
            <div className="pointer-events-none absolute left-3.5 flex items-center text-muted">
              {startIcon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              "flex h-11 w-full rounded-[8px] border border-border bg-surface px-3.5 py-2 text-sm text-ink placeholder:text-muted transition-all duration-200 focus-visible:outline-none focus-visible:border-ink focus-visible:ring-1 focus-visible:ring-ink/20 disabled:cursor-not-allowed disabled:opacity-50",
              startIcon && "pl-10",
              error && "border-rose-500 focus-visible:border-rose-400 focus-visible:ring-rose-400/40",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {helperText && !error && (
          <span className="text-[11px] text-muted font-sans">{helperText}</span>
        )}
        {error && <span className="text-xs font-medium text-rose-500 dark:text-rose-400">{error}</span>}
      </div>
    );
  }
);
Input.displayName = "Input";
