import React, { useState } from "react";
import {
  Smartphone,
  Download,
  QrCode,
  FileDown,
  Sparkles,
  ShieldCheck,
  Check,
  ExternalLink,
  Mic,
  ScanLine,
  Bell,
  CheckCircle2,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/Button.js";
import { Dialog } from "../ui/Dialog.js";

// Configurable link: user can replace or pass via VITE_APK_DOWNLOAD_URL
export const DEFAULT_APK_URL = import.meta.env.VITE_APK_DOWNLOAD_URL || "#";

interface AppDownloadWidgetProps {
  variant?: "dashboard" | "landing";
  apkUrl?: string;
  className?: string;
}

export const AppDownloadWidget: React.FC<AppDownloadWidgetProps> = ({
  variant = "dashboard",
  apkUrl = DEFAULT_APK_URL,
  className = "",
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleDownloadClick = () => {
    if (apkUrl === "#") {
      setIsModalOpen(true);
      toast.info("APK Build ready! Scan the QR code or copy direct link below.", {
        id: "apk-info",
      });
    } else {
      window.open(apkUrl, "_blank");
      toast.success("Starting APK download...");
    }
  };

  const handleCopyLink = () => {
    const currentUrl = window.location.origin;
    navigator.clipboard.writeText(apkUrl !== "#" ? apkUrl : currentUrl);
    setCopiedLink(true);
    toast.success("Download link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. DASHBOARD COMPACT / BANNER VARIANT
  // ─────────────────────────────────────────────────────────────────────────────
  if (variant === "dashboard") {
    return (
      <>
        <div
          className={`rounded-[12px] border border-border bg-surface p-6 shadow-sm relative overflow-hidden group transition-all duration-200 hover:border-border-strong ${className}`}
        >
          {/* Subtle Glow Backdrop */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/5 dark:bg-emerald-400/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            {/* Left: Icon & Description */}
            <div className="flex items-start gap-4">
              <div className="h-11 w-11 rounded-xl bg-ink text-background flex items-center justify-center shrink-0 shadow-md">
                <Smartphone className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-ink tracking-tight">
                    ProcurePilot Mobile Companion
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    v1.0.4 APK
                  </span>
                  <span className="font-mono text-[10px] text-muted">Android ARM64 · 24 MB</span>
                </div>
                <p className="mt-1 text-xs text-muted leading-relaxed max-w-xl">
                  Take autonomous procurement directly to your retail aisles. Dictate restock chits via voice, scan shelf barcodes, and approve PayPal supplier splits on the move.
                </p>

                {/* Feature Pills */}
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-muted bg-surface-elevated px-2 py-0.5 rounded border border-border">
                    <Mic className="h-3 w-3 text-ink" /> Voice Dictation
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-muted bg-surface-elevated px-2 py-0.5 rounded border border-border">
                    <ScanLine className="h-3 w-3 text-ink" /> Barcode Scanning
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-muted bg-surface-elevated px-2 py-0.5 rounded border border-border">
                    <Bell className="h-3 w-3 text-ink" /> Split Alerts
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
              <Button
                variant="primary"
                size="sm"
                onClick={handleDownloadClick}
                className="flex-1 md:flex-initial gap-2 font-bold text-xs h-10 px-4 shadow-sm cursor-pointer whitespace-nowrap"
              >
                <Download className="h-3.5 w-3.5 stroke-[2.5]" />
                <span>Download APK</span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsModalOpen(true)}
                className="gap-1.5 font-mono text-xs h-10 px-3 cursor-pointer whitespace-nowrap"
                title="Scan QR Code to install on mobile"
              >
                <QrCode className="h-3.5 w-3.5" />
                <span>Scan QR</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Modal Dialog */}
        <AppDownloadModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          apkUrl={apkUrl}
          copiedLink={copiedLink}
          onCopyLink={handleCopyLink}
        />
      </>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. LANDING PAGE SHOWCASE VARIANT
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <>
      <div className={`rounded-2xl border border-border bg-surface p-6 sm:p-10 lg:p-12 relative overflow-hidden shadow-sm ${className}`}>
        {/* Subtle Ambient Lighting */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/5 dark:bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Meta Row */}
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border pb-5 mb-8">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-surface-elevated border border-border flex items-center justify-center text-ink shrink-0">
              <Smartphone className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-ink tracking-tight">Android Companion App</span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                  v1.0.4 APK
                </span>
              </div>
              <p className="text-[11px] text-muted font-sans mt-0.5">Optimized for warehouse aisles & retail store counters</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 text-[11px] font-mono text-muted">
            <span>Android 9.0+ (ARM64)</span>
            <span>•</span>
            <span>24 MB Package</span>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Text & Actions */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight leading-snug">
                Wholesale ordering built for physical store realities.
              </h3>
              <p className="mt-3 text-sm text-muted leading-relaxed">
                Equip retail staff and store proprietors to run restock cycles directly from the floor. Parse voice notes in colloquial Hindi, scan GTIN barcodes off empty shelves, and execute cryptographic PayPal Sandbox approvals in one tap.
              </p>
            </div>

            {/* Feature Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-xl border border-border bg-surface-elevated/40 hover:bg-surface-elevated transition-colors">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="h-7 w-7 rounded-md bg-surface border border-border flex items-center justify-center text-ink shrink-0">
                    <Mic className="h-3.5 w-3.5 text-emerald-500" />
                  </div>
                  <h4 className="text-xs font-bold text-ink">Vernacular Voice Chits</h4>
                </div>
                <p className="text-[11px] text-muted leading-relaxed font-sans">
                  Dictate naturally in Hindi, Hinglish, or English. Gemini AI extracts quantities and SKUs.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-surface-elevated/40 hover:bg-surface-elevated transition-colors">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="h-7 w-7 rounded-md bg-surface border border-border flex items-center justify-center text-ink shrink-0">
                    <ScanLine className="h-3.5 w-3.5 text-emerald-500" />
                  </div>
                  <h4 className="text-xs font-bold text-ink">Shelf Barcode Scanner</h4>
                </div>
                <p className="text-[11px] text-muted leading-relaxed font-sans">
                  Instantly maps GTIN-13 package barcodes to 38 wholesale distributor offers.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-surface-elevated/40 hover:bg-surface-elevated transition-colors">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="h-7 w-7 rounded-md bg-surface border border-border flex items-center justify-center text-ink shrink-0">
                    <Bell className="h-3.5 w-3.5 text-emerald-500" />
                  </div>
                  <h4 className="text-xs font-bold text-ink">Supplier Dispatch Alerts</h4>
                </div>
                <p className="text-[11px] text-muted leading-relaxed font-sans">
                  Live status updates as wholesale suppliers accept and dispatch individual sub-lines.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-surface-elevated/40 hover:bg-surface-elevated transition-colors">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="h-7 w-7 rounded-md bg-surface border border-border flex items-center justify-center text-ink shrink-0">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  </div>
                  <h4 className="text-xs font-bold text-ink">Biometric Approvals</h4>
                </div>
                <p className="text-[11px] text-muted leading-relaxed font-sans">
                  Enforces biometric confirmation before locking purchase orders into PayPal Sandbox.
                </p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="pt-2 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleDownloadClick}
                  className="gap-2.5 font-bold text-xs h-11 px-5 shadow-sm whitespace-nowrap cursor-pointer shrink-0"
                >
                  <Download className="h-4 w-4 shrink-0 stroke-[2.5]" />
                  <span>Download APK</span>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-background/20 text-background shrink-0">v1.0.4</span>
                </Button>

                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setIsModalOpen(true)}
                  className="gap-2 font-mono text-xs h-11 px-4 whitespace-nowrap cursor-pointer shrink-0"
                >
                  <QrCode className="h-4 w-4 shrink-0" />
                  <span>Scan QR Code</span>
                </Button>
              </div>

              <div className="flex items-center gap-2 text-[11px] font-mono text-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>Standalone APK package ready for sideloading · Zero app store delay</span>
              </div>
            </div>
          </div>

          {/* Right Mobile Visual Phone Mockup */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <div className="relative w-full max-w-[270px]">
              {/* Adaptive Outer Shell */}
              <div className="rounded-[36px] border-2 border-border-strong bg-surface shadow-2xl p-3.5 ring-1 ring-border/60 relative overflow-hidden transition-all duration-300">
                {/* Dynamic Island */}
                <div className="w-20 h-3.5 bg-border rounded-full mx-auto mb-3" />

                {/* Simulated Screen Content */}
                <div className="space-y-2.5 font-sans">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <div className="flex items-center gap-1.5">
                      <img src="/logo.png" alt="ProcurePilot" className="h-4 w-4 object-contain" />
                      <span className="font-extrabold text-[11px] text-ink">ProcurePilot</span>
                    </div>
                    <span className="font-mono text-[9px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      ONLINE
                    </span>
                  </div>

                  {/* Restock Request Card */}
                  <div className="rounded-lg border border-border bg-surface-elevated p-2.5 space-y-1">
                    <div className="flex items-center gap-1 text-[9px] font-mono text-muted">
                      <Mic className="h-2.5 w-2.5 text-emerald-500" />
                      <span>VOICE CHIT PARSED</span>
                    </div>
                    <p className="text-[11px] font-semibold text-ink leading-tight">
                      "20 Fortune Oil, 30 India Gate Rice"
                    </p>
                    <div className="flex items-center justify-between pt-1 text-[10px] font-mono">
                      <span className="text-muted">Total (2 Vendors)</span>
                      <span className="font-bold text-ink">₹10,240</span>
                    </div>
                  </div>

                  {/* Multi-Vendor Sub-Lines */}
                  <div className="space-y-1.5 text-[10px]">
                    <div className="flex items-center justify-between p-2 rounded-md bg-surface-elevated/60 border border-border">
                      <span className="font-medium text-ink">FMCG Direct Hub</span>
                      <span className="font-mono font-bold text-ink">₹5,290</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-md bg-surface-elevated/60 border border-border">
                      <span className="font-medium text-ink">Metro Cash & Carry</span>
                      <span className="font-mono font-bold text-ink">₹4,950</span>
                    </div>
                  </div>

                  {/* 1-Tap PayPal Button Simulation */}
                  <div className="rounded-lg bg-ink text-background p-2.5 text-center shadow-xs">
                    <div className="text-[10px] font-bold flex items-center justify-center gap-1.5">
                      <ShieldCheck className="h-3 w-3" />
                      Approve via PayPal Sandbox
                    </div>
                    <span className="text-[8px] font-mono opacity-80 block mt-0.5">Authoritative Total: $116.36 USD</span>
                  </div>
                </div>

                {/* Home Indicator */}
                <div className="w-24 h-1 bg-border rounded-full mx-auto mt-4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Dialog */}
      <AppDownloadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        apkUrl={apkUrl}
        copiedLink={copiedLink}
        onCopyLink={handleCopyLink}
      />
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. QR CODE & DIRECT DOWNLOAD MODAL
// ─────────────────────────────────────────────────────────────────────────────
interface AppDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  apkUrl: string;
  copiedLink: boolean;
  onCopyLink: () => void;
}

const AppDownloadModal: React.FC<AppDownloadModalProps> = ({
  isOpen,
  onClose,
  apkUrl,
  copiedLink,
  onCopyLink,
}) => {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Download ProcurePilot Mobile Companion"
      description="Install directly on any Android device (ARM64 / Universal APK)."
    >
      <div className="space-y-6 pt-2">
        {/* QR Code Section */}
        <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl border border-border bg-surface-elevated/40">
          {/* Stylized QR Code SVG */}
          <div className="p-3 bg-white rounded-xl border border-neutral-200 shadow-sm shrink-0">
            <svg
              viewBox="0 0 120 120"
              className="h-28 w-28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Corner 1 */}
              <rect x="10" y="10" width="30" height="30" rx="4" fill="#09090B" />
              <rect x="16" y="16" width="18" height="18" rx="2" fill="#FFFFFF" />
              <rect x="20" y="20" width="10" height="10" rx="1" fill="#09090B" />

              {/* Corner 2 */}
              <rect x="80" y="10" width="30" height="30" rx="4" fill="#09090B" />
              <rect x="86" y="16" width="18" height="18" rx="2" fill="#FFFFFF" />
              <rect x="90" y="20" width="10" height="10" rx="1" fill="#09090B" />

              {/* Corner 3 */}
              <rect x="10" y="80" width="30" height="30" rx="4" fill="#09090B" />
              <rect x="16" y="86" width="18" height="18" rx="2" fill="#FFFFFF" />
              <rect x="20" y="90" width="10" height="10" rx="1" fill="#09090B" />

              {/* Data Blocks Pattern */}
              <rect x="50" y="12" width="8" height="8" rx="1" fill="#09090B" />
              <rect x="62" y="12" width="8" height="8" rx="1" fill="#09090B" />
              <rect x="50" y="24" width="8" height="8" rx="1" fill="#09090B" />
              <rect x="50" y="36" width="20" height="8" rx="1" fill="#09090B" />
              <rect x="12" y="50" width="8" height="8" rx="1" fill="#09090B" />
              <rect x="24" y="50" width="20" height="8" rx="1" fill="#09090B" />
              <rect x="50" y="50" width="14" height="14" rx="2" fill="#059669" />
              <rect x="70" y="50" width="16" height="8" rx="1" fill="#09090B" />
              <rect x="90" y="50" width="18" height="8" rx="1" fill="#09090B" />
              <rect x="50" y="70" width="8" height="20" rx="1" fill="#09090B" />
              <rect x="62" y="70" width="16" height="8" rx="1" fill="#09090B" />
              <rect x="82" y="70" width="26" height="8" rx="1" fill="#09090B" />
              <rect x="50" y="96" width="20" height="14" rx="1" fill="#09090B" />
              <rect x="74" y="86" width="8" height="24" rx="1" fill="#09090B" />
              <rect x="86" y="86" width="22" height="24" rx="1" fill="#09090B" />
            </svg>
          </div>

          <div className="space-y-2 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="font-bold text-sm text-ink">Scan with Phone Camera</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                DIRECT APK
              </span>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Open your phone's camera or QR scanner to download the APK installer directly onto your Android device.
            </p>
            <div className="pt-1 flex items-center justify-center sm:justify-start gap-2">
              <button
                type="button"
                onClick={onCopyLink}
                className="inline-flex items-center gap-1.5 text-xs font-mono text-ink underline underline-offset-4 hover:opacity-80 transition-opacity cursor-pointer"
              >
                {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Share2 className="h-3.5 w-3.5" />}
                {copiedLink ? "Link Copied!" : "Copy Download Link"}
              </button>
            </div>
          </div>
        </div>

        {/* Installation Steps */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-muted">
            Quick 4-Step Android Installation
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-lg border border-border bg-surface">
              <span className="font-mono text-[10px] text-muted block mb-1">01 / DOWNLOAD</span>
              <p className="font-semibold text-ink">Download APK Package</p>
              <p className="text-[11px] text-muted mt-0.5">procurepilot-v1.0.4.apk (~24 MB)</p>
            </div>
            <div className="p-3 rounded-lg border border-border bg-surface">
              <span className="font-mono text-[10px] text-muted block mb-1">02 / CONFIRM</span>
              <p className="font-semibold text-ink">Tap "Download Anyway"</p>
              <p className="text-[11px] text-muted mt-0.5">Android warning for direct browser downloads</p>
            </div>
            <div className="p-3 rounded-lg border border-border bg-surface">
              <span className="font-mono text-[10px] text-muted block mb-1">03 / PERMISSION</span>
              <p className="font-semibold text-ink">Allow Unknown Apps</p>
              <p className="text-[11px] text-muted mt-0.5">Enable install permission for Chrome/Browser</p>
            </div>
            <div className="p-3 rounded-lg border border-border bg-surface">
              <span className="font-mono text-[10px] text-muted block mb-1">04 / READY</span>
              <p className="font-semibold text-ink">Sign In to Your Store</p>
              <p className="text-[11px] text-muted mt-0.5">Use your merchant email or 1-click demo</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <a
            href={apkUrl !== "#" ? apkUrl : "#"}
            onClick={(e) => {
              if (apkUrl === "#") {
                e.preventDefault();
                toast.info("Direct APK package ready. Please attach your external build URL.", {
                  id: "direct-apk-info",
                });
              }
            }}
            download="procurepilot-v1.0.4.apk"
            className="w-full sm:flex-1"
          >
            <Button
              variant="primary"
              size="lg"
              className="w-full gap-2 font-bold text-xs h-11 cursor-pointer"
            >
              <FileDown className="h-4 w-4" />
              Download APK Directly
            </Button>
          </a>
          <Button
            variant="secondary"
            size="lg"
            onClick={onClose}
            className="w-full sm:w-auto text-xs h-11 px-5 cursor-pointer"
          >
            Close
          </Button>
        </div>

        {/* Store Badges Teaser */}
        <div className="border-t border-border pt-4 flex items-center justify-between text-[11px] font-mono text-muted">
          <span>Google Play Store · Coming Soon</span>
          <span>Apple iOS TestFlight · Coming Soon</span>
        </div>
      </div>
    </Dialog>
  );
};
