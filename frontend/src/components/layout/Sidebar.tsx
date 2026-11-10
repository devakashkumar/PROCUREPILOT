import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Sparkles,
  ShoppingCart,
  Receipt,
  Package,
  Building2,
  BarChart3,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore.js";
import { cn } from "../../lib/cn.js";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Procure", href: "/procure", icon: Sparkles, highlight: true },
  { label: "Cart", href: "/cart", icon: ShoppingCart },
  { label: "Orders", href: "/orders", icon: Receipt },
  { label: "Products", href: "/products", icon: Package },
  { label: "Suppliers", href: "/suppliers", icon: Building2 },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
];

export function Sidebar({ className }: { className?: string }) {
  const location = useLocation();
  const { business, logout } = useAuthStore();

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col justify-between w-64 border-r border-border bg-surface h-screen sticky top-0 px-4 py-6 select-none",
        className
      )}
    >
      <div>
        {/* Brand Header */}
        <Link to="/dashboard" className="flex items-center gap-2 px-3 mb-8 group">
          <div className="h-8 w-8 rounded-lg bg-ink flex items-center justify-center text-accent font-extrabold text-xl">
            P
          </div>
          <span className="text-xl font-extrabold tracking-tight text-ink">
            ProcurePilot<span className="text-accent text-2xl leading-none">.</span>
          </span>
        </Link>

        {/* Navigation items */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "relative flex items-center gap-3 px-4 py-3 rounded-[12px] text-sm font-semibold transition-colors duration-150",
                  isActive
                    ? "text-ink font-bold"
                    : "text-muted hover:text-ink hover:bg-subtle",
                  item.highlight && !isActive && "text-ink"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-indicator"
                    className="absolute inset-0 rounded-[12px] bg-subtle border border-border"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon
                  className={cn(
                    "relative z-10 h-5 w-5",
                    isActive ? "text-ink" : "text-muted",
                    item.highlight && "text-accent-ink"
                  )}
                  strokeWidth={2.25}
                />
                <span className="relative z-10">{item.label}</span>
                {item.highlight && (
                  <span className="relative z-10 ml-auto px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-accent text-accent-ink uppercase">
                    AI
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Business profile and logout */}
      <div className="pt-4 border-t border-border flex flex-col gap-2">
        {business && (
          <div className="px-3 py-2 rounded-[12px] bg-subtle">
            <div className="text-xs font-bold text-ink truncate">{business.name}</div>
            <div className="text-[11px] font-medium text-muted capitalize truncate">
              {business.city} • {business.type}
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-[12px] text-sm font-semibold text-muted hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4" strokeWidth={2.25} />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}
