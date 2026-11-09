import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Building2, ShieldCheck, MapPin, Star, Truck, Phone, Mail, Sparkles, CheckCircle2 } from "lucide-react";
import { useSuppliers, catalogApi } from "../api/catalog.js";
import { Supplier, SupplierOffer } from "../types/api.js";
import { formatPaise } from "../lib/format.js";
import { Button } from "../components/ui/Button.js";
import { Badge } from "../components/ui/Badge.js";
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-accent uppercase tracking-wider">
            <Building2 className="h-3.5 w-3.5" />
            <span>Supplier Network</span>
          </div>
          <h1 className="mt-1 font-heading text-2xl sm:text-3xl font-extrabold text-ink">
            Verified Wholesale Distributors
          </h1>
          <p className="mt-0.5 text-xs text-muted">
            Audited regional FMCG distributors, millers, and wholesale trading partners.
          </p>
        </div>

        <Link to="/procure">
          <Button variant="accent" size="sm" className="gap-2 font-bold">
            <Sparkles className="h-4 w-4" />
            Request Optimization
          </Button>
        </Link>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs font-semibold text-muted">City:</span>
        {["All", "Mumbai", "Pune", "Ahmedabad", "Delhi", "Bengaluru"].map((c) => {
          const isSelected = (c === "All" && !selectedCity) || selectedCity === c;
          return (
            <button
              key={c}
              type="button"
              onClick={() => setSelectedCity(c === "All" ? undefined : c)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
                isSelected
                  ? "bg-accent text-accent-ink"
                  : "text-muted hover:bg-card-subtle hover:text-ink"
              }`}
            >
              {c}
            </button>
          );
        })}
      </div>

      {/* Suppliers Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56 w-full rounded-2xl" />
          ))}
        </div>
      ) : suppliers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-xs text-muted">
          No suppliers found matching current criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {suppliers.map((supplier) => (
            <div
              key={supplier.id}
              onClick={() => handleOpenSupplier(supplier)}
              className="group cursor-pointer rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:border-accent/50 hover:shadow-md flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-card-subtle text-ink">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-sm text-ink group-hover:text-accent transition-colors">
                        {supplier.name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-muted">
                        <MapPin className="h-3 w-3" />
                        <span>{supplier.city}, {supplier.state}</span>
                      </div>
                    </div>
                  </div>

                  {supplier.verified && (
                    <Badge variant="success" className="gap-1 text-[10px]">
                      <CheckCircle2 className="h-3 w-3" /> Verified
                    </Badge>
                  )}
                </div>

                {/* Score Tickers */}
                <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-card-subtle p-3 text-center">
                  <div>
                    <span className="text-[10px] text-muted block">Reliability</span>
                    <span className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {supplier.reliabilityScore}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted block">Lead Time</span>
                    <span className="font-mono text-sm font-bold text-ink">
                      {supplier.avgDeliveryDays}d
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted block">Rating</span>
                    <span className="font-mono text-sm font-bold text-amber-500 flex items-center justify-center gap-0.5">
                      <Star className="h-3 w-3 fill-current" />
                      {supplier.rating}
                    </span>
                  </div>
                </div>

                {/* Freight info */}
                <div className="mt-3 text-xs text-muted space-y-1">
                  <div className="flex justify-between">
                    <span>Base Freight:</span>
                    <span className="font-mono font-medium text-ink">{formatPaise(supplier.shippingFeePaise)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Free Shipping Above:</span>
                    <span className="font-mono font-medium text-ink">{formatPaise(supplier.freeShippingAbovePaise)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                <span className="text-muted truncate max-w-[140px]">{supplier.tags.slice(0, 2).join(", ")}</span>
                <span className="font-semibold text-accent group-hover:translate-x-0.5 transition-transform">
                  View Catalogue →
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
            <div className="rounded-xl border border-border bg-card-subtle p-4 text-xs space-y-2">
              <div className="flex items-center justify-between font-semibold">
                <span className="flex items-center gap-1.5 text-ink">
                  <Mail className="h-3.5 w-3.5 text-muted" /> {activeSupplier.contact.email}
                </span>
                <span className="flex items-center gap-1.5 text-ink">
                  <Phone className="h-3.5 w-3.5 text-muted" /> {activeSupplier.contact.phone}
                </span>
              </div>
              <div className="flex items-center justify-between text-muted pt-1 border-t border-border/60">
                <span>Minimum Order Value:</span>
                <span className="font-mono font-bold text-ink">{formatPaise(activeSupplier.minOrderValuePaise)}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">
                Active Listed Wholesale Lines ({activeOffers.length})
              </h4>
              {isLoadingOffers ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : activeOffers.length === 0 ? (
                <p className="text-xs text-muted">No active lines currently cached for this supplier.</p>
              ) : (
                <div className="divide-y divide-border/60 rounded-xl border border-border bg-card-subtle max-h-64 overflow-y-auto">
                  {activeOffers.map((offer, idx) => (
                    <div key={idx} className="p-3 text-xs flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-ink block">Wholesale Stock: {offer.stockQty} units</span>
                        <span className="text-muted text-[11px]">MOQ: {offer.moq} • Lead Time: {offer.deliveryDays}d</span>
                      </div>
                      <span className="font-mono font-bold text-accent">
                        {formatPaise(offer.pricePaise)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Link to="/procure" className="block pt-2">
              <Button variant="accent" size="md" className="w-full gap-2 font-bold">
                <Sparkles className="h-4 w-4" />
                Procure from this Supplier
              </Button>
            </Link>
          </div>
        )}
      </Dialog>
    </div>
  );
};
