import { Sparkles } from "lucide-react";

interface ExplanationPanelProps {
  explanation: string;
}

export function ExplanationPanel({ explanation }: ExplanationPanelProps) {
  if (!explanation) return null;

  return (
    <div className="p-6 bg-surface border border-border rounded-[12px] flex flex-col gap-3 shadow-md">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-ink" />
          <h4 className="text-[11px] font-mono uppercase tracking-widest text-muted">
            Decision Explanation & Vendor Trade-offs
          </h4>
        </div>
        <span className="font-mono text-[9px] uppercase tracking-wider text-muted border border-border px-1 py-0.2 rounded-[3px]">
          GEMINI JUSTIFICATION
        </span>
      </div>

      <p className="text-sm font-normal text-ink/90 leading-relaxed font-sans">
        {explanation}
      </p>
    </div>
  );
}
