import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Package, Sparkles } from "lucide-react";
import { useProducts, catalogApi } from "../api/catalog.js";
import { Product, SupplierOffer } from "../types/api.js";
import { formatPaise } from "../lib/format.js";
import { Input } from "../components/ui/Input.js";
import { Button } from "../components/ui/Button.js";
import { Dialog } from "../components/ui/Dialog.js";
import { Skeleton } from "../components/ui/Skeleton.js";
import { getProductImageUrl, CATEGORY_FALLBACK_IMAGES } from "../lib/productImages.js";

export const Products: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);

  // Selected product modal state
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [activeOffers, setActiveOffers] = useState<SupplierOffer[]>([]);
  const [isLoadingOffers, setIsLoadingOffers] = useState(false);

  const { data, isLoading } = useProducts({
    q: search ? search : undefined,
    category: selectedCategory,
    page,
    limit: 20,
  });

  const products = data?.products || [];
  const categories = data?.categories || [];
  const pagination = data?.pagination;

  const handleOpenProduct = async (product: Product) => {
    setActiveProduct(product);
    setIsLoadingOffers(true);
    try {
      const res = await catalogApi.getProduct(product.id);
      setActiveOffers(res.offers || []);
    } catch {
      setActiveOffers([]);
    } finally {
      setIsLoadingOffers(false);
    }
  };

  const handleSourceItem = (productName: string) => {
    navigate(`/procure?prefill=${encodeURIComponent(`Restock 20 units of ${productName}`)}`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-muted">
            <Package className="h-3.5 w-3.5 text-muted" />
            <span>Product Catalogue</span>
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
            Kirana & FMCG Master Catalog
          </h1>
          <p className="mt-0.5 text-xs text-muted">
            38 pre-seeded fast-moving retail consumer products with live wholesale supplier offers.
          </p>
        </div>

        <Link to="/procure">
          <Button variant="primary" size="sm" className="gap-2 font-bold text-xs h-9 px-4 shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.15)]">
            <Sparkles className="h-3.5 w-3.5" />
            Natural Language Sourcing
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4">
        <div className="max-w-md">
          <Input
            placeholder="Search items by name, brand, or alias..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            startIcon={<Search className="h-4 w-4 text-muted" />}
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border pb-4">
          <button
            type="button"
            onClick={() => {
              setSelectedCategory(undefined);
              setPage(1);
            }}
            className={`px-3 py-1.5 text-xs font-mono transition-all rounded-[4px] cursor-pointer ${
              selectedCategory === undefined
                ? "bg-ink text-background font-bold shadow-sm"
                : "text-muted hover:text-ink hover:bg-black/5 dark:hover:bg-white/[0.04]"
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setSelectedCategory(cat);
                setPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-mono transition-all rounded-[4px] cursor-pointer ${
                selectedCategory === cat
                  ? "bg-ink text-background font-bold shadow-sm"
                  : "text-muted hover:text-ink hover:bg-black/5 dark:hover:bg-white/[0.04]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-[10px]" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-[12px] border border-dashed border-border bg-surface p-12 text-center text-xs text-muted font-mono">
          <Package className="mx-auto h-8 w-8 text-muted mb-2" />
          No products matched your search filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => {
            const displayImageUrl = getProductImageUrl(product);

            return (
              <div
                key={product.id}
                onClick={() => handleOpenProduct(product)}
                className="group cursor-pointer rounded-[10px] border border-border bg-surface p-4 shadow-sm transition-all duration-200 hover:border-border-strong hover:shadow-lg dark:hover:shadow-[0_0_25px_rgba(255,255,255,0.06)] flex flex-col justify-between"
              >
                <div>
                  {/* Image */}
                  <div className="relative aspect-video w-full overflow-hidden rounded-[6px] bg-neutral-100 dark:bg-black/40 border border-border">
                    <img
                      src={displayImageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = CATEGORY_FALLBACK_IMAGES.default;
                      }}
                    />
                    <span className="absolute top-2 left-2 rounded-[4px] bg-black/80 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-white backdrop-blur-md border border-white/10">
                      {product.brand}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="mt-3.5">
                    <div className="text-[11px] font-mono uppercase text-muted tracking-wider">
                      {product.category}
                    </div>
                    <h3 className="text-sm font-bold text-ink mt-0.5 line-clamp-1 group-hover:underline">
                      {product.name}
                    </h3>
                    <p className="mt-1 text-xs text-muted line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs font-mono">
                  <span className="text-muted">{product.packSize}</span>
                  <div className="text-right">
                    <span className="text-[10px] text-muted block uppercase">From</span>
                    <span className="font-bold text-ink tabular-nums">
                      {formatPaise(product.minPricePaise || 0)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border pt-6 text-xs font-mono">
          <span className="text-muted">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} items)
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="text-xs h-8 px-3"
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="text-xs h-8 px-3"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Product Details & Offers Modal */}
      <Dialog
        isOpen={Boolean(activeProduct)}
        onClose={() => setActiveProduct(null)}
        title={activeProduct?.name || "Product Offers"}
      >
        {activeProduct && (
          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <img
                src={getProductImageUrl(activeProduct)}
                alt={activeProduct.name}
                className="h-20 w-20 rounded-[8px] object-cover bg-neutral-100 dark:bg-black border border-border"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = CATEGORY_FALLBACK_IMAGES.default;
                }}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase font-bold text-ink border border-border px-1.5 py-0.2 rounded-[3px] bg-surface-elevated">
                    {activeProduct.brand}
                  </span>
                  <span className="text-xs text-muted font-mono">{activeProduct.category}</span>
                </div>
                <p className="mt-1 text-xs text-ink/80 font-sans">{activeProduct.description}</p>
                <p className="mt-1 font-mono text-xs text-muted">
                  Pack Size: {activeProduct.packSize} · Unit: {activeProduct.unit}
                </p>
              </div>
            </div>

            {/* Wholesale Offers */}
            <div>
              <h4 className="text-[11px] font-mono uppercase tracking-widest text-muted mb-2">
                Available Wholesale Offers ({activeOffers.length})
              </h4>
              {isLoadingOffers ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : activeOffers.length === 0 ? (
                <p className="text-xs font-mono text-muted">No active supplier offers currently listed.</p>
              ) : (
                <div className="divide-y divide-border rounded-[8px] border border-border bg-surface-elevated overflow-hidden">
                  {activeOffers.map((offer, idx) => {
                    const supplierName =
                      typeof offer.supplierId === "object" && offer.supplierId !== null
                        ? offer.supplierId.name
                        : "Wholesale Distributor";
                    const score =
                      typeof offer.supplierId === "object" && offer.supplierId !== null
                        ? offer.supplierId.reliabilityScore
                        : 95;

                    return (
                      <div key={idx} className="flex items-center justify-between p-3 text-xs font-mono">
                        <div>
                          <div className="font-bold text-ink">{supplierName}</div>
                          <div className="text-[11px] text-muted">
                            Stock: {offer.stockQty} units · MOQ: {offer.moq} · Lead: {offer.deliveryDays}d
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-extrabold text-ink tabular-nums">
                            {formatPaise(offer.pricePaise)}
                          </div>
                          <div className="text-[10px] text-emerald-600 dark:text-emerald-400">
                            {score}% score
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Procure Trigger */}
            <div className="pt-3 border-t border-border flex items-center justify-between">
              <span className="text-xs text-muted font-mono">Ready to restock?</span>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleSourceItem(activeProduct.name)}
                className="gap-2 font-bold text-xs"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Create Purchase Request
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};
