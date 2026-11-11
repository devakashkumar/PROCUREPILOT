import { cn } from "../../lib/cn.js";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-[6px] bg-surface-elevated border border-white/[0.04]", className)}
      {...props}
    />
  );
}
