import { Sparkles } from "lucide-react";
import { Badge } from "../ui/Badge.js";

interface ExplanationPanelProps {
  explanation: string;
}

export function ExplanationPanel({ explanation }: ExplanationPanelProps) {
  if (!explanation) return null;

  return (
    <div className="card-sharp p-6 bg-surface border border-border rounded-[20px] flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent-ink bg-accent p-0.5 rounded-sm" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted">
            Plan Reasoning & Trade-offs
          </h4>
        </div>
        <Badge variant="accent" className="text-[10px]">
          AI explanation (generated)
        </Badge>
      </div>

      <p className="text-sm font-medium text-ink leading-relaxed font-sans">
        {explanation}
      </p>
    </div>
  );
}
