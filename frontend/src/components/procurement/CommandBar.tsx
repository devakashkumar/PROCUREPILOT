import { useState, useEffect, useRef } from "react";
import { Sparkles, ArrowRight, CornerDownLeft } from "lucide-react";
import { Button } from "../ui/Button.js";

const EXAMPLE_PROMPTS = [
  "I need to restock 20 units of cooking oil, 30 packets of rice and 15 units of detergent. Keep the total under ₹15,000. Prioritize reliable suppliers.",
  "Order 25 packets of wheat flour, 10 kg of sugar and 5 litres of ghee. Budget ₹10,000. Get the cheapest options.",
  "Need 10 reams of A4 paper, 4 boxes of ball pens and 2 printer toners within 2 days for the office.",
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
    if (text) return; // Stop typewriter when user has typed

    const currentPrompt = EXAMPLE_PROMPTS[placeholderIndex] || "";
    const speed = isDeleting ? 25 : 45;

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
    const query = text.trim() || (placeholderText.length > 20 ? placeholderText : EXAMPLE_PROMPTS[0]!);
    if (query && !isLoading) {
      onSubmit(query);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-4">
      {/* Giant Centred Command Input Card */}
      <div className="card-sharp p-4 sm:p-8 bg-surface border-2 border-ink/20 focus-within:border-ink transition-all shadow-lg rounded-2xl sm:rounded-[28px]">
        <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-muted">
          <Sparkles className="h-4 w-4 text-accent-ink bg-accent p-0.5 rounded-sm shrink-0" />
          <span className="truncate">Autonomous Purchasing Agent</span>
        </div>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholderText || "Describe what you need in plain words..."}
          rows={3}
          disabled={isLoading}
          className="w-full bg-transparent text-base sm:text-2xl font-bold tracking-tight text-ink placeholder:text-muted/40 resize-none focus:outline-none leading-relaxed"
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 mt-2 border-t border-border">
          <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-muted">
            <kbd className="px-2 py-1 rounded bg-subtle border border-border font-mono text-[11px] font-bold">
              ⌘ / Ctrl + ↵
            </kbd>
            <span>to run autonomous pipeline</span>
          </div>

          <Button
            onClick={handleSubmit}
            isLoading={isLoading}
            variant="primary"
            size="lg"
            className="w-full sm:w-auto h-12 sm:h-14 font-extrabold px-6 sm:px-8 group text-sm sm:text-base cursor-pointer"
          >
            <span>Run Purchasing Agent</span>
            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>

      {/* Clickable Example Prompts */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-xs">
        <span className="font-bold text-muted uppercase tracking-wider shrink-0">Try example:</span>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => {
                setText(prompt);
                textareaRef.current?.focus();
              }}
              className="text-left px-3 py-1.5 rounded-full bg-surface border border-border text-xs font-semibold text-ink hover:border-ink hover:bg-subtle transition-all cursor-pointer truncate max-w-xs sm:max-w-md"
            >
              {prompt.slice(0, 50)}...
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
