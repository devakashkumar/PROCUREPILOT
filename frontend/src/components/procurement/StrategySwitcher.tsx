import { motion } from "framer-motion";
import { ProcurementStrategy } from "../../types/api.js";
import { cn } from "../../lib/cn.js";
import { DollarSign, Shield, Zap, Scale } from "lucide-react";

const strategies: Array<{
  id: ProcurementStrategy;
  label: string;
  icon: typeof DollarSign;
}> = [
  { id: "balanced", label: "Balanced", icon: Scale },
  { id: "reliable", label: "Reliable", icon: Shield },
  { id: "cheapest", label: "Cheapest", icon: DollarSign },
  { id: "fastest", label: "Fastest", icon: Zap },
];

interface StrategySwitcherProps {
  currentStrategy: ProcurementStrategy;
  onChange: (strategy: ProcurementStrategy) => void;
  disabled?: boolean;
}

export function StrategySwitcher({
  currentStrategy,
  onChange,
  disabled,
}: StrategySwitcherProps) {
  return (
    <div className="flex p-1 rounded-[8px] bg-surface border border-border w-full sm:w-auto">
      {strategies.map((s) => {
        const isSelected = currentStrategy === s.id;
        const Icon = s.icon;

        return (
          <button
            key={s.id}
            type="button"
            onClick={() => !disabled && onChange(s.id)}
            disabled={disabled}
            className={cn(
              "relative flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 rounded-[6px] text-xs font-semibold transition-all duration-150 cursor-pointer select-none",
              isSelected ? "text-background font-bold" : "text-muted hover:text-ink"
            )}
          >
            {isSelected && (
              <motion.div
                layoutId="strategy-active-pill"
                className="absolute inset-0 rounded-[6px] bg-ink shadow-sm"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
            <Icon className="relative z-10 h-3.5 w-3.5" strokeWidth={2} />
            <span className="relative z-10">{s.label}</span>
          </button>
        );
      })}
    </div>
  );
}
