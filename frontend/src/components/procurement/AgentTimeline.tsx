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
      <div className="relative border-l-2 border-border ml-5 pl-8 flex flex-col gap-8">
        {steps.map((step) => {
          const isCompleted = step.status === "completed";
          const isRunning = step.status === "running";
          const isIdle = step.status === "idle";

          return (
            <div key={step.id} className="relative flex flex-col items-start text-left">
              {/* Stepper Dot or Checkmark */}
              <div
                className={cn(
                  "absolute -left-[45px] top-0 h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                  isCompleted && "bg-ink border-ink text-accent",
                  isRunning && "bg-surface border-ink text-ink shadow-md",
                  isIdle && "bg-surface border-border text-muted"
                )}
              >
                {isCompleted && (
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Check className="h-4 w-4 stroke-[3]" />
                  </motion.div>
                )}
                {isRunning && (
                  <div className="relative flex items-center justify-center">
                    <span className="absolute h-3 w-3 rounded-full bg-accent animate-ping opacity-75" />
                    <Loader2 className="h-4 w-4 animate-spin text-ink" />
                  </div>
                )}
                {isIdle && <span className="h-2 w-2 rounded-full bg-border" />}
              </div>

              {/* Step Title & Subtitle */}
              <div>
                <h4
                  className={cn(
                    "text-base font-bold tracking-tight transition-colors",
                    isRunning && "text-ink font-extrabold text-lg",
                    isCompleted && "text-ink",
                    isIdle && "text-muted"
                  )}
                >
                  {step.title}
                </h4>
                <p className="text-xs text-muted mt-0.5">{step.description}</p>
              </div>

              {/* Result Callout when done */}
              {isCompleted && step.resultText && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 px-3 py-1.5 rounded-[8px] bg-subtle border border-border text-xs font-semibold text-ink"
                >
                  {step.resultText}
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
