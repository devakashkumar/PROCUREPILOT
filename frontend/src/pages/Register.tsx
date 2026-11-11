import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Lock, Mail, User, Building2, MapPin, IndianRupee, ShieldAlert, Loader2 } from "lucide-react";
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
      toast.success("Business profile registered");
      navigate("/dashboard");
    } catch {
      // Error is set in store
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-ink relative overflow-hidden transition-colors duration-300">
      {/* Ambient Lighting Gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[450px] pointer-events-none glow-radial-top z-0" />

      {/* Main Container */}
      <div className="relative z-10 flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24 mx-auto w-full max-w-lg">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-border">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="flex h-7 w-7 items-center justify-center rounded-[5px] bg-ink text-background font-mono font-bold text-xs tracking-tighter shadow-sm">
                P
              </div>
              <span className="font-bold text-sm tracking-tight text-ink">
                ProcurePilot
              </span>
            </Link>
            <ThemeToggle />
          </div>

          <div className="mt-8">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted">Business Registration</span>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-ink">
              Create Your Business Profile
            </h2>
            <p className="mt-1 text-xs text-muted">
              Already registered?{" "}
              <Link to="/login" className="text-ink underline underline-offset-4 hover:opacity-80 font-medium">
                Sign in to your account
              </Link>
            </p>
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-[6px] border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-300">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Proprietor Name"
                required
                placeholder="Ramesh Patel"
                value={name}
                onChange={(e) => setName(e.target.value)}
                startIcon={<User className="h-3.5 w-3.5 text-muted" />}
              />

              <Input
                label="Store Name"
                required
                placeholder="Patel Supermarket"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                startIcon={<Building2 className="h-3.5 w-3.5 text-muted" />}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="w-full flex flex-col gap-1.5">
                <label className="text-[11px] font-mono font-medium uppercase tracking-wider text-muted">
                  Store / Business Type
                </label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value as "supermarket" | "kirana" | "cafe" | "office")}
                  className="flex h-11 w-full rounded-[8px] border border-border bg-surface px-3.5 py-2 text-sm text-ink transition-all focus-visible:outline-none focus-visible:border-ink focus-visible:ring-1 focus-visible:ring-ink/20"
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
                startIcon={<MapPin className="h-3.5 w-3.5 text-muted" />}
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
              startIcon={<Mail className="h-3.5 w-3.5 text-muted" />}
            />

            <Input
              label="Password (min 8 characters)"
              type="password"
              autoComplete="new-password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              startIcon={<Lock className="h-3.5 w-3.5 text-muted" />}
            />

            <Input
              label="Monthly Procurement Budget (₹)"
              type="number"
              min="1000"
              required
              placeholder="100000"
              value={monthlyBudgetRupees}
              onChange={(e) => setMonthlyBudgetRupees(e.target.value)}
              startIcon={<IndianRupee className="h-3.5 w-3.5 text-muted" />}
              helperText="Enforces budget constraints inside knapsack solver."
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full gap-2 font-bold text-xs h-11 mt-4"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Creating Profile...
                </>
              ) : (
                <>
                  Register & Continue <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 pt-4 border-t border-border text-center text-[11px] font-mono text-muted">
            Multi-Tenant Business Isolation Guaranteed
          </div>
        </div>
      </div>
    </div>
  );
};
