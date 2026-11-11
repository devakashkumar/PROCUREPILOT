import { ProcurementRequirements } from "../../types/api.js";
import { formatInr } from "../../lib/format.js";
import { Edit3 } from "lucide-react";

interface RequirementChipsProps {
  requirements: ProcurementRequirements;
  onEdit?: () => void;
}

export function RequirementChips({ requirements, onEdit }: RequirementChipsProps) {
  return (
    <div className="flex flex-col gap-3 p-5 rounded-[12px] bg-surface border border-border">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono uppercase tracking-widest text-muted">
            Extracted Requirements
          </span>
          <span className="font-mono text-[9px] uppercase tracking-wider text-muted border border-border px-1 py-0.2 rounded-[3px]">
            SCHEMA VALIDATED
          </span>
        </div>
        {onEdit && (
          <button
            onClick={onEdit}
            type="button"
            className="flex items-center gap-1 text-xs font-mono text-muted hover:text-ink transition-colors cursor-pointer"
          >
            <Edit3 className="h-3 w-3" />
            <span>Edit</span>
          </button>
        )}
      </div>

      {/* Items Metadata List - Clean Unboxed Discipline */}
      <div className="flex flex-wrap items-center gap-2.5 pt-1">
        {requirements.items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-surface-elevated border border-border text-xs text-ink"
          >
            <span className="font-mono text-xs font-bold text-ink bg-neutral-200 dark:bg-white/10 px-1.5 py-0.2 rounded-[3px] tabular-nums">
              {item.quantity} {item.unit || "units"}
            </span>
            <span className="font-medium">{item.name}</span>
          </div>
        ))}

        {requirements.budget.amountPaise && (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-[4px] bg-surface-elevated border border-border text-xs font-mono text-ink">
            <span className="text-muted">Budget:</span>
            <span className="font-bold tabular-nums">{formatInr(requirements.budget.amountPaise)}</span>
          </div>
        )}

        <div className="px-2 py-0.5 text-xs font-mono uppercase tracking-wider text-muted">
          Priority: <span className="text-ink font-bold">{requirements.priority}</span>
        </div>
      </div>
    </div>
  );
}
