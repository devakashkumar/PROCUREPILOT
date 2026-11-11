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
  Settings as SettingsIcon,
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
  { label: "Settings", href: "/settings", icon: SettingsIcon },
];

export function Sidebar({ className }: { className?: string }) {
  const location = useLocation();
  const { business, logout } = useAuthStore();

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col justify-between w-60 border-r border-border bg-background-obsidian h-screen sticky top-0 px-3.5 py-5 select-none",
        className
      )}
    >
      <div>
        {/* Brand Header */}
        <Link to="/dashboard" className="flex items-center gap-2.5 px-2.5 mb-7 group">
          <img src="/logo.png" alt="ProcurePilot" className="h-7 w-7 object-contain" />
          <span className="text-base font-extrabold tracking-tight text-ink">
            ProcurePilot
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
                  "relative flex items-center gap-2.5 px-3 py-2 rounded-[6px] text-xs font-medium transition-all duration-150",
                  isActive
                    ? "text-ink font-semibold"
                    : "text-muted hover:text-ink hover:bg-black/5 dark:hover:bg-white/[0.03]",
                  item.highlight && !isActive && "text-ink/80"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-indicator"
                    className="absolute inset-0 rounded-[6px] bg-neutral-200/50 dark:bg-white/[0.06] border border-border"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon
                  className={cn(
                    "relative z-10 h-4 w-4",
                    isActive ? "text-ink" : "text-muted",
                    item.highlight && isActive ? "text-ink" : ""
                  )}
                  strokeWidth={2}
                />
                <span className="relative z-10">{item.label}</span>
                {item.highlight && (
                  <span className="relative z-10 ml-auto font-mono text-[9px] uppercase tracking-widest text-muted">
                    AI
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Business Account & Sign Out footer */}
      <div className="border-t border-border pt-4 px-2">
        {business && (
          <div className="mb-3">
            <div className="text-xs font-semibold text-ink truncate">{business.name}</div>
            <div className="text-[10px] font-mono text-muted uppercase tracking-wider">{business.type}</div>
          </div>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-2 w-full px-2 py-1.5 rounded-[6px] text-xs font-medium text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
