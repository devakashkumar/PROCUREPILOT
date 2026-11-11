import React, { useState } from "react";
import {
  Building2,
  User as UserIcon,
  Shield,
  Save,
  CheckCircle2,
  Lock,
  Sparkles,
  Sliders,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "../store/authStore.js";
import { authApi } from "../api/auth.js";
import { Button } from "../components/ui/Button.js";
import { Input } from "../components/ui/Input.js";
import { formatInr } from "../lib/format.js";
import { ProcurementStrategy } from "../types/api.js";

const BUSINESS_TYPES = [
  "Kirana & Convenience Store",
  "Supermarket",
  "Cafe & Bakery",
  "Pharmacy & FMCG",
  "Restaurant & Kitchen",
  "Office Supplies",
];

const STRATEGIES: Array<{ id: ProcurementStrategy; label: string; desc: string }> = [
  { id: "balanced", label: "Balanced Sourcing", desc: "Optimal tradeoff of price, delivery speed, and supplier score." },
  { id: "cheapest", label: "Lowest Price First", desc: "Prioritizes minimal unit costs and maximum wholesale discounts." },
  { id: "fastest", label: "Fastest Turnaround", desc: "Minimizes delivery days for critical low-stock emergencies." },
  { id: "reliable", label: "Max Supplier Reliability", desc: "Restricts matching strictly to top-audited distributor ratings." },
];

export const Settings: React.FC = () => {
  const { user, business, updateUser, updateBusiness } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"business" | "account">("business");
  const [isSaving, setIsSaving] = useState(false);

  // Business form state
  const [businessName, setBusinessName] = useState(business?.name || "");
  const [businessType, setBusinessType] = useState(business?.type || "Supermarket");
  const [city, setCity] = useState(business?.city || "Mumbai");
  const [gstin, setGstin] = useState(business?.gstin || "");
  const [budgetRupees, setBudgetRupees] = useState(
    business ? Math.round(business.monthlyBudgetPaise / 100) : 200000
  );
  const [priority, setPriority] = useState<ProcurementStrategy>(
    business?.preferences?.priority || "balanced"
  );
  const [minReliability, setMinReliability] = useState(
    business?.preferences?.minReliability ?? 70
  );

  // User form state
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const isDemoAccount = user?.email === "demo@procurepilot.ai";

  const handleSaveBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const budgetPaise = Math.round(Number(budgetRupees) * 100);
      const res = await authApi.updateProfile({
        businessName,
        businessType,
        city,
        gstin: gstin.trim() || undefined,
        monthlyBudgetPaise: budgetPaise,
        preferences: {
          priority,
          minReliability: Number(minReliability),
        },
      });

      updateBusiness(res.business);
      toast.success("Business profile and sourcing preferences saved to database!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update business profile";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setIsSaving(true);
    try {
      const payload: {
        name: string;
        email?: string;
        currentPassword?: string;
        newPassword?: string;
      } = { name };

      if (email !== user?.email) {
        payload.email = email;
      }
      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await authApi.updateProfile(payload);
      updateUser(res.user);
      if (res.business) updateBusiness(res.business);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      toast.success("Account profile details updated successfully!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update account";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl pb-16">
      {/* Page Header */}
      <div className="border-b border-border pb-6">
        <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-muted">
          <Sliders className="h-3.5 w-3.5" />
          <span>Configuration & Profile</span>
        </div>
        <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
          Business & Account Settings
        </h1>
        <p className="mt-1 text-xs text-muted max-w-xl">
          Manage your retail establishment profile, budget ceilings, and sourcing preferences. Changes persist directly to the database.
        </p>
      </div>

      {/* Demo Warning Notice if Demo User */}
      {isDemoAccount && (
        <div className="rounded-[10px] border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-600 dark:text-amber-300 flex items-start gap-3">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold">Evaluation Account Active (Patel Supermarket)</span>
            <p className="leading-relaxed text-muted">
              You are signed into the pre-seeded Kirana evaluation account. Business parameters and budgets are saved for your session. Register a personal account to test email and password changes.
            </p>
          </div>
        </div>
      )}

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-border pb-px">
        <button
          type="button"
          onClick={() => setActiveTab("business")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-mono border-b-2 transition-all cursor-pointer ${
            activeTab === "business"
              ? "border-ink text-ink font-bold"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>Business Profile & Sourcing</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("account")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-mono border-b-2 transition-all cursor-pointer ${
            activeTab === "account"
              ? "border-ink text-ink font-bold"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          <UserIcon className="h-4 w-4" />
          <span>Account & Security</span>
        </button>
      </div>

      {/* TAB 1: BUSINESS PROFILE & SOURCING */}
      {activeTab === "business" && (
        <form onSubmit={handleSaveBusiness} className="space-y-8">
          {/* General Business Info */}
          <div className="rounded-[12px] border border-border bg-surface p-6 space-y-5">
            <div className="border-b border-border pb-3">
              <h2 className="text-sm font-bold text-ink">Commercial Identity</h2>
              <p className="text-xs text-muted">Your store identity shown on supplier bids and generated purchase orders.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="Store / Business Name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
                placeholder="e.g. Patel Supermarket"
              />

              <div className="w-full flex flex-col gap-1.5">
                <label className="text-[11px] font-mono font-medium uppercase tracking-wider text-muted">
                  Store Category
                </label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="flex h-11 w-full rounded-[8px] border border-border bg-surface px-3.5 py-2 text-sm text-ink transition-all duration-200 focus-visible:outline-none focus-visible:border-ink cursor-pointer"
                >
                  {BUSINESS_TYPES.map((t) => (
                    <option key={t} value={t} className="bg-surface text-ink">
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Primary City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                placeholder="e.g. Mumbai, Pune, Jaipur"
              />

              <Input
                label="GSTIN (Optional)"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                placeholder="e.g. 27AABCU9603R1ZM"
              />
            </div>
          </div>

          {/* Sourcing & Knapsack Constraints */}
          <div className="rounded-[12px] border border-border bg-surface p-6 space-y-5">
            <div className="border-b border-border pb-3">
              <h2 className="text-sm font-bold text-ink">Procurement & Knapsack Parameters</h2>
              <p className="text-xs text-muted">Rules strictly enforced by the 0/1 integer dynamic programming engine.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="Monthly Sourcing Budget (₹ INR)"
                type="number"
                min={1000}
                step={500}
                value={budgetRupees}
                onChange={(e) => setBudgetRupees(Number(e.target.value))}
                required
                helperText={`Current Budget Cap: ${formatInr(budgetRupees * 100)}`}
              />

              <div className="w-full flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-mono font-medium uppercase tracking-wider text-muted">
                    Min Supplier Reliability
                  </label>
                  <span className="font-mono text-xs font-bold text-ink">{minReliability}%</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={95}
                  step={5}
                  value={minReliability}
                  onChange={(e) => setMinReliability(Number(e.target.value))}
                  className="mt-2.5 w-full accent-ink cursor-pointer"
                />
                <span className="text-[11px] text-muted">Filters out suppliers with past fulfillment scores below this floor.</span>
              </div>
            </div>

            {/* Sourcing Strategy Selector */}
            <div className="pt-2">
              <label className="text-[11px] font-mono font-medium uppercase tracking-wider text-muted block mb-3">
                Default Optimization Objective
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {STRATEGIES.map((strat) => (
                  <div
                    key={strat.id}
                    onClick={() => setPriority(strat.id)}
                    className={`p-4 rounded-[10px] border cursor-pointer transition-all ${
                      priority === strat.id
                        ? "border-ink bg-surface-elevated shadow-sm"
                        : "border-border bg-surface hover:border-border-strong text-muted"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${priority === strat.id ? "text-ink" : "text-muted"}`}>
                        {strat.label}
                      </span>
                      {priority === strat.id && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      )}
                    </div>
                    <p className="mt-1 text-[11px] text-muted leading-relaxed font-sans">
                      {strat.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSaving}
              className="gap-2 font-bold text-xs min-h-[44px] px-6"
            >
              <Save className="h-4 w-4" />
              Save Business Profile
            </Button>
          </div>
        </form>
      )}

      {/* TAB 2: USER ACCOUNT & SECURITY */}
      {activeTab === "account" && (
        <form onSubmit={handleSaveAccount} className="space-y-8">
          <div className="rounded-[12px] border border-border bg-surface p-6 space-y-5">
            <div className="border-b border-border pb-3">
              <h2 className="text-sm font-bold text-ink">Personal Profile</h2>
              <p className="text-xs text-muted">Credentials used to authenticate into ProcurePilot.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Store Owner Name"
              />

              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isDemoAccount}
                helperText={isDemoAccount ? "Demo account email is locked" : "Used for login and order alerts"}
              />
            </div>
          </div>

          {/* Password Update */}
          <div className="rounded-[12px] border border-border bg-surface p-6 space-y-5">
            <div className="border-b border-border pb-3">
              <h2 className="text-sm font-bold text-ink">Security & Password</h2>
              <p className="text-xs text-muted">Leave blank if you do not wish to change your password.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={isDemoAccount}
                placeholder="••••••••"
              />

              <div className="hidden sm:block" />

              <Input
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isDemoAccount}
                placeholder="At least 8 characters with letter & number"
              />

              <Input
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isDemoAccount}
                placeholder="Repeat new password"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSaving}
              className="gap-2 font-bold text-xs min-h-[44px] px-6"
            >
              <Save className="h-4 w-4" />
              Save Account Details
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};
