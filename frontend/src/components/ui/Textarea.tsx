import * as React from "react";
import { cn } from "../../lib/cn.js";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-[11px] font-mono font-medium uppercase tracking-wider text-muted">
            {label}
          </label>
        )}
        <textarea
          className={cn(
            "flex min-h-[90px] w-full rounded-[8px] border border-border bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted transition-all duration-200 focus-visible:outline-none focus-visible:border-ink focus-visible:ring-1 focus-visible:ring-ink/20 disabled:cursor-not-allowed disabled:opacity-50 resize-y",
            error && "border-rose-500 focus-visible:border-rose-400 focus-visible:ring-rose-400/40",
            className
          )}
          ref={ref}
          {...props}
        />
        {helperText && !error && (
          <span className="text-[11px] text-muted font-sans">{helperText}</span>
        )}
        {error && <span className="text-xs font-medium text-rose-500 dark:text-rose-400">{error}</span>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
