import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Trash2, Plus, Minus, Sparkles } from "lucide-react";
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
    unitPricePaise: 14000,
    quantity: 20,
  },
  {
    id: "item-2",
    name: "Daawat Basmati Everyday Rice",
    supplier: "National FMCG Distributors",
    unit: "kg",
    unitPricePaise: 9500,
    quantity: 30,
  },
  {
    id: "item-3",
    name: "Surf Excel Quick Wash Detergent",
    supplier: "Bharat Wholesalers",
    unit: "kg",
    unitPricePaise: 21000,
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
      <div className="border-b border-border pb-6">
        <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-muted">
          <ShoppingCart className="h-3.5 w-3.5 text-muted" />
          <span>Restock Line Item Customization</span>
        </div>
        <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
          Custom Purchase Cart
        </h1>
        <p className="mt-0.5 text-xs text-muted">
          Adjust item quantities and recalculate supplier wholesale allocations.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-[12px] border border-dashed border-border bg-surface p-12 text-center">
          <ShoppingCart className="mx-auto h-10 w-10 text-muted" />
          <h3 className="mt-4 text-base font-bold text-ink">Cart is empty</h3>
          <p className="mt-1 text-xs text-muted">Use natural language procurement to generate an optimized basket.</p>
          <Link to="/procure" className="mt-6 inline-block">
            <Button variant="primary" size="md" className="gap-2 font-bold text-xs">
              <Sparkles className="h-3.5 w-3.5" /> Launch Procurement Agent
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          {/* Items list */}
          <div className="rounded-[12px] border border-border bg-surface p-6 shadow-sm lg:col-span-8">
            <h3 className="text-sm font-bold text-ink tracking-tight border-b border-border pb-4">
              Restock Lines ({items.length})
            </h3>
            <div className="divide-y divide-border">
              {items.map((item) => (
                <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-sm text-ink">{item.name}</h4>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted font-mono">
                      <span>Supplier: <strong className="text-ink">{item.supplier}</strong></span>
                      <span>Rate: <strong className="text-ink tabular-nums">{formatPaise(item.unitPricePaise)}</strong> / {item.unit}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6">
                    {/* Stepper */}
                    <div className="flex items-center gap-1.5 rounded-[6px] border border-border bg-surface-elevated p-1">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, -1)}
                        className="flex h-6 w-6 items-center justify-center rounded-[4px] hover:bg-black/5 dark:hover:bg-white/[0.08] text-ink transition cursor-pointer"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center font-mono text-xs font-bold text-ink tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, 1)}
                        className="flex h-6 w-6 items-center justify-center rounded-[4px] hover:bg-black/5 dark:hover:bg-white/[0.08] text-ink transition cursor-pointer"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="text-right min-w-[80px]">
                      <span className="font-mono text-sm font-bold text-ink tabular-nums block">
                        {formatPaise(item.unitPricePaise * item.quantity)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-muted hover:text-rose-500 transition-colors p-1"
                      title="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cart Summary */}
          <div className="rounded-[12px] border border-border bg-surface p-6 shadow-sm lg:col-span-4 sticky top-6 space-y-4">
            <h3 className="text-sm font-bold text-ink tracking-tight border-b border-border pb-3">
              Estimated Order Summary
            </h3>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex justify-between text-muted">
                <span>Items Subtotal</span>
                <span className="font-medium text-ink tabular-nums">{formatPaise(subtotalPaise)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Estimated Freight</span>
                <span className="font-medium text-ink tabular-nums">
                  {estimatedShippingPaise === 0 ? "FREE" : formatPaise(estimatedShippingPaise)}
                </span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between text-sm font-bold text-ink">
                <span>Estimated Total</span>
                <span className="text-base text-ink tabular-nums">{formatPaise(totalPaise)}</span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={handleProceedToProcure}
              className="w-full gap-2 font-bold text-xs h-11 mt-2 shadow-sm"
            >
              <Sparkles className="h-4 w-4" />
              Optimize With Knapsack Solver
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
