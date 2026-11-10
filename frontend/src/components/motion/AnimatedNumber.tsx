import { useEffect, useState } from "react";
import { formatInr, formatUsd } from "../../lib/format.js";

interface AnimatedNumberProps {
  value: number; // raw paise or raw number
  formatAs?: "inr" | "usd" | "number" | "percent";
  prefix?: string;
  suffix?: string;
  durationMs?: number;
  className?: string;
}

export function AnimatedNumber({
  value,
  formatAs = "number",
  prefix = "",
  suffix = "",
  durationMs = 800,
  className,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    // Check prefers-reduced-motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplayValue(value);
      return;
    }

    const startValue = displayValue;
    const diff = value - startValue;
    if (diff === 0) return;

    const startTime = performance.now();

    const updateNumber = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / durationMs);

      // Ease out expo: 1 - Math.pow(2, -10 * progress)
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.round(startValue + diff * ease);

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(updateNumber);
      } else {
        setDisplayValue(value);
      }
    };

    const animId = requestAnimationFrame(updateNumber);
    return () => cancelAnimationFrame(animId);
  }, [value, durationMs]);

  let formatted = displayValue.toLocaleString("en-IN");
  if (formatAs === "inr") {
    formatted = formatInr(displayValue);
  } else if (formatAs === "usd") {
    formatted = formatUsd(displayValue);
  } else if (formatAs === "percent") {
    formatted = `${displayValue}%`;
  }

  return (
    <span className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
