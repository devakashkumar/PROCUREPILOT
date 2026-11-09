import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Sparkles, ArrowRight, Lock, Mail, ShieldAlert, Zap, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "../store/authStore.js";
import { Button } from "../components/ui/Button.js";
import { Input } from "../components/ui/Input.js";
import { ThemeToggle } from "../components/layout/ThemeToggle.js";

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await login(email, password);
      toast.success("Welcome back to ProcurePilot!");
      navigate(from, { replace: true });
    } catch {
      // Error managed in store
    }
  };

  const handleUseDemo = async () => {
    setEmail("demo@procurepilot.ai");
    setPassword("Demo@12345");
    clearError();
    try {
      await login("demo@procurepilot.ai", "Demo@12345");
      toast.success("Signed in with demo Kirana business!");
      navigate(from, { replace: true });
    } catch {
      // Error in store
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Column: Form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-ink">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="font-heading font-extrabold text-base text-ink">
                ProcurePilot<span className="text-accent">.ai</span>
              </span>
            </Link>
            <ThemeToggle />
          </div>

          <div className="mt-8">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-ink">
              Sign in to your business
            </h2>
            <p className="mt-2 text-xs text-muted">
              Or{" "}
              <Link to="/register" className="font-medium text-accent underline underline-offset-4">
                register a new retail store
              </Link>
            </p>
          </div>

          {/* Quick Demo Button */}
          <div className="mt-6 rounded-2xl border border-accent/40 bg-accent/5 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-ink dark:text-accent">
              <Zap className="h-4 w-4 fill-current text-accent" />
              <span>Instant Hackathon Evaluation</span>
            </div>
            <p className="mt-1 text-[11px] text-muted">
              Pre-seeded with Patel Supermarket, 38 catalogue items and 7 verified Indian suppliers.
            </p>
            <Button
              type="button"
              variant="accent"
              size="sm"
              onClick={handleUseDemo}
              disabled={isLoading}
              className="mt-3 w-full gap-2 font-bold"
            >
              <Zap className="h-3.5 w-3.5 fill-current" />
              Use 1-Click Demo Account
            </Button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-400">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input
              label="Email Address"
              type="email"
              autoComplete="email"
              required
              placeholder="owner@store.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              startIcon={<Mail className="h-4 w-4" />}
            />

            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              startIcon={<Lock className="h-4 w-4" />}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full gap-2 font-bold"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Authenticating...
                </>
              ) : (
                <>
                  Sign in <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* Right Column: Visual Showcase */}
      <div className="relative hidden w-0 flex-1 lg:block">
        <div className="absolute inset-0 bg-card-subtle flex flex-col justify-between p-12 border-l border-border">
          <div className="max-w-md">
            <span className="text-xs font-mono font-bold tracking-wider text-accent uppercase">
              Financial Safety & Control
            </span>
            <h3 className="mt-3 font-heading text-3xl font-bold text-ink">
              "Never trust AI with authoritative money math."
            </h3>
            <p className="mt-3 text-sm text-muted leading-relaxed">
              ProcurePilot isolates AI to prompt understanding and natural explanation. Every rupee,
              minimum order quantity, and PayPal capture is calculated and verified deterministically.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-md font-mono text-xs space-y-2">
            <div className="text-accent font-bold">✓ Multi-tenant isolated workspace</div>
            <div className="text-muted">✓ Integer paise precision (INR)</div>
            <div className="text-muted">✓ PayPal Orders v2 Sandbox integration</div>
            <div className="text-muted">✓ Mandatory owner sign-off state machine</div>
          </div>
        </div>
      </div>
    </div>
  );
};
