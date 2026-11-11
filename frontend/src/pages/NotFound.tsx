import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowLeft, HelpCircle } from "lucide-react";
import { Button } from "../components/ui/Button.js";

export const NotFound: React.FC = () => {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center px-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-[8px] bg-white/[0.04] text-white mb-6 border border-white/10">
        <HelpCircle className="h-7 w-7 stroke-[2]" />
      </div>
      <h1 className="font-mono text-4xl sm:text-5xl font-black text-white tabular-nums tracking-tighter">404</h1>
      <p className="mt-2 text-base font-bold text-white tracking-tight">Page Not Found</p>
      <p className="mt-1 text-xs text-neutral-400 max-w-sm font-sans leading-relaxed">
        The procurement view, order, or route you are looking for does not exist in the active ledger.
      </p>

      <div className="mt-6 flex items-center gap-3">
        <Link to="/dashboard">
          <Button variant="primary" size="md" className="gap-2 font-bold text-xs h-10 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
            <ArrowLeft className="h-3.5 w-3.5" /> Go to Dashboard
          </Button>
        </Link>
        <Link to="/procure">
          <Button variant="outline" size="md" className="gap-2 font-mono text-xs h-10">
            <Sparkles className="h-3.5 w-3.5" /> Start Procurement
          </Button>
        </Link>
      </div>
    </div>
  );
};
