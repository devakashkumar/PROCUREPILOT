import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Sparkles, Receipt, Package, BarChart3, ShoppingCart } from "lucide-react";
import { cn } from "../../lib/cn.js";

const mobileItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Procure", href: "/procure", icon: Sparkles, highlight: true },
  { label: "Cart", href: "/cart", icon: ShoppingCart },
  { label: "Orders", href: "/orders", icon: Receipt },
  { label: "Products", href: "/products", icon: Package },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
];

export function MobileNav() {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/90 backdrop-blur-xl border-t border-border px-2 py-1 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] flex items-center justify-around">
      {mobileItems.map((item) => {
        const isActive = location.pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-[6px] text-[10px] font-mono transition-colors select-none",
              isActive ? "text-ink font-bold" : "text-muted hover:text-ink"
            )}
          >
            <div
              className={cn(
                "p-1 rounded-[4px] transition-colors",
                isActive && "bg-ink text-background",
                item.highlight && !isActive && "text-ink"
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={2} />
            </div>
            <span className="truncate max-w-[50px]">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
