import { useAuthStore } from "../../store/authStore.js";
import { ThemeToggle } from "./ThemeToggle.js";
import { Badge } from "../ui/Badge.js";
import { formatInr } from "../../lib/format.js";
import { Menu, Wallet } from "lucide-react";

interface TopBarProps {
  onMenuClick?: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const { business, user } = useAuthStore();

  return (
    <header className="h-18 border-b border-border bg-surface px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg text-ink hover:bg-subtle cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="hidden sm:flex items-center gap-2">
          <Badge variant="accent" dot>
            Sandbox Mode (₹88/USD)
          </Badge>
          <span className="text-xs text-muted font-medium">Deterministic Agent Active</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {business && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-background text-xs font-semibold text-ink">
            <Wallet className="h-3.5 w-3.5 text-muted" />
            <span className="text-muted">Monthly Cap:</span>
            <span className="font-mono font-bold">{formatInr(business.monthlyBudgetPaise)}</span>
          </div>
        )}

        <ThemeToggle />

        {user && (
          <div className="flex items-center gap-2 pl-2 border-l border-border">
            <div className="h-9 w-9 rounded-full bg-ink text-background flex items-center justify-center font-bold text-xs uppercase">
              {user.name.slice(0, 2)}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-bold text-ink leading-tight">{user.name}</div>
              <div className="text-[10px] font-semibold text-muted uppercase tracking-wider">{user.role}</div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
