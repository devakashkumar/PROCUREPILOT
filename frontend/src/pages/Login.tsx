import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Zap, ShieldAlert } from "lucide-react";
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
      toast.success("Authenticated with ProcurePilot");
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
      toast.success("Signed in with demo Kirana business");
      navigate(from, { replace: true });
    } catch {
      // Error in store
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-ink relative overflow-hidden transition-colors duration-300">
      {/* Ambient Lighting Gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[450px] pointer-events-none glow-radial-top z-0" />

      {/* Main Container */}
      <div className="relative z-10 flex w-full flex-col items-center justify-center px-4 py-16 sm:px-8 sm:py-24">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-border mb-8">
            <Link to="/" className="flex items-center gap-2 group">
              <img src="/logo.png" alt="ProcurePilot" className="h-8 w-8 object-contain" />
              <span className="font-bold text-base tracking-tight text-ink">
                ProcurePilot
              </span>
            </Link>
            <ThemeToggle />
          </div>

          <div className="mt-8">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted">Authentication</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-ink">
              Sign In to Your Business
            </h2>
            <p className="mt-1 text-xs text-muted">
              Or{" "}
              <Link to="/register" className="text-ink underline underline-offset-4 hover:opacity-80 font-medium">
                register a new retail store profile
              </Link>
            </p>
          </div>

          {/* Instant 1-Click Demo Account Card */}
          <div className="mt-6 rounded-[12px] border border-border bg-surface p-5 sm:p-6 text-left shadow-lg">
            <div className="flex items-center justify-between text-xs font-mono text-ink">
              <div className="flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-ink" />
                <span className="font-bold">Instant Evaluation Account</span>
              </div>
              <span className="text-[10px] text-muted">1-CLICK</span>
            </div>
            <p className="mt-1 text-xs text-muted leading-relaxed font-sans">
              Pre-seeded with Patel Supermarket (Mumbai), 38 FMCG products, and 210 verified distributor offers.
            </p>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleUseDemo}
              disabled={isLoading}
              className="mt-3.5 w-full gap-2 font-bold text-xs h-9"
            >
              <Zap className="h-3.5 w-3.5 fill-current" />
              Use 1-Click Demo Account
            </Button>
          </div>

          {/* Divider */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="w-full border-t border-border" />
            <span className="absolute bg-background px-3 font-mono text-[10px] uppercase tracking-widest text-muted">
              OR EMAIL CREDENTIALS
            </span>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-[6px] border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-300">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="owner@kirana.store"
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />

            <Button
              type="submit"
              variant="secondary"
              size="default"
              isLoading={isLoading}
              className="w-full font-bold text-xs h-10 mt-2"
            >
              Sign In to Dashboard
            </Button>
          </form>

          {/* Footer note */}
          <div className="mt-8 pt-4 border-t border-border text-center text-[11px] font-mono text-muted">
            Encrypted Session · Token-Based Rotation
          </div>
        </div>
      </div>
    </div>
  );
};
