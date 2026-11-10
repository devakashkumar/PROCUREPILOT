import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowLeft, HelpCircle } from "lucide-react";
import { Button } from "../components/ui/Button.js";

export const NotFound: React.FC = () => {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-card-subtle text-accent mb-6 border border-border">
        <HelpCircle className="h-8 w-8 stroke-[2]" />
      </div>
      <h1 className="font-heading text-4xl sm:text-5xl font-black text-ink">404</h1>
      <p className="mt-2 text-base font-semibold text-ink">Page Not Found</p>
      <p className="mt-1 text-xs text-muted max-w-sm">
        The procurement view, order, or route you are looking for does not exist in the workspace.
      </p>

      <div className="mt-6 flex items-center gap-3">
        <Link to="/dashboard">
          <Button variant="accent" size="md" className="gap-2 font-bold">
            <ArrowLeft className="h-4 w-4" /> Go to Dashboard
          </Button>
        </Link>
        <Link to="/procure">
          <Button variant="outline" size="md" className="gap-2">
            <Sparkles className="h-4 w-4" /> Start Procurement
          </Button>
        </Link>
      </div>
    </div>
  );
};
