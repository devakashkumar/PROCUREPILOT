import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, ArrowRight, Trash2, Plus, Minus, Sparkles, Building2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../components/ui/Button.js";
import { formatPaise } from "../lib/format.js";
import { useAuthStore } from "../store/authStore.js";

interface CartItem {
  id: string;
  name: string;
  supplier: string;
  unit: string;
  unitPricePaise: number;
  quantity: number;
}

const DEFAULT_CART_ITEMS: CartItem[] = [
  {
    id: "item-1",
    name: "Fortune Refined Cooking Oil",
    supplier: "Bharat Wholesalers",
    unit: "L",
    unitPricePaise: 14000, // ₹140
    quantity: 20,
  },
  {
    id: "item-2",
    name: "Daawat Basmati Everyday Rice",
    supplier: "National FMCG Distributors",
    unit: "kg",
    unitPricePaise: 9500, // ₹95
    quantity: 30,
  },
  {
    id: "item-3",
    name: "Surf Excel Quick Wash Detergent",
    supplier: "Bharat Wholesalers",
    unit: "kg",
    unitPricePaise: 21000, // ₹210
    quantity: 15,
  },
];

export const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { business } = useAuthStore();
  const [items, setItems] = useState<CartItem[]>(DEFAULT_CART_ITEMS);

  const subtotalPaise = items.reduce((sum, item) => sum + item.unitPricePaise * item.quantity, 0);
  const estimatedShippingPaise = subtotalPaise > 500000 ? 0 : 25000;
  const totalPaise = subtotalPaise + estimatedShippingPaise;

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = Math.max(1, item.quantity + delta);
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    toast.info("Item removed from cart");
  };

  const handleProceedToProcure = () => {
    const prompt = items
      .map((item) => `${item.quantity} ${item.unit} ${item.name}`)
      .join(", ");
    navigate(`/procure?prefill=${encodeURIComponent(prompt)}`);
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-border/60 pb-5">
        <div className="flex items-center gap-2 text-xs font-mono font-semibold text-accent uppercase tracking-wider">
          <ShoppingCart className="h-3.5 w-3.5" />
          <span>Restock Line Item Customization</span>
        </div>
        <h1 className="mt-1 font-heading text-2xl sm:text-3xl font-extrabold text-ink">
          Custom Purchase Cart
        </h1>
        <p className="mt-0.5 text-xs text-muted">
          Adjust item quantities and recalculate supplier wholesale allocations.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <ShoppingCart className="mx-auto h-12 w-12 text-muted/60" />
          <h3 className="mt-4 font-heading text-lg font-bold text-ink">Cart is empty</h3>
          <p className="mt-1 text-xs text-muted">Use natural language procurement to generate an optimized basket.</p>
          <Link to="/procure" className="mt-6 inline-block">
            <Button variant="accent" size="md" className="gap-2 font-bold">
              <Sparkles className="h-4 w-4" /> Go to Procurement Agent
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          {/* Items list */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-8">
            <h3 className="font-heading text-base font-bold text-ink border-b border-border/60 pb-4">
              Line Items ({items.length})
            </h3>
            <div className="divide-y divide-border/60">
              {items.map((item) => (
                <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-sm text-ink">{item.name}</h4>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted">
                      <span>Supplier: <strong className="text-ink">{item.supplier}</strong></span>
                      <span>Rate: <strong className="font-mono text-ink">{formatPaise(item.unitPricePaise)}</strong> / {item.unit}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6">
                    {/* Stepper */}
                    <div className="flex items-center gap-2 rounded-xl border border-border bg-card-subtle p-1">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, -1)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-card text-ink transition"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center font-mono text-sm font-bold text-ink">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-card text-ink transition"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="text-right min-w-[5rem]">
                      <span className="font-mono text-sm font-bold text-ink">
                        {formatPaise(item.unitPricePaise * item.quantity)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-muted hover:text-rose-500 transition p-1"
                      title="Remove line"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Box */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-4 sticky top-6 space-y-5">
            <h3 className="font-heading text-base font-bold text-ink border-b border-border/60 pb-3">
              Order Estimate
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-muted">
                <span>Subtotal ({items.length} items)</span>
                <span className="font-mono font-medium text-ink">{formatPaise(subtotalPaise)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Estimated Freight & Shipping</span>
                <span className="font-mono font-medium text-ink">
                  {estimatedShippingPaise === 0 ? "FREE" : formatPaise(estimatedShippingPaise)}
                </span>
              </div>
              <div className="border-t border-border/60 pt-3 flex justify-between text-sm font-bold text-ink">
                <span>Estimated Authoritative Total</span>
                <span className="font-mono text-base text-accent">{formatPaise(totalPaise)}</span>
              </div>
            </div>

            <Button
              type="button"
              variant="accent"
              size="lg"
              className="w-full gap-2 font-bold shadow-md shadow-accent/20"
              onClick={handleProceedToProcure}
            >
              <Sparkles className="h-4 w-4" />
              Re-optimize with Agent
            </Button>
            <p className="text-[11px] text-center text-muted">
              Sends itemized demands directly to knapsack solver with live vendor pricing.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
