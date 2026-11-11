import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { cn } from "../../lib/cn.js";

export interface TimelineStep {
  id: number;
  title: string;
  description: string;
  status: "idle" | "running" | "completed" | "error";
  resultText?: string;
}

interface AgentTimelineProps {
  steps: TimelineStep[];
  currentStepId: number;
}

export function AgentTimeline({ steps, currentStepId }: AgentTimelineProps) {
  return (
    <div className="w-full max-w-xl mx-auto py-8">
      <div className="relative border-l border-border ml-4 pl-7 flex flex-col gap-7">
        {steps.map((step) => {
          const isCompleted = step.status === "completed";
          const isRunning = step.status === "running";
          const isIdle = step.status === "idle";

          return (
            <div key={step.id} className="relative flex flex-col items-start text-left">
              {/* Stepper Node */}
              <div
                className={cn(
                  "absolute -left-[39px] top-0.5 h-6 w-6 rounded-[4px] flex items-center justify-center border transition-all duration-200",
                  isCompleted && "bg-ink border-ink text-background shadow-md",
                  isRunning && "bg-surface border-ink text-ink shadow-sm",
                  isIdle && "bg-surface-elevated border-border text-muted"
                )}
              >
                {isCompleted && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  </motion.div>
                )}
                {isRunning && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-ink" />
                )}
                {isIdle && <span className="h-1.5 w-1.5 rounded-full bg-border" />}
              </div>

              {/* Step Title & Subtitle */}
              <div>
                <h4
                  className={cn(
                    "text-sm font-bold tracking-tight transition-colors",
                    isRunning && "text-ink font-extrabold text-base",
                    isCompleted && "text-ink",
                    isIdle && "text-muted"
                  )}
                >
                  {step.title}
                </h4>
                <p
                  className={cn(
                    "mt-0.5 text-xs font-sans leading-relaxed",
                    isRunning ? "text-ink/80" : "text-muted"
                  )}
                >
                  {step.description}
                </p>

                {step.resultText && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 rounded-[4px]"
                  >
                    <span className="font-bold">✓</span>
                    <span>{step.resultText}</span>
                  </motion.div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
