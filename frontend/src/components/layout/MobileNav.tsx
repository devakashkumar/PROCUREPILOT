import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Sparkles, Receipt, Package, BarChart3 } from "lucide-react";
import { cn } from "../../lib/cn.js";

const mobileItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Procure", href: "/procure", icon: Sparkles, highlight: true },
  { label: "Orders", href: "/orders", icon: Receipt },
  { label: "Products", href: "/products", icon: Package },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
];

export function MobileNav() {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-border px-2 py-2 flex items-center justify-around">
      {mobileItems.map((item) => {
        const isActive = location.pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-xl text-[11px] font-bold transition-colors select-none",
              isActive ? "text-ink" : "text-muted",
              item.highlight && "text-accent-ink"
            )}
          >
            <div
              className={cn(
                "p-1.5 rounded-full",
                item.highlight && "bg-accent text-accent-ink",
                isActive && !item.highlight && "bg-subtle text-ink"
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={2.25} />
            </div>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
