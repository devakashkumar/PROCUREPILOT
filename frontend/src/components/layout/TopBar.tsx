import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore.js";
import { ThemeToggle } from "./ThemeToggle.js";
import { formatInr } from "../../lib/format.js";
import { Menu, Sparkles, Wallet } from "lucide-react";
import { Button } from "../ui/Button.js";

interface TopBarProps {
  onMenuClick?: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const { business, user } = useAuthStore();

  return (
    <header className="h-14 border-b border-border bg-background/80 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Zone 1: Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-1.5 rounded-[6px] text-muted hover:text-ink hover:bg-black/5 dark:hover:bg-white/[0.08] cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="md:hidden flex items-center gap-2">
          <span className="font-bold tracking-tight text-sm text-ink truncate max-w-[140px]">
            {business?.name || "ProcurePilot"}
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-muted">
          <span className="text-ink font-medium">Live</span>
          <span className="opacity-40">/</span>
          <span>₹88/USD</span>
        </div>
      </div>

      {/* Zone 2: Center - Subtle Minimal Indicator */}
      <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-muted">
        <span>Purchase Management</span>
      </div>

      {/* Zone 3: Right */}
      <div className="flex items-center gap-3">
        {business && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-[6px] border border-border bg-surface text-xs font-mono text-muted">
            <Wallet className="h-3.5 w-3.5 text-muted" />
            <span className="opacity-60">Cap:</span>
            <span className="font-bold text-ink tabular-nums">{formatInr(business.monthlyBudgetPaise)}</span>
          </div>
        )}

        <Link to="/procure" className="hidden sm:inline-flex">
          <Button variant="accent" size="sm" className="gap-1.5 font-bold text-xs h-8 px-3">
            <Sparkles className="h-3 w-3" />
            <span>Procure</span>
          </Button>
        </Link>

        <ThemeToggle />

        {user && (
          <Link
            to="/settings"
            className="flex items-center gap-2.5 pl-2 border-l border-border group cursor-pointer hover:opacity-85 transition-opacity"
            title="Account & Business Settings"
          >
            <div className="h-8 w-8 rounded-[6px] bg-ink text-background flex items-center justify-center font-mono font-bold text-xs uppercase shadow-sm group-hover:scale-105 transition-transform">
              {user.name.slice(0, 2)}
            </div>
            <div className="hidden xl:block text-left">
              <div className="text-xs font-semibold text-ink leading-tight group-hover:underline underline-offset-2">{user.name}</div>
              <div className="text-[10px] font-mono text-muted uppercase tracking-wider">{user.role}</div>
            </div>
          </Link>
        )}
      </div>
    </header>
  );
}
