import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, Lock, Mail, User, Building2, MapPin, IndianRupee, ShieldAlert, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "../store/authStore.js";
import { Button } from "../components/ui/Button.js";
import { Input } from "../components/ui/Input.js";
import { ThemeToggle } from "../components/layout/ThemeToggle.js";

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState<"supermarket" | "kirana" | "cafe" | "office">("kirana");
  const [city, setCity] = useState("Mumbai");
  const [monthlyBudgetRupees, setMonthlyBudgetRupees] = useState("100000");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      const budgetPaise = Math.round(parseFloat(monthlyBudgetRupees) * 100);
      await register({
        name,
        email,
        password,
        businessName,
        businessType,
        city,
        monthlyBudgetPaise: isNaN(budgetPaise) ? 10000000 : budgetPaise,
      });
      toast.success("Account and business successfully registered!");
      navigate("/dashboard");
    } catch {
      // Error is set in store
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-md">
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
              Create your business profile
            </h2>
            <p className="mt-2 text-xs text-muted">
              Already registered?{" "}
              <Link to="/login" className="font-medium text-accent underline underline-offset-4">
                Sign in here
              </Link>
            </p>
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-400">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Your Name"
                required
                placeholder="Ramesh Patel"
                value={name}
                onChange={(e) => setName(e.target.value)}
                startIcon={<User className="h-4 w-4" />}
              />

              <Input
                label="Business Name"
                required
                placeholder="Patel Supermarket"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                startIcon={<Building2 className="h-4 w-4" />}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-ink">
                  Store / Business Type
                </label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value as any)}
                  className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
                >
                  <option value="kirana">Kirana / Provision Store</option>
                  <option value="supermarket">Supermarket</option>
                  <option value="cafe">Cafe / Restaurant</option>
                  <option value="office">Small Office</option>
                </select>
              </div>

              <Input
                label="City"
                required
                placeholder="Mumbai"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                startIcon={<MapPin className="h-4 w-4" />}
              />
            </div>

            <Input
              label="Email Address"
              type="email"
              autoComplete="email"
              required
              placeholder="owner@patelstore.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              startIcon={<Mail className="h-4 w-4" />}
            />

            <Input
              label="Password (min 8 characters)"
              type="password"
              autoComplete="new-password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              startIcon={<Lock className="h-4 w-4" />}
            />

            <Input
              label="Monthly Procurement Budget (₹)"
              type="number"
              min="1000"
              required
              placeholder="100000"
              value={monthlyBudgetRupees}
              onChange={(e) => setMonthlyBudgetRupees(e.target.value)}
              startIcon={<IndianRupee className="h-4 w-4" />}
              helperText="Enforces soft & hard allocation ceilings in optimizer."
            />

            <Button
              type="submit"
              variant="accent"
              size="lg"
              className="w-full gap-2 font-bold"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Creating Account...
                </>
              ) : (
                <>
                  Register & Continue <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>

      <div className="relative hidden w-0 flex-1 lg:block">
        <div className="absolute inset-0 bg-card-subtle flex flex-col justify-between p-12 border-l border-border">
          <div className="max-w-md">
            <span className="text-xs font-mono font-bold tracking-wider text-accent uppercase">
              Automate Kirana Sourcing
            </span>
            <h3 className="mt-3 font-heading text-3xl font-bold text-ink">
              Focus on customers while AI optimizes supplier baskets.
            </h3>
            <p className="mt-3 text-sm text-muted leading-relaxed">
              ProcurePilot aggregates catalogue pricing from top wholesale suppliers in your region,
              recommends optimal quantities, and protects your margin.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm text-xs text-muted space-y-1">
            <p className="font-semibold text-ink">Ready in 30 seconds</p>
            <p>Access ready-to-test supplier catalogues with over 200 wholesale offers.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
