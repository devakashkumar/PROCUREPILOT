import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calculator,
  CheckCircle2,
  ArrowUpRight,
  Zap,
} from "lucide-react";
import { useAuthStore } from "../store/authStore.js";
import { Button } from "../components/ui/Button.js";
import { ThemeToggle } from "../components/layout/ThemeToggle.js";
import { Reveal } from "../components/motion/Reveal.js";

const DEMO_PROMPTS = [
  {
    label: "Supermarket Restock",
    budget: "₹15,000",
    text: "Restock 20 units of cooking oil, 30 packets of rice, and 15 units of detergent under ₹15,000. Prioritize reliable suppliers.",
  },
  {
    label: "Kirana Staples",
    budget: "₹12,000",
    text: "Need 50kg basmati rice, 25kg wheat flour, and 10 packs toor dal. Fastest delivery within ₹12,000 budget.",
  },
  {
    label: "Cafe & Pantry",
    budget: "₹9,500",
    text: "Order 40 packs of milk, 15 jars of instant coffee, and 20 packets of tea leaves. Balance price and reliability.",
  },
];

const STATS = [
  { value: "210+", label: "Wholesale Quotes" },
  { value: "0 ₹", label: "Float Discrepancy" },
  { value: "< 1.8s", label: "Solver Runtime" },
  { value: "100%", label: "Owner Sign-Off" },
];

const STEPS = [
  {
    num: "01",
    title: "Colloquial Intent",
    body: "Speech or text in English and Hinglish parsed into typed items, quantities, and strict budget caps.",
    foot: "Gemini 2.5 Flash",
  },
  {
    num: "02",
    title: "Knapsack Solve",
    body: "Multi-supplier combinatorial optimization balances unit prices, MOQs, lead time, and reliability scores.",
    foot: "Integer DP",
  },
  {
    num: "03",
    title: "Owner Sign-Off",
    body: "Human verification required before any payment triggers. AI has zero autonomous financial authority.",
    foot: "Mandatory gate",
  },
  {
    num: "04",
    title: "PayPal Checkout",
    body: "Cryptographically verified PayPal sandbox checkout with auto-partitioned multi-supplier purchase orders.",
    foot: "Webhook dedup",
  },
];

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [activePromptIndex, setActivePromptIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    const currentFull = DEMO_PROMPTS[activePromptIndex]?.text || "";
    if (charIndex < currentFull.length) {
      const timer = setTimeout(() => {
        setDisplayedText(currentFull.slice(0, charIndex + 1));
        setCharIndex((prev) => prev + 1);
      }, 18);
      return () => clearTimeout(timer);
    } else {
      const pauseTimer = setTimeout(() => {
        setCharIndex(0);
        setActivePromptIndex((prev) => (prev + 1) % DEMO_PROMPTS.length);
        setDisplayedText("");
      }, 3800);
      return () => clearTimeout(pauseTimer);
    }
  }, [charIndex, activePromptIndex]);

  const handleSelectPrompt = (index: number) => {
    setActivePromptIndex(index);
    setDisplayedText(DEMO_PROMPTS[index]?.text || "");
    setCharIndex(DEMO_PROMPTS[index]?.text.length || 0);
  };

  const handleRunSimulatorPrompt = () => {
    const prompt = DEMO_PROMPTS[activePromptIndex]?.text || "";
    navigate(`/procure?prefill=${encodeURIComponent(prompt)}`);
  };

  return (
    <div className="min-h-screen bg-background text-ink overflow-x-hidden relative transition-colors duration-300">
      {/* Ambient Radial Glow */}
      <motion.div
        animate={{ opacity: [0.07, 0.14, 0.07], scale: [1, 1.04, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[600px] pointer-events-none glow-radial-top z-0"
      />

      {/* ─────── Navigation ─────── */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl transition-colors duration-300">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-8">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
              src="/logo.png"
              alt="ProcurePilot"
              className="h-7 w-7 object-contain transition-transform duration-200 group-hover:scale-105"
            />
            <span className="font-extrabold tracking-tight text-sm text-ink">
              ProcurePilot
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs text-muted font-medium">
            <a href="#workflow" className="hover:text-ink transition-colors">How it Works</a>
            <a href="#how-it-works" className="hover:text-ink transition-colors">Architecture</a>
            <a href="#guardrails" className="hover:text-ink transition-colors">Guardrails</a>
            <Link to="/products" className="hover:text-ink transition-colors">Catalog</Link>
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button variant="primary" size="sm" className="font-bold gap-1 text-xs h-8 px-3.5">
                  Dashboard <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="font-medium text-xs h-8 px-3">
                    Sign In
                  </Button>
                </Link>
                <Link to="/procure">
                  <Button variant="primary" size="sm" className="font-bold text-xs h-8 px-3.5">
                    Start Sourcing
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ─────── Hero ─────── */}
      <main className="relative z-10 mx-auto max-w-6xl px-4 pt-20 pb-24 sm:pt-32 sm:pb-40">
        <div className="text-center max-w-5xl mx-auto">

          <Reveal>
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-muted mb-10">
              Autonomous Procurement Agent
            </p>
          </Reveal>

          <Reveal delay={0.06}>
            <h1 className="font-black text-5xl sm:text-7xl md:text-[5.5rem] lg:text-[7rem] tracking-[-0.05em] text-ink leading-[0.9] text-balance mb-8">
              Autonomous<br />Purchasing.
            </h1>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="text-base sm:text-xl text-muted max-w-xl mx-auto leading-relaxed font-normal mb-10">
              Kirana stores and supermarkets state restock requests in natural
              words. Dynamic programming solves supplier baskets; PayPal settles the order.
            </p>
          </Reveal>

          {/* CTA Buttons */}
          <Reveal delay={0.18}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-20">
              <Link to="/procure" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto gap-2.5 text-sm font-bold h-12 px-8 shadow-lg dark:shadow-[0_0_30px_rgba(255,255,255,0.18)] hover:scale-[1.02] transition-transform"
                >
                  <Sparkles className="h-4 w-4" />
                  Try Autonomous Sourcing
                </Button>
              </Link>
              <Link to="/products" className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto text-sm font-medium h-12 px-7"
                >
                  Browse Catalog
                  <ArrowUpRight className="h-4 w-4 ml-1.5" />
                </Button>
              </Link>
            </div>
          </Reveal>

          {/* Terminal Simulator */}
          <Reveal delay={0.24}>
            <div className="rounded-2xl border border-border bg-surface p-5 sm:p-8 shadow-xl dark:shadow-[0_25px_60px_rgba(0,0,0,0.8)] text-left max-w-3xl mx-auto relative overflow-hidden hover:border-border-strong transition-all duration-300">
              {/* Title Row */}
              <div className="flex items-center justify-between border-b border-border pb-3.5 mb-5">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-red-500/70" />
                    <span className="h-3 w-3 rounded-full bg-yellow-500/70" />
                    <span className="h-3 w-3 rounded-full bg-green-500/70" />
                  </div>
                  <span className="ml-2 text-[11px] font-mono text-muted uppercase tracking-wider">Natural Language Terminal</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-mono text-muted">Live</span>
                </div>
              </div>

              {/* Typewriter */}
              <div className="font-mono text-sm sm:text-base text-ink min-h-[5rem] leading-relaxed">
                <span className="text-muted mr-2">$</span>
                {displayedText}
                <span className="animate-pulse inline-block w-2 h-[1.1em] bg-ink ml-0.5 translate-y-0.5 align-middle" />
              </div>

              {/* Scenario Tabs */}
              <div className="mt-5 pt-4 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  {DEMO_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPrompt(idx)}
                      className={`text-[11px] font-mono px-3 py-1 rounded-md transition-all cursor-pointer ${
                        activePromptIndex === idx
                          ? "bg-ink text-background font-bold"
                          : "border border-border text-muted hover:text-ink hover:bg-surface-elevated"
                      }`}
                    >
                      {prompt.label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleRunSimulatorPrompt}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink hover:underline underline-offset-4 cursor-pointer ml-auto"
                >
                  Run in Engine
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </Reveal>
        </div>

        {/* ─────── Stats Strip ─────── */}
        <Reveal delay={0.3}>
          <section className="mt-24 sm:mt-32 border-y border-border py-12">
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 text-center">
              {STATS.map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-1"
                >
                  <div className="font-mono text-3xl sm:text-4xl font-extrabold text-ink tabular-nums">{stat.value}</div>
                  <p className="text-xs text-muted font-mono uppercase tracking-wider">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </section>
        </Reveal>

        {/* ─────── 4-Step Workflow ─────── */}
        <section id="workflow" className="mt-28 sm:mt-36">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <p className="text-xs font-mono uppercase tracking-[0.2em] text-muted mb-3">Lifecycle</p>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-ink text-balance">
                From words to settled purchase orders.
              </h2>
              <p className="mt-4 text-sm text-muted max-w-lg mx-auto leading-relaxed">
                Four deterministic stages guarantee zero accidental orders and complete price accuracy.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {STEPS.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-xl border border-border bg-surface p-6 flex flex-col justify-between hover:border-border-strong hover:shadow-lg dark:hover:shadow-[0_0_25px_rgba(255,255,255,0.05)] transition-all duration-200"
              >
                <div>
                  <span className="font-mono text-xs font-bold text-muted">{step.num}</span>
                  <h3 className="text-base font-bold text-ink mt-3 mb-2">{step.title}</h3>
                  <p className="text-xs text-muted leading-relaxed">{step.body}</p>
                </div>
                <div className="mt-6 pt-3 border-t border-border text-[11px] font-mono text-muted">
                  {step.foot}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ─────── Architecture Bento ─────── */}
        <section id="how-it-works" className="mt-28 sm:mt-36">
          <Reveal>
            <div className="mb-14">
              <p className="text-xs font-mono uppercase tracking-[0.2em] text-muted mb-3">Architecture</p>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-ink">
                Intelligence separated<br className="hidden sm:block" /> from execution.
              </h2>
              <p className="mt-4 text-sm text-muted max-w-xl leading-relaxed">
                Probabilistic AI extracts user intent; deterministic backend mathematics enforces financial bounds.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: <Sparkles className="h-5 w-5" />,
                title: "Probabilistic Intelligence",
                body: "Gemini 2.5 Flash and a deterministic fallback parser translate colloquial speech into structured Zod schemas with strict budget limits.",
                foot: "Extraction & Justification Only",
              },
              {
                icon: <Calculator className="h-5 w-5" />,
                title: "Knapsack Optimization",
                body: "A discretized multiple-choice 0/1 knapsack algorithm evaluates 210+ regional wholesale distributor bids against MOQs, freight thresholds, and speed metrics.",
                foot: "Deterministic Solver · 4 Strategies",
              },
              {
                icon: <ShieldCheck className="h-5 w-5" />,
                title: "Mandatory Owner Sign-Off",
                body: "AI has zero financial authority. The state machine strictly blocks PayPal order creation until the store proprietor explicitly verifies every line item.",
                foot: "Strict State Machine",
              },
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-xl border border-border bg-surface p-7 sm:p-8 hover:border-border-strong hover:shadow-lg dark:hover:shadow-[0_0_30px_rgba(255,255,255,0.06)] transition-all duration-200"
              >
                <div className="h-10 w-10 rounded-lg bg-surface-elevated border border-border flex items-center justify-center text-ink mb-6">
                  {card.icon}
                </div>
                <h3 className="text-lg font-bold text-ink tracking-tight">{card.title}</h3>
                <p className="mt-3 text-sm text-muted leading-relaxed">{card.body}</p>
                <div className="mt-6 pt-4 border-t border-border text-[11px] font-mono text-muted">
                  {card.foot}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ─────── Guardrails ─────── */}
        <section id="guardrails" className="mt-28 sm:mt-36 rounded-2xl border border-border bg-surface p-8 sm:p-12">
          <Reveal>
            <div className="max-w-2xl mb-10">
              <p className="text-xs font-mono uppercase tracking-[0.2em] text-muted mb-3">Compliance & Security</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
                Non-Negotiable Financial Guardrails
              </h2>
              <p className="mt-3 text-sm text-muted leading-relaxed">
                Architectural rules enforced in code. AI assists human reasoning; deterministic backend logic controls all monetary transactions.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                title: "Zero AI Financial Authority",
                body: "AI never calculates authoritative pricing, chooses suppliers, or marks orders paid. All arithmetic runs in pure TypeScript.",
              },
              {
                title: "Integer Paise & Cent Precision",
                body: "All money in the database and API payloads is stored as integer paise (INR) and integer cents (USD). Floating-point math is prohibited.",
              },
              {
                title: "Never Trust Frontend Totals",
                body: "Line prices, freight tiers, and totals are recomputed from database records at order creation, payment setup, and PayPal capture.",
              },
              {
                title: "Cryptographic Webhook Verification",
                body: "Incoming PayPal webhooks are cryptographically authenticated against PayPal's verification API with idempotent event deduplication.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-xl border border-border bg-surface-elevated p-5"
              >
                <div className="flex items-center gap-2.5 text-sm font-bold text-ink mb-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  {item.title}
                </div>
                <p className="text-xs text-muted leading-relaxed">{item.body}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ─────── Final CTA ─────── */}
        <section className="mt-24 sm:mt-32 text-center border-t border-border pt-20">
          <Reveal>
            <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-ink text-balance mb-4">
              Ready to streamline<br className="hidden sm:block" /> purchasing?
            </h2>
            <p className="text-sm text-muted max-w-md mx-auto mb-10 leading-relaxed">
              Experience autonomous multi-supplier replenishment engineered for real kirana stores and businesses.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link to="/procure">
                <Button variant="primary" size="lg" className="font-bold h-12 px-8 shadow-sm gap-2">
                  <Zap className="h-4 w-4" />
                  Launch Autonomous Sourcing
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary" size="lg" className="font-medium h-12 px-7">
                  Sign In to Demo
                </Button>
              </Link>
            </div>
          </Reveal>
        </section>
      </main>

      {/* ─────── Footer ─────── */}
      <footer className="border-t border-border bg-surface py-10 text-xs text-muted font-mono transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="ProcurePilot" className="h-5 w-5 object-contain opacity-80" />
            <span className="font-bold text-ink font-sans text-sm">ProcurePilot AI</span>
            <span className="opacity-30">·</span>
            <span>Autonomous Purchasing</span>
            <span className="opacity-30">·</span>
            <span>MIT License</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="hover:text-ink transition-colors">Login</Link>
            <Link to="/procure" className="hover:text-ink transition-colors">Procure</Link>
            <Link to="/products" className="hover:text-ink transition-colors">Catalog</Link>
            <Link to="/orders" className="hover:text-ink transition-colors">Orders</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
