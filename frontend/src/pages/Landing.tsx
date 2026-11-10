import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calculator,
  Lock,
  Layers,
  CheckCircle2,
  TrendingDown,
  ShoppingBag,
  Zap,
} from "lucide-react";
import { useAuthStore } from "../store/authStore.js";
import { Button } from "../components/ui/Button.js";
import { ThemeToggle } from "../components/layout/ThemeToggle.js";
import { Reveal } from "../components/motion/Reveal.js";

const DEMO_PROMPTS = [
  "Restock 20 units of cooking oil, 30 packets of rice and 15 units of detergent under ₹15,000. Prioritize reliable suppliers.",
  "Restock 50kg basmati rice, 25kg wheat flour, 10 packs toor dal. Need fastest delivery within ₹12,000.",
  "Order 40 packs of milk, 15 jars of coffee, 20 packets of tea leaves. Balance price and reliability.",
];

export const Landing: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const [activePromptIndex, setActivePromptIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [charIndex, setCharIndex] = useState(0);

  // Typewriter effect
  useEffect(() => {
    const currentFull = DEMO_PROMPTS[activePromptIndex];
    if (charIndex < currentFull.length) {
      const timer = setTimeout(() => {
        setDisplayedText(currentFull.slice(0, charIndex + 1));
        setCharIndex((prev) => prev + 1);
      }, 25);
      return () => clearTimeout(timer);
    } else {
      const pauseTimer = setTimeout(() => {
        setCharIndex(0);
        setActivePromptIndex((prev) => (prev + 1) % DEMO_PROMPTS.length);
        setDisplayedText("");
      }, 3500);
      return () => clearTimeout(pauseTimer);
    }
  }, [charIndex, activePromptIndex]);

  return (
    <div className="min-h-screen bg-background text-ink selection:bg-accent selection:text-accent-ink overflow-x-hidden">
      {/* Top Navigation - Ultra clean & mobile responsive */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-ink shadow-sm">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-heading font-black tracking-tight text-lg text-ink">
              ProcurePilot<span className="text-emerald-600 dark:text-accent">.ai</span>
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button variant="accent" size="sm" className="font-bold gap-1 text-xs sm:text-sm">
                  Dashboard <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="font-medium text-xs sm:text-sm">
                    Log in
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="accent" size="sm" className="font-bold text-xs sm:text-sm">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto max-w-5xl px-4 pt-12 pb-20 sm:pt-20 sm:pb-28">
        <div className="text-center max-w-3xl mx-auto">
          {/* Main Headline with crystal-clear high-contrast Small Businesses text */}
          <Reveal>
            <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-ink leading-[1.15]">
              Autonomous Purchasing for{" "}
              <span className="block sm:inline font-black text-emerald-600 dark:text-accent">
                Small Businesses
              </span>
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mt-4 sm:mt-6 text-sm sm:text-lg text-muted max-w-2xl mx-auto leading-relaxed">
              Kirana stores, supermarkets, and cafes speak or type restock requests. AI parses items, knapsack dynamic programming optimizes supplier baskets, and PayPal settles the verified purchase.
            </p>
          </Reveal>

          {/* Clean Interactive Prompt Simulation */}
          <Reveal delay={0.2}>
            <div className="mt-8 sm:mt-10 rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-md text-left max-w-2xl mx-auto">
              <div className="flex items-center gap-2 border-b border-border/50 pb-3 mb-3 text-xs text-muted">
                <Sparkles className="h-4 w-4 text-emerald-600 dark:text-accent" />
                <span className="font-medium">Natural Language Restock Request</span>
              </div>
              <div className="font-mono text-sm sm:text-base text-ink min-h-[3.5rem] leading-relaxed">
                {displayedText}
                <span className="animate-pulse inline-block w-2 h-4 bg-emerald-600 dark:bg-accent ml-1 translate-y-0.5" />
              </div>
            </div>
          </Reveal>

          {/* Clean Call to Actions - Full width on phone */}
          <Reveal delay={0.3}>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
              <Link to="/procure" className="w-full sm:w-auto">
                <Button
                  variant="accent"
                  size="lg"
                  className="w-full sm:w-auto gap-2 text-sm sm:text-base font-bold shadow-lg shadow-accent/20 h-12"
                >
                  <Sparkles className="h-4 w-4" />
                  Try Autonomous Procurement
                </Button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto text-sm sm:text-base font-semibold h-12"
                >
                  1-Click Demo Login
                </Button>
              </Link>
            </div>
          </Reveal>
        </div>

        {/* 3 Core Value Pillars - Clean & Spacious */}
        <section className="mt-20 sm:mt-28">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-card-subtle text-emerald-600 dark:text-accent mb-4">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="font-heading font-bold text-base text-ink">Conversational Input</h3>
              <p className="mt-2 text-xs sm:text-sm text-muted leading-relaxed">
                Type or speak informal restock needs in English or Hinglish. Gemini AI extracts quantities, units, and budget limits into structured data.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-card-subtle text-emerald-600 dark:text-accent mb-4">
                <Calculator className="h-5 w-5" />
              </div>
              <h3 className="font-heading font-bold text-base text-ink">Knapsack Optimization</h3>
              <p className="mt-2 text-xs sm:text-sm text-muted leading-relaxed">
                A pure mathematical solver evaluates 210+ regional supplier offers to find the lowest price, fastest delivery, or most reliable vendor combination.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-card-subtle text-emerald-600 dark:text-accent mb-4">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-heading font-bold text-base text-ink">Financial Guardrails</h3>
              <p className="mt-2 text-xs sm:text-sm text-muted leading-relaxed">
                AI never moves money. Store owners must review and approve purchase orders before server-verified PayPal sandbox settlement occurs.
              </p>
            </div>
          </div>
        </section>

        {/* Clean Safety & Trust Grid */}
        <section className="mt-16 sm:mt-24 rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-sm">
          <div className="max-w-2xl">
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-ink">
              Enterprise Safety & Financial Guardrails
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-muted leading-relaxed">
              Designed with strict non-negotiable boundaries: AI assists with understanding, but deterministic code controls money.
            </p>
          </div>

          <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 rounded-xl bg-card-subtle p-4">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-accent mt-0.5" />
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-ink">Zero AI Financial Authority</h4>
                <p className="mt-1 text-xs text-muted leading-relaxed">
                  All monetary calculations are performed in integer paise with zero floating point errors.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl bg-card-subtle p-4">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-accent mt-0.5" />
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-ink">Mandatory Owner Sign-off</h4>
                <p className="mt-1 text-xs text-muted leading-relaxed">
                  The order state machine requires explicit owner approval before payment creation is unlocked.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl bg-card-subtle p-4">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-accent mt-0.5" />
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-ink">Backend Re-Verification</h4>
                <p className="mt-1 text-xs text-muted leading-relaxed">
                  Frontend numbers are never trusted; totals are recalculated from the database at checkout.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl bg-card-subtle p-4">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-accent mt-0.5" />
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-ink">PayPal Orders API v2</h4>
                <p className="mt-1 text-xs text-muted leading-relaxed">
                  Server-side capture verification with digital webhook signatures.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-border/50 bg-card py-6 text-xs text-muted">
        <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p>© 2026 ProcurePilot AI — Autonomous Purchasing for Small Businesses.</p>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hover:text-ink transition-colors font-medium">Demo Login</Link>
            <Link to="/procure" className="hover:text-ink transition-colors font-medium">Procure Agent</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
