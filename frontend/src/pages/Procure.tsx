import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Sparkles, RotateCcw, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {
  ProcurementStrategy,
  ProcurementRequirements,
  ItemMatchResult,
  OptimizedPlan,
} from "../types/api.js";
import { procurementApi, AnalyzeResponse, SearchResponse, OptimizeResponse } from "../api/procurement.js";
import { ordersApi } from "../api/orders.js";
import { formatPaise } from "../lib/format.js";
import { CommandBar } from "../components/procurement/CommandBar.js";
import { AgentTimeline, TimelineStep } from "../components/procurement/AgentTimeline.js";
import { RequirementChips } from "../components/procurement/RequirementChips.js";
import { BudgetMeter } from "../components/procurement/BudgetMeter.js";
import { StrategySwitcher } from "../components/procurement/StrategySwitcher.js";
import { ExplanationPanel } from "../components/procurement/ExplanationPanel.js";
import { SupplierMatrix } from "../components/procurement/SupplierMatrix.js";
import { Button } from "../components/ui/Button.js";

type PipelineStage = "idle" | "running" | "complete";

const INITIAL_STEPS: TimelineStep[] = [
  {
    id: 1,
    title: "Natural Language Understanding",
    description: "Gemini 2.5 Flash extracts quantities, items, and budget constraints into Zod schema",
    status: "idle",
  },
  {
    id: 2,
    title: "Product & Wholesale Offer Matching",
    description: "Searching local catalogue, wholesale price tiers, and active vendor stock",
    status: "idle",
  },
  {
    id: 3,
    title: "Knapsack Optimization & Constraints",
    description: "Solving multiple-choice 0/1 knapsack with shipping fees and supplier consolidation",
    status: "idle",
  },
  {
    id: 4,
    title: "Plain-Language Plan Explanation",
    description: "Synthesizing supplier selections and trade-offs into readable business summary",
    status: "idle",
  },
];

export const Procure: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefill = searchParams.get("prefill") || "";

  const [stage, setStage] = useState<PipelineStage>("idle");
  const [steps, setSteps] = useState<TimelineStep[]>(INITIAL_STEPS);
  const [currentStepId, setCurrentStepId] = useState(1);
  const [strategy, setStrategy] = useState<ProcurementStrategy>("balanced");

  // Pipeline Data State
  const [requestId, setRequestId] = useState<string | null>(null);
  const [requirements, setRequirements] = useState<ProcurementRequirements | null>(null);
  const [matches, setMatches] = useState<ItemMatchResult[]>([]);
  const [plan, setPlan] = useState<OptimizedPlan | null>(null);
  const [explanation, setExplanation] = useState<string>("");
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isReoptimizing, setIsReoptimizing] = useState(false);

  const updateStep = (id: number, status: TimelineStep["status"], resultText?: string) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status, resultText: resultText || s.resultText } : s))
    );
  };

  const handleStartPipeline = async (prompt: string) => {
    setStage("running");
    setCurrentStepId(1);
    setSteps(INITIAL_STEPS);

    try {
      // Step 1: Analyze
      updateStep(1, "running");
      const analyzeRes: AnalyzeResponse = await procurementApi.analyze(prompt);
      setRequestId(analyzeRes.requestId);
      setRequirements(analyzeRes.requirements);
      const reqCount = analyzeRes.requirements.items.length;
      updateStep(
        1,
        "completed",
        `Parsed ${reqCount} items (${analyzeRes.usedFallback ? "Fallback Parser" : "Gemini 2.5 Flash"})`
      );

      // Step 2: Search
      setCurrentStepId(2);
      updateStep(2, "running");
      const searchRes: SearchResponse = await procurementApi.search({
        requestId: analyzeRes.requestId,
      });
      setMatches(searchRes.matches);
      updateStep(2, "completed", `Found ${searchRes.matches.length} catalogue matches`);

      // Step 3 & 4: Optimize & Explain
      setCurrentStepId(3);
      updateStep(3, "running");
      const initialStrategy = analyzeRes.requirements.priority || strategy || "balanced";
      setStrategy(initialStrategy);

      const optimizeRes: OptimizeResponse = await procurementApi.optimize({
        requestId: analyzeRes.requestId,
        strategy: initialStrategy,
      });

      setPlan(optimizeRes.plan);
      setExplanation(optimizeRes.explanation);
      setWarnings(optimizeRes.warnings || []);
      updateStep(3, "completed", `Optimal combination: ${formatPaise(optimizeRes.plan.totalPaise)}`);

      setCurrentStepId(4);
      updateStep(4, "completed", "Plan synthesized successfully");

      // Transition to complete
      setTimeout(() => {
        setStage("complete");
      }, 500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Pipeline failed to execute";
      toast.error(message);
      updateStep(currentStepId, "error", message);
    }
  };

  // Re-run optimization when strategy changes
  const handleStrategyChange = async (newStrategy: ProcurementStrategy) => {
    if (!requestId || isReoptimizing) return;
    setStrategy(newStrategy);
    setIsReoptimizing(true);
    try {
      toast.loading(`Re-optimizing plan for '${newStrategy}' strategy...`, { id: "opt" });
      const res = await procurementApi.optimize({
        requestId,
        strategy: newStrategy,
      });
      setPlan(res.plan);
      setExplanation(res.explanation);
      setWarnings(res.warnings || []);
      toast.success(`Plan updated with ${newStrategy} strategy!`, { id: "opt" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to re-optimize";
      toast.error(message, { id: "opt" });
    } finally {
      setIsReoptimizing(false);
    }
  };

  // Create Purchase Order
  const handleCreateOrder = async () => {
    if (!requestId || !plan) return;
    setIsCreatingOrder(true);
    try {
      toast.loading("Creating purchase order draft...", { id: "create-order" });
      const res = await ordersApi.create({
        requestId,
        strategy,
        notes: `Autonomous plan via ${strategy} strategy`,
      });
      toast.success(`Purchase Order ${res.order.orderNumber} created!`, { id: "create-order" });
      navigate(`/orders/${res.order.id}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create order";
      toast.error(message, { id: "create-order" });
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const handleReset = () => {
    setStage("idle");
    setSteps(INITIAL_STEPS);
    setRequestId(null);
    setRequirements(null);
    setMatches([]);
    setPlan(null);
    setExplanation("");
    setWarnings([]);
  };

  return (
    <div className="space-y-8">
      {/* Title Bar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-muted">
            <Sparkles className="h-3.5 w-3.5 text-muted" />
            <span>Purchasing Assistant</span>
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
            Procurement Pipeline
          </h1>
          <p className="mt-0.5 text-xs text-muted">
            Translate conversational restock requests into mathematically optimized purchase orders.
          </p>
        </div>

        {stage === "complete" && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="gap-1.5 self-start sm:self-auto font-mono text-xs"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            New Sourcing Request
          </Button>
        )}
      </div>

      {/* Stage 1: Idle - Big Command Bar */}
      {stage === "idle" && (
        <div className="py-8">
          <CommandBar
            onSubmit={handleStartPipeline}
            isLoading={false}
            initialValue={prefill}
          />
        </div>
      )}

      {/* Stage 2: Running - Interactive Stepper */}
      {stage === "running" && (
        <div className="py-12">
          <div className="text-center mb-8">
            <h3 className="text-xl font-bold text-ink tracking-tight">Sourcing in Progress</h3>
            <p className="text-xs text-muted mt-1 font-mono">Searching catalog and comparing supplier prices</p>
          </div>
          <AgentTimeline steps={steps} currentStepId={currentStepId} />
        </div>
      )}

      {/* Stage 3: Complete - 2-Column Results Workspace */}
      {stage === "complete" && plan && requirements && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          {/* Left Column: Requirements, Recommendation Table, Supplier Matrix */}
          <div className="space-y-6 lg:col-span-8">
            {/* Extracted Requirements Chips */}
            <RequirementChips requirements={requirements} />

            {/* Warnings Alert Banner */}
            {warnings.length > 0 && (
              <div className="rounded-[10px] border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-600 dark:text-amber-200 space-y-1">
                <div className="flex items-center gap-2 font-mono font-bold text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>OPTIMIZATION CONSTRAINTS & NOTES:</span>
                </div>
                <ul className="list-disc pl-6 space-y-0.5 text-ink/80 font-sans">
                  {warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommended Products Table */}
            <div className="rounded-[12px] border border-border bg-surface p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h3 className="text-sm font-bold text-ink tracking-tight">
                    Optimized Supplier Basket
                  </h3>
                  <p className="text-xs text-muted mt-0.5">
                    {plan.lines.length} items allocated across {plan.supplierGroups.length} wholesale distributors
                  </p>
                </div>
                <span className="font-mono text-xs uppercase tracking-wider text-ink border border-border px-2 py-0.5 rounded-[4px] bg-surface-elevated">
                  {strategy}
                </span>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border text-muted uppercase tracking-wider font-mono text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Item</th>
                      <th className="py-2.5 px-3">Supplier</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3">Rate</th>
                      <th className="py-2.5 px-3">Delivery</th>
                      <th className="py-2.5 px-3 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {plan.lines.map((line, idx) => (
                      <tr key={idx} className="hover:bg-surface-elevated transition-colors">
                        <td className="py-3 px-3">
                          <span className="font-bold text-ink">{line.productName}</span>
                          <span className="text-[11px] font-mono text-muted block">Unit: {line.unit}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-ink font-medium">{line.supplierName}</span>
                          <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 block">
                            ★ {line.reliabilityScore}% reliability
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-ink tabular-nums">
                          {line.quantity}
                        </td>
                        <td className="py-3 px-3 font-mono text-muted tabular-nums">
                          {formatPaise(line.unitPricePaise)}
                        </td>
                        <td className="py-3 px-3 text-muted font-mono">
                          {line.deliveryDays} {line.deliveryDays === 1 ? "day" : "days"}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-ink tabular-nums">
                          {formatPaise(line.lineTotalPaise)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Supplier Matrix Details */}
            <SupplierMatrix
              matches={matches}
              chosenLines={plan.lines}
              warnings={warnings}
            />
          </div>

          {/* Right Column: BudgetMeter, StrategySwitcher, ExplanationPanel */}
          <div className="space-y-6 lg:col-span-4 sticky top-6">
            {/* Strategy Switcher */}
            <div className="rounded-[12px] border border-border bg-surface p-5 shadow-sm">
              <span className="text-[11px] font-mono uppercase tracking-widest text-muted mb-3 block">
                Optimization Priority
              </span>
              <StrategySwitcher
                currentStrategy={strategy}
                onChange={handleStrategyChange}
                disabled={isReoptimizing}
              />
            </div>

            {/* Budget Meter with Action Button */}
            <BudgetMeter
              plan={plan}
              onCreateOrder={handleCreateOrder}
              isLoading={isCreatingOrder}
            />

            {/* Gemini Explanation Panel */}
            <ExplanationPanel explanation={explanation} />
          </div>
        </div>
      )}
    </div>
  );
};
