import { useState, useEffect, useRef } from "react";
import { Sparkles, Terminal, CornerDownLeft } from "lucide-react";
import { Button } from "../ui/Button.js";

const EXAMPLE_PROMPTS = [
  "I need to restock 20 units of cooking oil, 30 packets of rice, and 15 units of detergent. Keep the total under ₹15,000. Prioritize reliable suppliers.",
  "Order 25 packets of wheat flour, 10 kg of sugar, and 5 litres of ghee. Budget ₹10,000. Get the cheapest options.",
  "Need 10 reams of A4 paper, 4 boxes of ball pens, and 2 printer toners within 2 days for the office.",
];

interface CommandBarProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
  initialValue?: string;
}

export function CommandBar({ onSubmit, isLoading, initialValue = "" }: CommandBarProps) {
  const [text, setText] = useState(initialValue);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [placeholderText, setPlaceholderText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Typewriter effect for placeholder
  useEffect(() => {
    if (text) return;

    const currentPrompt = EXAMPLE_PROMPTS[placeholderIndex] || "";
    const speed = isDeleting ? 20 : 40;

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setPlaceholderText(currentPrompt.slice(0, placeholderText.length + 1));
        if (placeholderText.length + 1 === currentPrompt.length) {
          setTimeout(() => setIsDeleting(true), 2500);
        }
      } else {
        setPlaceholderText(currentPrompt.slice(0, placeholderText.length - 1));
        if (placeholderText.length === 0) {
          setIsDeleting(false);
          setPlaceholderIndex((prev) => (prev + 1) % EXAMPLE_PROMPTS.length);
        }
      }
    }, speed);

    return () => clearTimeout(timeout);
  }, [placeholderText, isDeleting, placeholderIndex, text]);

  const handleSubmit = () => {
    const query = text.trim();
    // Do NOT run preview text on blank enter! Require typed prompt or explicit chip click.
    if (!query || isLoading) {
      return;
    }
    onSubmit(query);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Enter" && !e.shiftKey && !text.trim()) {
      // Prevent running when blank enter is pressed
      e.preventDefault();
    }
  };

  const handleUsePlaceholder = () => {
    const promptToUse = placeholderText || EXAMPLE_PROMPTS[placeholderIndex] || "";
    setText(promptToUse);
    textareaRef.current?.focus();
  };

  const hasValidText = text.trim().length > 0;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-4">
      {/* Monumental Command Console */}
      <div className="p-5 sm:p-7 bg-surface border border-border focus-within:border-ink/50 focus-within:ring-1 focus-within:ring-ink/20 transition-all shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.8)] rounded-[14px]">
        <div className="flex items-center justify-between mb-4 text-[11px] font-mono uppercase tracking-widest text-muted border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="h-3.5 w-3.5 text-muted" />
            <span className="text-ink font-semibold">Autonomous Restock Terminal</span>
          </div>
          <span className="text-muted hidden sm:inline">Natural Language Parsing</span>
        </div>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholderText || "Describe restocking needs in plain English or Hinglish..."}
          rows={3}
          disabled={isLoading}
          className="w-full bg-transparent text-base sm:text-xl font-bold tracking-tight text-ink placeholder:text-muted/60 resize-none focus:outline-none leading-relaxed"
        />

        {/* Action bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border mt-2">
          <div className="flex items-center gap-2 text-[11px] font-mono text-muted">
            <kbd className="px-1.5 py-0.5 rounded-[4px] bg-black/5 dark:bg-white/[0.05] border border-border text-muted">⌘/Ctrl</kbd>
            <span>+</span>
            <kbd className="px-1.5 py-0.5 rounded-[4px] bg-black/5 dark:bg-white/[0.05] border border-border text-muted">Enter</kbd>
            <span>to trigger solver</span>
            {!text && (
              <button
                type="button"
                onClick={handleUsePlaceholder}
                className="hidden md:inline-flex ml-2 text-[10px] text-muted hover:text-ink underline cursor-pointer"
              >
                Insert preview prompt
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {text && (
              <button
                type="button"
                onClick={() => setText("")}
                className="text-xs text-muted hover:text-ink px-2 py-1 transition-colors cursor-pointer"
              >
                Clear
              </button>
            )}
            <Button
              type="button"
              variant="primary"
              size="default"
              isLoading={isLoading}
              disabled={!hasValidText || isLoading}
              onClick={handleSubmit}
              className="w-full sm:w-auto gap-2 font-bold text-xs h-10 px-5 shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Run Autonomous Sourcing</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Suggestion Prompts */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-[11px] font-mono uppercase tracking-wider text-muted mr-1">Examples:</span>
        {EXAMPLE_PROMPTS.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setText(p);
              textareaRef.current?.focus();
            }}
            className="text-left text-xs text-muted hover:text-ink border border-border hover:border-border-strong bg-surface px-3 py-1 rounded-[6px] transition-colors cursor-pointer truncate max-w-xs"
          >
            "{p.slice(0, 45)}..."
          </button>
        ))}
      </div>
    </div>
  );
}
