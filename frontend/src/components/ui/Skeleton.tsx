import { cn } from "../../lib/cn.js";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-[12px] bg-subtle", className)}
      {...props}
    />
  );
}
