import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Building2, MapPin, Star, Sparkles, CheckCircle2 } from "lucide-react";
import { useSuppliers, catalogApi } from "../api/catalog.js";
import { Supplier, SupplierOffer } from "../types/api.js";
import { formatPaise } from "../lib/format.js";
import { Button } from "../components/ui/Button.js";
import { Dialog } from "../components/ui/Dialog.js";
import { Skeleton } from "../components/ui/Skeleton.js";

export const Suppliers: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState<string | undefined>(undefined);
  const [minReliability, setMinReliability] = useState<number | undefined>(undefined);

  // Supplier detail modal
  const [activeSupplier, setActiveSupplier] = useState<Supplier | null>(null);
  const [activeOffers, setActiveOffers] = useState<SupplierOffer[]>([]);
  const [isLoadingOffers, setIsLoadingOffers] = useState(false);

  const { data, isLoading } = useSuppliers({
    city: selectedCity,
    minReliability,
  });

  const suppliers = data?.suppliers || [];

  const handleOpenSupplier = async (supplier: Supplier) => {
    setActiveSupplier(supplier);
    setIsLoadingOffers(true);
    try {
      const res = await catalogApi.getSupplier(supplier.id);
      setActiveOffers(res.offers || []);
    } catch {
      setActiveOffers([]);
    } finally {
      setIsLoadingOffers(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-muted">
            <Building2 className="h-3.5 w-3.5 text-muted" />
            <span>Supplier Network</span>
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
            Verified Wholesale Distributors
          </h1>
          <p className="mt-0.5 text-xs text-muted">
            Audited regional FMCG distributors, millers, and wholesale trading partners.
          </p>
        </div>

        <Link to="/procure">
          <Button variant="primary" size="sm" className="gap-2 font-bold text-xs h-9 px-4 shadow-[0_0_20px_rgba(255,255,255,0.15)]">
            <Sparkles className="h-3.5 w-3.5" />
            Request Optimization
          </Button>
        </Link>
      </div>

      {/* Filter Chips - Unboxed Clean Discipline */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-4">
        <span className="text-[11px] font-mono uppercase tracking-widest text-muted mr-2">City:</span>
        {["All", "Mumbai", "Pune", "Ahmedabad", "Delhi", "Bengaluru"].map((c) => {
          const isSelected = (c === "All" && !selectedCity) || selectedCity === c;
          return (
            <button
              key={c}
              type="button"
              onClick={() => setSelectedCity(c === "All" ? undefined : c)}
              className={`px-3 py-1.5 text-xs font-mono transition-all rounded-[4px] cursor-pointer ${
                isSelected
                  ? "bg-white text-background font-bold"
                  : "text-muted hover:text-ink hover:bg-surface-elevated"
              }`}
            >
              {c}
            </button>
          );
        })}
      </div>

      {/* Suppliers Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56 w-full rounded-[10px]" />
          ))}
        </div>
      ) : suppliers.length === 0 ? (
        <div className="rounded-[12px] border border-dashed border-border-strong bg-surface p-12 text-center text-xs font-mono text-muted">
          No distributors match your current filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {suppliers.map((supplier) => (
            <div
              key={supplier.id}
              onClick={() => handleOpenSupplier(supplier)}
              className="group cursor-pointer rounded-[10px] border border-border bg-surface p-5 shadow-sm transition-all duration-200 hover:border-border-strong hover:shadow-[0_0_25px_rgba(255,255,255,0.06)] flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-[6px] bg-surface-elevated border border-border text-ink">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-ink group-hover:text-ink/80 transition-colors">
                        {supplier.name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs font-mono text-muted mt-0.5">
                        <MapPin className="h-3 w-3" />
                        <span>{supplier.city}, {supplier.state}</span>
                      </div>
                    </div>
                  </div>

                  {supplier.verified && (
                    <span className="font-mono text-[9px] uppercase tracking-wider text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded-[3px] bg-emerald-950/20 flex items-center gap-1">
                      <CheckCircle2 className="h-2.5 w-2.5" /> VERIFIED
                    </span>
                  )}
                </div>

                {/* Score Tickers */}
                <div className="mt-4 grid grid-cols-3 gap-2 rounded-[6px] bg-black/40 border border-white/[0.06] p-3 text-center font-mono">
                  <div>
                    <span className="text-[10px] text-muted block uppercase">Reliability</span>
                    <span className="text-sm font-bold text-emerald-400 tabular-nums">
                      {supplier.reliabilityScore}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted block uppercase">Lead Time</span>
                    <span className="text-sm font-bold text-ink tabular-nums">
                      {supplier.avgDeliveryDays}d
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted block uppercase">Rating</span>
                    <span className="text-sm font-bold text-ink flex items-center justify-center gap-0.5 tabular-nums">
                      <Star className="h-3 w-3 fill-white text-ink" />
                      {supplier.rating}
                    </span>
                  </div>
                </div>

                {/* Freight info */}
                <div className="mt-3 text-xs font-mono text-muted space-y-1">
                  <div className="flex justify-between">
                    <span>Base Freight:</span>
                    <span className="text-ink font-medium tabular-nums">{formatPaise(supplier.shippingFeePaise)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Free Shipping Above:</span>
                    <span className="text-ink font-medium tabular-nums">{formatPaise(supplier.freeShippingAbovePaise)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
                <span className="text-muted truncate max-w-[140px]">{supplier.tags.slice(0, 2).join(", ")}</span>
                <span className="font-semibold text-ink group-hover:translate-x-0.5 transition-transform">
                  View Quotes →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Supplier Offers Modal */}
      <Dialog
        isOpen={Boolean(activeSupplier)}
        onClose={() => setActiveSupplier(null)}
        title={activeSupplier?.name || "Wholesaler Profile"}
      >
        {activeSupplier && (
          <div className="space-y-5">
            <div className="rounded-[8px] border border-border bg-surface-elevated p-4 text-xs font-mono space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted">{activeSupplier.contact.email}</span>
                <span className="text-muted">{activeSupplier.contact.phone}</span>
              </div>
              <div className="flex items-center justify-between text-muted pt-2 border-t border-border">
                <span>Min Order Value:</span>
                <span className="font-bold text-ink tabular-nums">{formatPaise(activeSupplier.minOrderValuePaise)}</span>
              </div>
            </div>

            <div>
              <h4 className="text-[11px] font-mono uppercase tracking-widest text-muted mb-2">
                Active Listed Wholesale Lines ({activeOffers.length})
              </h4>
              {isLoadingOffers ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : activeOffers.length === 0 ? (
                <p className="text-xs font-mono text-muted">No active lines currently cached for this supplier.</p>
              ) : (
                <div className="divide-y divide-border rounded-[8px] border border-border bg-surface-elevated max-h-64 overflow-y-auto">
                  {activeOffers.map((offer, idx) => (
                    <div key={idx} className="p-3 text-xs flex items-center justify-between font-mono">
                      <div>
                        <span className="font-bold text-ink block">Stock: {offer.stockQty} units</span>
                        <span className="text-muted text-[11px]">MOQ: {offer.moq} · Lead: {offer.deliveryDays}d</span>
                      </div>
                      <span className="font-bold text-ink tabular-nums">
                        {formatPaise(offer.pricePaise)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Link to="/procure" className="block pt-2">
              <Button variant="primary" size="md" className="w-full gap-2 font-bold text-xs h-10 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                <Sparkles className="h-3.5 w-3.5" />
                Procure from this Supplier
              </Button>
            </Link>
          </div>
        )}
      </Dialog>
    </div>
  );
};
