import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Lock,
  Mail,
  User,
  Building2,
  MapPin,
  IndianRupee,
  ShieldAlert,
  Loader2,
  Sparkles,
  Store,
  ShoppingCart,
  Coffee,
  Briefcase,
  Check,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Globe2,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "../store/authStore.js";
import { Button } from "../components/ui/Button.js";
import { Input } from "../components/ui/Input.js";
import { ThemeToggle } from "../components/layout/ThemeToggle.js";

type BusinessType = "kirana" | "supermarket" | "cafe" | "office";

interface StoreTypeOption {
  id: BusinessType;
  label: string;
  badge: string;
  icon: React.ElementType;
}

const STORE_TYPES: StoreTypeOption[] = [
  {
    id: "kirana",
    label: "Kirana / Provision",
    badge: "Most Popular",
    icon: Store,
  },
  {
    id: "supermarket",
    label: "Supermarket",
    badge: "Multi-Aisle",
    icon: ShoppingCart,
  },
  {
    id: "cafe",
    label: "Cafe / Eatery",
    badge: "F&B Wholesale",
    icon: Coffee,
  },
  {
    id: "office",
    label: "Office / Enterprise",
    badge: "Pantry & FMCG",
    icon: Briefcase,
  },
];

const BUDGET_PRESETS = [
  { label: "₹50K", value: "50000" },
  { label: "₹1 Lakh", value: "100000" },
  { label: "₹2.5 Lakhs", value: "250000" },
  { label: "₹5 Lakhs", value: "500000" },
];

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState<BusinessType>("kirana");
  const [city, setCity] = useState("Mumbai");
  const [monthlyBudgetRupees, setMonthlyBudgetRupees] = useState("100000");
  const [formError, setFormError] = useState<string | null>(null);

  // Live Password Checklist
  const hasMinLength = password.length >= 8;
  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasLetter && hasNumber;

  // Live Dual Currency Calculation
  const numericBudget = parseFloat(monthlyBudgetRupees) || 0;
  const approxUsd = (numericBudget / 88).toFixed(2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setFormError(null);

    if (name.trim().length < 2) {
      setFormError("Proprietor name must be at least 2 characters.");
      return;
    }
    if (businessName.trim().length < 2) {
      setFormError("Store name must be at least 2 characters.");
      return;
    }
    if (city.trim().length < 2) {
      setFormError("City must be at least 2 characters.");
      return;
    }
    if (!isPasswordValid) {
      setFormError("Please satisfy all password security requirements below.");
      return;
    }

    try {
      const budgetPaise = Math.round(numericBudget * 100);
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        businessName: businessName.trim(),
        businessType,
        city: city.trim(),
        monthlyBudgetPaise: budgetPaise < 100000 ? 10000000 : budgetPaise,
      });
      toast.success("Merchant profile created successfully!");
      navigate("/dashboard");
    } catch {
      // Handled via store state
    }
  };

  return (
    <div className="min-h-screen bg-background text-ink flex flex-col lg:grid lg:grid-cols-12 relative overflow-hidden transition-colors duration-300">
      {/* Ambient Top Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[500px] pointer-events-none glow-radial-top z-0" />

      {/* ─────────────────────────────────────────────────────────────
          LEFT PANEL: Architectural Showcase (Visible on lg+ screens)
          ───────────────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-10 xl:p-14 border-r border-border bg-surface/40 relative z-10 overflow-hidden">
        {/* Subtle Architectural Grid Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(0,0,0,0.06)_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <img
              src="/logo.png"
              alt="ProcurePilot"
              className="h-10 w-10 object-contain drop-shadow-sm transition-transform group-hover:scale-105"
            />
            <div>
              <span className="font-extrabold text-lg tracking-tight text-ink block leading-none">
                ProcurePilot
              </span>
              <span className="font-mono text-[10px] text-muted uppercase tracking-widest mt-1 block">
                Wholesale Purchasing
              </span>
            </div>
          </Link>

          {/* Main Visual Statement */}
          <div className="mt-12 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface text-ink text-xs font-mono font-medium shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-accent-cyan" />
              <span>Engineered for PayPal Global Settlement</span>
            </div>

            <h1 className="font-h2 text-3xl xl:text-4xl font-extrabold tracking-tight text-ink leading-tight">
              Transform Natural Requests into Optimal Restocks.
            </h1>

            <p className="text-sm text-muted leading-relaxed">
              ProcurePilot equips kiranas and retail supermarkets with autonomous multi-vendor distributor matching, knapsack dynamic programming, and one-click PayPal sandbox checkout.
            </p>
          </div>
        </div>

        {/* Live Architecture Feature Cards */}
        <div className="relative z-10 my-8 space-y-3.5">
          {/* Card 1: DP Knapsack Engine */}
          <div className="p-4 rounded-xl border border-border bg-surface/80 backdrop-blur-sm shadow-sm hover:border-border-strong transition-all">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-ink">0/1 Knapsack DP Engine</h4>
                  <p className="text-[11px] text-muted font-sans">Multi-choice optimization across 7 distributors</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                +18.4% SAVINGS
              </span>
            </div>
          </div>

          {/* Card 2: Dual Currency Engine */}
          <div className="p-4 rounded-xl border border-border bg-surface/80 backdrop-blur-sm shadow-sm hover:border-border-strong transition-all">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
                  <Globe2 className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-ink">Dual-Currency Settlement</h4>
                  <p className="text-[11px] text-muted font-sans">₹ INR Wholesale ➔ $ USD PayPal Orders v2</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold">
                INR → USD
              </span>
            </div>
          </div>

          {/* Card 3: Deterministic Financial Authority */}
          <div className="p-4 rounded-xl border border-border bg-surface/80 backdrop-blur-sm shadow-sm hover:border-border-strong transition-all">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-ink">Human-Controlled Approvals</h4>
                  <p className="text-[11px] text-muted font-sans">All arithmetic strictly enforced in TypeScript</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold">
                SAFEGUARDED
              </span>
            </div>
          </div>
        </div>

        {/* Footer Metrics */}
        <div className="relative z-10 pt-6 border-t border-border flex items-center justify-between text-xs text-muted font-mono">
          <span>38 FMCG SKUs Catalogued</span>
          <span>•</span>
          <span>210 Live Distributor Offers</span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          RIGHT PANEL: High-End Registration Form
          ───────────────────────────────────────────────────────────── */}
      <div className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 relative z-10 overflow-y-auto">
        {/* Top Bar for Mobile & Theme Toggle */}
        <div className="flex items-center justify-between pb-6 border-b border-border mb-8">
          <Link to="/" className="flex items-center gap-2.5 lg:hidden">
            <img src="/logo.png" alt="ProcurePilot" className="h-8 w-8 object-contain" />
            <span className="font-bold text-base tracking-tight text-ink">ProcurePilot</span>
          </Link>
          <div className="hidden lg:block text-xs font-mono text-muted">
            STEP 1 OF 1 — INSTANT STORE ONBOARDING
          </div>
          <ThemeToggle />
        </div>

        {/* Form Container */}
        <div className="max-w-xl mx-auto w-full">
          {/* Header */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[5px] bg-ink/5 dark:bg-white/10 text-ink text-[10px] font-mono font-bold uppercase tracking-wider">
              <Store className="h-3 w-3" />
              <span>Merchant Profile Setup</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
              Create Your Business Profile
            </h2>
            <p className="text-xs sm:text-sm text-muted">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-ink underline underline-offset-4 hover:opacity-80 transition-opacity"
              >
                Sign in directly
              </Link>
              {" "}or use the{" "}
              <Link
                to="/login"
                className="font-mono text-xs text-accent-cyan font-bold hover:underline"
              >
                1-Click Demo
              </Link>
            </p>
          </div>

          {/* Error Alert Banner */}
          {(formError || error) && (
            <div className="mt-5 flex items-start gap-2.5 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-600 dark:text-rose-300 animate-in fade-in">
              <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
              <span className="font-medium">{formError || error}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {/* Section 1: Store Type Visual Cards */}
            <div className="space-y-2">
              <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted block">
                Select Store Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {STORE_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isSelected = businessType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setBusinessType(type.id)}
                      className={`relative flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "border-ink bg-surface shadow-md ring-1 ring-ink/20"
                          : "border-border bg-surface/50 hover:bg-surface hover:border-border-strong opacity-80"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-ink text-background flex items-center justify-center">
                          <Check className="h-2.5 w-2.5 stroke-[3]" />
                        </div>
                      )}
                      <div className={`p-2 rounded-lg mb-1.5 ${isSelected ? "bg-ink text-background" : "bg-surface-elevated text-muted"}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-bold text-ink leading-tight">{type.label}</span>
                      <span className="text-[9px] font-mono text-muted mt-0.5">{type.badge}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Store Identity & Proprietor */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Proprietor Full Name"
                required
                placeholder="Ramesh Patel"
                value={name}
                onChange={(e) => setName(e.target.value)}
                startIcon={<User className="h-4 w-4 text-muted" />}
              />
              <Input
                label="Store / Business Name"
                required
                placeholder="Patel Supermarket"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                startIcon={<Building2 className="h-4 w-4 text-muted" />}
              />
            </div>

            {/* Section 3: Location & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="City / Hub"
                required
                placeholder="Mumbai"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                startIcon={<MapPin className="h-4 w-4 text-muted" />}
              />
              <Input
                label="Business Email Address"
                type="email"
                autoComplete="email"
                required
                placeholder="owner@patelstore.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                startIcon={<Mail className="h-4 w-4 text-muted" />}
              />
            </div>

            {/* Section 4: Monthly Procurement Budget with Live Currency Converter */}
            <div className="space-y-2 p-4 rounded-xl border border-border bg-surface-elevated/40">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                  <IndianRupee className="h-3.5 w-3.5" />
                  Monthly Procurement Budget
                </label>
                <span className="text-[11px] font-mono text-muted">
                  ≈ <span className="font-bold text-ink">${approxUsd} USD</span> (@ ₹88)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted font-mono font-bold text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="1000"
                    step="1"
                    required
                    value={monthlyBudgetRupees}
                    onChange={(e) => setMonthlyBudgetRupees(e.target.value)}
                    className="flex h-11 w-full rounded-[8px] border border-border bg-surface pl-8 pr-3.5 py-2 text-sm font-mono font-bold text-ink transition-all focus-visible:outline-none focus-visible:border-ink focus-visible:ring-1 focus-visible:ring-ink/20"
                    placeholder="100000"
                  />
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[10px] font-mono text-muted mr-1">Presets:</span>
                {BUDGET_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setMonthlyBudgetRupees(preset.value)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-all cursor-pointer ${
                      monthlyBudgetRupees === preset.value
                        ? "bg-ink text-background font-bold shadow-xs"
                        : "bg-surface border border-border text-muted hover:text-ink hover:border-border-strong"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Section 5: Password with Show/Hide & Live Security Indicators */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted">
                  Account Password
                </label>
                <span className="text-[10px] font-mono text-muted">Min 8 characters</span>
              </div>

              <div className="relative flex items-center">
                <div className="pointer-events-none absolute left-3.5 flex items-center text-muted">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex h-11 w-full rounded-[8px] border border-border bg-surface pl-10 pr-11 py-2 text-sm text-ink placeholder:text-muted transition-all focus-visible:outline-none focus-visible:border-ink focus-visible:ring-1 focus-visible:ring-ink/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 p-1 text-muted hover:text-ink transition-colors cursor-pointer"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Live Checklist Requirements */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div
                  className={`flex items-center gap-1.5 text-[11px] font-mono transition-colors ${
                    hasMinLength ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-muted"
                  }`}
                >
                  <CheckCircle2 className={`h-3 w-3 ${hasMinLength ? "stroke-[2.5]" : "opacity-40"}`} />
                  <span>8+ Chars</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 text-[11px] font-mono transition-colors ${
                    hasLetter ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-muted"
                  }`}
                >
                  <CheckCircle2 className={`h-3 w-3 ${hasLetter ? "stroke-[2.5]" : "opacity-40"}`} />
                  <span>1+ Letter</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 text-[11px] font-mono transition-colors ${
                    hasNumber ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-muted"
                  }`}
                >
                  <CheckCircle2 className={`h-3 w-3 ${hasNumber ? "stroke-[2.5]" : "opacity-40"}`} />
                  <span>1+ Number</span>
                </div>
              </div>
            </div>

            {/* Submit Action Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full gap-2.5 font-bold text-sm h-12 shadow-lg hover:shadow-xl transition-all cursor-pointer"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Merchant Profile...
                </>
              ) : (
                <>
                  Launch Business Profile & Continue
                  <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                </>
              )}
            </Button>
          </form>

          {/* Evaluation Quick-Access Footer */}
          <div className="mt-8 pt-5 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-muted">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              Multi-Tenant Business Isolation
            </span>
            <Link
              to="/login"
              className="hover:text-ink transition-colors flex items-center gap-1 underline underline-offset-4"
            >
              Sign in to Demo Account →
            </Link>
          </div>
        </div>

        {/* Bottom copyright / info */}
        <div className="mt-12 text-center text-[10px] font-mono text-muted opacity-75">
          ProcurePilot · Smart Wholesale Purchasing
        </div>
      </div>
    </div>
  );
};
