import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Cpu,
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
  "I need to restock 20 units of cooking oil, 30 packets of rice and 15 units of detergent. Keep total under ₹15,000. Prioritize reliable suppliers.",
  "Restock 50kg basmati rice, 25kg atta flour, 10 packets toor dal. Need fastest delivery within ₹12,000.",
  "Order 40 packs of milk, 15 jars of instant coffee, 20 packets of tea leaves for supermarket shelf. Balanced price and reliability.",
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
      }, 4000);
      return () => clearTimeout(pauseTimer);
    }
  }, [charIndex, activePromptIndex]);

  return (
    <div className="min-h-screen bg-background text-ink selection:bg-accent selection:text-accent-ink">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-ink shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-black tracking-tight text-lg text-ink">
                ProcurePilot<span className="text-accent">.ai</span>
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted">Autonomous Kirana Agent</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button variant="accent" size="sm" className="gap-2 font-semibold">
                  Dashboard <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="font-medium">
                    Log in
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="accent" size="sm" className="gap-1.5 font-semibold">
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-4 pt-16 pb-24 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3.5 py-1 text-xs font-semibold text-ink dark:text-accent mb-6">
              <Zap className="h-3.5 w-3.5 fill-current" />
              <span>Next-Gen Autonomous Sourcing with PayPal Sandbox</span>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <h1 className="font-heading text-4xl font-extrabold tracking-tight sm:text-6xl text-ink">
              Autonomous Purchasing for{" "}
              <span className="bg-gradient-to-r from-accent via-amber-400 to-lime-500 bg-clip-text text-transparent">
                Small Businesses
              </span>
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="mt-5 text-base sm:text-lg text-muted max-w-2xl mx-auto leading-relaxed">
              Kirana stores, supermarkets, and cafes type plain-text restock requests. Gemini AI structures the demand,
              a deterministic knapsack engine solves optimal supplier baskets, and PayPal settles the verified purchase.
            </p>
          </Reveal>

          {/* Interactive Typewriter Showcase */}
          <Reveal delay={0.3}>
            <div className="mt-10 rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xl text-left max-w-2xl mx-auto ring-1 ring-border/50">
              <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4 text-xs font-mono text-muted">
                <span className="flex items-center gap-1.5 text-accent font-semibold">
                  <Sparkles className="h-3.5 w-3.5" /> NATURAL LANGUAGE INPUT
                </span>
                <span>Gemini 2.5 Flash + Zod</span>
              </div>
              <div className="font-mono text-sm sm:text-base text-ink min-h-[4rem] whitespace-pre-wrap leading-relaxed">
                {displayedText}
                <span className="animate-pulse inline-block w-2 h-4 bg-accent ml-1 translate-y-0.5" />
              </div>
              <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted">
                <span>Budget constraint recognized: ₹15,000</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">3 items extracted</span>
              </div>
            </div>
          </Reveal>

          {/* Call to Actions */}
          <Reveal delay={0.4}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link to="/procure">
                <Button variant="accent" size="lg" className="gap-2 text-base font-bold shadow-lg shadow-accent/20">
                  <Sparkles className="h-5 w-5" />
                  Try Autonomous Procurement
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="text-base font-semibold">
                  1-Click Demo Login
                </Button>
              </Link>
            </div>
          </Reveal>
        </div>

        {/* Stats Strip */}
        <div className="mt-20 grid grid-cols-2 gap-4 rounded-3xl border border-border bg-card p-6 shadow-sm sm:grid-cols-4">
          <div className="text-center p-3">
            <p className="font-heading text-2xl sm:text-3xl font-extrabold text-ink">100%</p>
            <p className="text-xs font-medium text-muted mt-1">Deterministic Math</p>
          </div>
          <div className="text-center p-3">
            <p className="font-heading text-2xl sm:text-3xl font-extrabold text-accent">{"< 50ms"}</p>
            <p className="text-xs font-medium text-muted mt-1">Knapsack Optimization</p>
          </div>
          <div className="text-center p-3">
            <p className="font-heading text-2xl sm:text-3xl font-extrabold text-ink">Orders v2</p>
            <p className="text-xs font-medium text-muted mt-1">PayPal Sandbox</p>
          </div>
          <div className="text-center p-3">
            <p className="font-heading text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">Zero</p>
            <p className="text-xs font-medium text-muted mt-1">AI Financial Authority</p>
          </div>
        </div>

        {/* 5-Step Pipeline */}
        <section className="mt-28">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold font-mono tracking-widest text-accent uppercase">
              End-to-End Autonomous Pipeline
            </h2>
            <p className="mt-2 font-heading text-3xl font-bold text-ink">
              From natural voice or text to fulfilled sub-orders
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
            {[
              {
                step: "01",
                icon: Sparkles,
                title: "Prompt Extraction",
                desc: "Gemini 2.5 Flash extracts quantities, items, and budget constraints into strictly validated Zod schemas.",
              },
              {
                step: "02",
                icon: Layers,
                title: "Catalogue Matching",
                desc: "MongoDB text search and token scoring link requests to active supplier offers with MOQ checking.",
              },
              {
                step: "03",
                icon: Calculator,
                title: "Knapsack Engine",
                desc: "Deterministic DP optimizer calculates the exact mathematical best combo across price, speed, and reliability.",
              },
              {
                step: "04",
                icon: ShieldCheck,
                title: "Owner Approval",
                desc: "Strict state machine enforces explicit owner review and sign-off before any payment can be created.",
              },
              {
                step: "05",
                icon: Lock,
                title: "PayPal Checkout",
                desc: "PayPal Orders v2 escrow checkout with authoritative backend re-verification and webhook signatures.",
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="relative rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:border-accent/50 hover:shadow-md"
                >
                  <span className="font-mono text-xs font-bold text-accent">{item.step}</span>
                  <div className="mt-3 flex h-10 w-10 items-center justify-center rounded-xl bg-card-subtle text-ink">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-bold text-sm text-ink">{item.title}</h3>
                  <p className="mt-1.5 text-xs text-muted leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Non-Negotiable Safety Principles */}
        <section className="mt-28 rounded-3xl border border-border bg-card p-8 sm:p-12 shadow-sm">
          <div className="max-w-2xl">
            <span className="text-xs font-bold font-mono tracking-widest text-accent uppercase">
              Financial Integrity & Safety
            </span>
            <h2 className="mt-2 font-heading text-3xl font-bold text-ink">
              Designed with strict non-negotiable safety guardrails
            </h2>
            <p className="mt-3 text-sm text-muted">
              Built for production financial safety. AI assists with understanding and explanations, but code holds authoritative control over money.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="flex items-start gap-4 rounded-2xl border border-border/80 bg-card-subtle p-5">
              <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-500 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-ink">Zero AI Financial Authority</h4>
                <p className="mt-1 text-xs text-muted leading-relaxed">
                  AI NEVER computes totals, NEVER selects winners arbitrarily, and NEVER marks orders paid. All arithmetic is integer paise math.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-2xl border border-border/80 bg-card-subtle p-5">
              <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-500 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-ink">Authoritative Re-Verification</h4>
                <p className="mt-1 text-xs text-muted leading-relaxed">
                  Never trust frontend numbers. The backend recomputes totals at order creation, payment creation, and during capture.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-2xl border border-border/80 bg-card-subtle p-5">
              <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-500 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-ink">Mandatory Owner Sign-off</h4>
                <p className="mt-1 text-xs text-muted leading-relaxed">
                  State machine enforces APPROVED status before PayPal order creation is permitted. Draft orders cannot be charged.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-2xl border border-border/80 bg-card-subtle p-5">
              <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-500 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-ink">Cryptographic Webhook Verification</h4>
                <p className="mt-1 text-xs text-muted leading-relaxed">
                  PayPal webhooks verify digital signatures via PayPal's security endpoints before acknowledging completed payments.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 bg-card py-8 text-center text-xs text-muted">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 ProcurePilot AI — Autonomous Kirana & Supermarket Purchasing Agent.</p>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[11px] text-muted">PayPal Orders API v2 • Demo FX ₹88/USD</span>
            <Link to="/login" className="hover:text-ink transition-colors font-medium">Demo Access</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
