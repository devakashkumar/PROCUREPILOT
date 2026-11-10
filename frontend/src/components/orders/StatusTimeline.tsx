import { formatDate } from "../../lib/format.js";
import { StatusBadge } from "./StatusBadge.js";
import { OrderStatus } from "../../types/api.js";

interface StatusHistoryItem {
  from: OrderStatus;
  to: OrderStatus;
  at: string;
  by?: string;
  note?: string;
}

export function StatusTimeline({ history }: { history: StatusHistoryItem[] }) {
  if (!history || history.length === 0) {
    return <div className="text-xs text-muted">No history entries available.</div>;
  }

  return (
    <div className="relative border-l border-border ml-3 pl-6 flex flex-col gap-6 py-2">
      {history.map((entry, idx) => (
        <div key={idx} className="relative flex flex-col items-start">
          <span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-ink border-2 border-surface" />
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={entry.to} />
            <span className="text-xs text-muted font-mono">{formatDate(entry.at)}</span>
          </div>
          {entry.note && (
            <p className="mt-1 text-xs text-ink/80 font-medium">{entry.note}</p>
          )}
        </div>
      ))}
    </div>
  );
}
