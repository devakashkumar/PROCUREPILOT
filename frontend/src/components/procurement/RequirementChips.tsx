import { ProcurementRequirements } from "../../types/api.js";
import { formatInr } from "../../lib/format.js";
import { Badge } from "../ui/Badge.js";
import { HelpCircle, Edit3 } from "lucide-react";

interface RequirementChipsProps {
  requirements: ProcurementRequirements;
  onEdit?: () => void;
}

export function RequirementChips({ requirements, onEdit }: RequirementChipsProps) {
  return (
    <div className="flex flex-col gap-3 p-4 rounded-[20px] bg-surface border border-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted">
            Parsed Requirements
          </span>
          <Badge variant="accent" className="text-[10px]">
            AI Extracted
          </Badge>
        </div>
        {onEdit && (
          <button
            onClick={onEdit}
            className="flex items-center gap-1 text-xs font-bold text-muted hover:text-ink transition-colors cursor-pointer"
          >
            <Edit3 className="h-3 w-3" />
            <span>Edit</span>
          </button>
        )}
      </div>

      {/* Items Chips */}
      <div className="flex flex-wrap items-center gap-2">
        {requirements.items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-subtle border border-border text-xs font-bold text-ink"
          >
            <span className="font-mono text-accent-ink bg-accent px-1.5 py-0.2 rounded-full text-[10px]">
              {item.quantity} {item.unit || "units"}
            </span>
            <span>{item.name}</span>
          </div>
        ))}

        {requirements.budget.amountPaise && (
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-ink text-background text-xs font-bold">
            <span className="text-muted">Budget:</span>
            <span className="font-mono">{formatInr(requirements.budget.amountPaise)}</span>
          </div>
        )}

        <Badge variant="outline" className="capitalize">
          Priority: {requirements.priority}
        </Badge>
      </div>

      {/* Clarifications if any */}
      {requirements.clarifications && requirements.clarifications.length > 0 && (
        <div className="mt-2 p-3 rounded-[12px] bg-warning/10 border border-warning/30 flex items-start gap-2 text-xs font-semibold text-ink">
          <HelpCircle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="font-bold text-warning">Clarification needed from owner:</span>
            {requirements.clarifications.map((q, idx) => (
              <span key={idx}>• {q}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
