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
          <label className="text-xs font-bold uppercase tracking-wider text-muted">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {startIcon && (
            <div className="pointer-events-none absolute left-4 flex items-center text-muted">
              {startIcon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              "flex h-12 sm:h-14 w-full rounded-[12px] border border-border bg-surface px-4 py-2 text-sm sm:text-base text-ink placeholder:text-muted/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink disabled:cursor-not-allowed disabled:opacity-50",
              startIcon && "pl-11",
              error && "border-danger focus-visible:ring-danger",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {helperText && !error && (
          <span className="text-[11px] text-muted">{helperText}</span>
        )}
        {error && <span className="text-xs font-semibold text-danger">{error}</span>}
      </div>
    );
  }
);
Input.displayName = "Input";
