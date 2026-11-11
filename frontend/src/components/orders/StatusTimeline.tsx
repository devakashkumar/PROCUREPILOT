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
    return <div className="text-xs font-mono text-muted">No history entries recorded.</div>;
  }

  return (
    <div className="relative border-l border-white/[0.1] ml-3 pl-5 flex flex-col gap-6 py-2">
      {history.map((entry, idx) => (
        <div key={idx} className="relative flex flex-col items-start">
          <span className="absolute -left-[27px] top-1 h-2.5 w-2.5 rounded-[2px] bg-white border border-black shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={entry.to} />
            <span className="text-[11px] text-muted font-mono tabular-nums">{formatDate(entry.at)}</span>
          </div>
          {entry.note && (
            <p className="mt-1 text-xs text-muted font-sans">{entry.note}</p>
          )}
        </div>
      ))}
    </div>
  );
}
