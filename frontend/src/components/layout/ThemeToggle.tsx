import { Moon, Sun } from "lucide-react";
import { useUiStore } from "../../store/uiStore.js";
import { motion } from "framer-motion";
import { cn } from "../../lib/cn.js";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useUiStore();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={cn(
        "relative h-9 w-9 rounded-[8px] flex items-center justify-center border transition-all cursor-pointer",
        "border-border bg-surface text-ink hover:border-border-strong hover:bg-surface-elevated",
        className
      )}
      aria-label="Toggle dark/light theme"
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <motion.div
        key={theme}
        initial={{ scale: 0.6, rotate: -45, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        exit={{ scale: 0.6, rotate: 45, opacity: 0 }}
        transition={{ duration: 0.15 }}
      >
        {isDark ? (
          <Sun className="h-4 w-4 text-neutral-300 hover:text-white" />
        ) : (
          <Moon className="h-4 w-4 text-neutral-700 hover:text-black" />
        )}
      </motion.div>
    </button>
  );
}
