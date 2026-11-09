import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Package, Sparkles, Filter, Tag, Check, ArrowRight, ExternalLink } from "lucide-react";
import { useProducts, catalogApi } from "../api/catalog.js";
import { Product, SupplierOffer } from "../types/api.js";
import { formatPaise } from "../lib/format.js";
import { Input } from "../components/ui/Input.js";
import { Button } from "../components/ui/Button.js";
import { Badge } from "../components/ui/Badge.js";
import { Dialog } from "../components/ui/Dialog.js";
import { Skeleton } from "../components/ui/Skeleton.js";

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
    navigate(`/procure`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-accent uppercase tracking-wider">
            <Package className="h-3.5 w-3.5" />
            <span>Product Catalogue</span>
          </div>
          <h1 className="mt-1 font-heading text-2xl sm:text-3xl font-extrabold text-ink">
            Kirana & Supermarket Goods
          </h1>
          <p className="mt-0.5 text-xs text-muted">
            38 pre-seeded fast-moving retail consumer products with live wholesale supplier offers.
          </p>
        </div>

        <Link to="/procure">
          <Button variant="accent" size="sm" className="gap-2 font-bold">
            <Sparkles className="h-4 w-4" />
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
        <div className="flex flex-wrap items-center gap-2 border-b border-border/60 pb-3">
          <button
            type="button"
            onClick={() => {
              setSelectedCategory(undefined);
              setPage(1);
            }}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
              selectedCategory === undefined
                ? "bg-accent text-accent-ink"
                : "text-muted hover:bg-card-subtle hover:text-ink"
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
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
                selectedCategory === cat
                  ? "bg-accent text-accent-ink"
                  : "text-muted hover:bg-card-subtle hover:text-ink"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-2xl" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-xs text-muted">
          <Package className="mx-auto h-10 w-10 text-muted/60 mb-2" />
          No products matched your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <div
              key={product.id}
              onClick={() => handleOpenProduct(product)}
              className="group cursor-pointer rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-accent/50 hover:shadow-md flex flex-col justify-between"
            >
              <div>
                {/* Image */}
                <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-card-subtle">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://placehold.co/600x400/18181b/ffffff?text=Product";
                    }}
                  />
                  <span className="absolute top-2 left-2 rounded-lg bg-card/80 px-2 py-0.5 text-[10px] font-semibold text-ink backdrop-blur-sm">
                    {product.brand}
                  </span>
                </div>

                <div className="mt-3">
                  <h3 className="font-heading font-bold text-sm text-ink line-clamp-1 group-hover:text-accent transition-colors">
                    {product.name}
                  </h3>
                  <div className="mt-1 flex items-center justify-between text-xs text-muted">
                    <span>{product.category}</span>
                    <span className="font-mono">{product.packSize}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                <span className="text-[11px] text-muted">Unit: {product.unit}</span>
                <span className="font-semibold text-accent flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  View Offers →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border/60 pt-4 text-xs text-muted">
          <span>
            Page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong>
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
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
                src={activeProduct.imageUrl}
                alt={activeProduct.name}
                className="h-20 w-20 rounded-xl object-cover bg-card-subtle"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://placehold.co/600x400/18181b/ffffff?text=Product";
                }}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="accent">{activeProduct.brand}</Badge>
                  <span className="text-xs text-muted">{activeProduct.category}</span>
                </div>
                <p className="mt-1 text-xs text-muted">{activeProduct.description}</p>
                <p className="mt-1 font-mono text-xs text-ink font-semibold">
                  Pack Size: {activeProduct.packSize} • Unit: {activeProduct.unit}
                </p>
              </div>
            </div>

            {/* Wholesale Offers */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">
                Available Wholesale Offers ({activeOffers.length})
              </h4>
              {isLoadingOffers ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : activeOffers.length === 0 ? (
                <p className="text-xs text-muted">No active supplier offers currently listed.</p>
              ) : (
                <div className="divide-y divide-border/60 rounded-xl border border-border bg-card-subtle overflow-hidden">
                  {activeOffers.map((offer, idx) => (
                    <div key={idx} className="p-3 text-xs flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-ink block">Wholesale Stock: {offer.stockQty} {activeProduct.unit}s</span>
                        <span className="text-muted text-[11px]">
                          MOQ: {offer.moq} {activeProduct.unit}s • Lead Time: {offer.deliveryDays} days
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-accent text-sm block">
                          {formatPaise(offer.pricePaise)}
                        </span>
                        <span className="text-[10px] text-muted">per {activeProduct.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2">
              <Button
                variant="accent"
                size="md"
                className="w-full gap-2 font-bold"
                onClick={() => {
                  setActiveProduct(null);
                  handleSourceItem(activeProduct.name);
                }}
              >
                <Sparkles className="h-4 w-4" />
                Launch Agent to Source This Item
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};
