import { Moon, Sun } from "lucide-react";
import { useUiStore } from "../../store/uiStore.js";
import { motion } from "framer-motion";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useUiStore();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className={`relative h-11 w-11 rounded-full flex items-center justify-center border border-border bg-surface text-ink hover:border-ink transition-colors cursor-pointer ${
        className || ""
      }`}
      aria-label="Toggle dark/light theme"
    >
      <motion.div
        key={theme}
        initial={{ scale: 0.5, rotate: -45, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        exit={{ scale: 0.5, rotate: 45, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {isDark ? <Sun className="h-5 w-5 text-accent" /> : <Moon className="h-5 w-5 text-ink" />}
      </motion.div>
    </button>
  );
}
