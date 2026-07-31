"use client";

import { useState } from "react";
import { X, Plus, Minus, ShoppingBag, Sparkles } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { toast } from "@/hooks/use-toast";

export interface FoodDetailItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  is_veg: boolean;
  category_name?: string | null;
  food_images?: Array<{ storage_path: string; is_primary: boolean }>;
}

interface Props {
  item: FoodDetailItem | null;
  restaurantId: string;
  restaurantName: string;
  onClose: () => void;
}

export function FoodItemDetailModal({
  item,
  restaurantId,
  restaurantName,
  onClose,
}: Props) {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((s) => s.addItem);

  if (!item) return null;

  const photoUrl = item.food_images?.[0]?.storage_path;
  const totalPrice = item.price * quantity;

  const handleAddToCart = () => {
    addItem({
      food_item_id: item.id,
      name: item.name,
      price: item.price,
      quantity,
      restaurant_id: restaurantId,
      restaurant_name: restaurantName,
      image_url: photoUrl || undefined,
      is_veg: item.is_veg,
    });
    toast.success(`Added ${quantity} x ${item.name} to cart!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-background rounded-3xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Showcase Image Banner with Full Photo Visibility */}
        <div className="relative h-72 sm:h-80 bg-neutral-950 border-b border-border overflow-hidden flex items-center justify-center">
          {photoUrl ? (
            <>
              {/* Ambient blurred backdrop */}
              <img
                src={photoUrl}
                alt=""
                className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-125 pointer-events-none"
              />
              {/* Uncropped foreground photo */}
              <img
                src={photoUrl}
                alt={item.name}
                className="relative z-10 max-h-full max-w-full object-contain p-4 drop-shadow-2xl"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/20 via-neutral-900 to-secondary/20 text-neutral-400">
              <span className="text-7xl mb-2">🍔</span>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                T-Bites Fresh Choice
              </span>
            </div>
          )}

          {/* Vignette gradients */}
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/70 to-transparent z-20 pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/80 to-transparent z-20 pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 z-30 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 backdrop-blur-md border border-white/20 transition-all hover:scale-105 active:scale-95 shadow-lg"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Veg / Non-Veg Pill */}
          <div className="absolute bottom-3.5 left-3.5 z-30 px-3.5 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white text-xs font-extrabold flex items-center gap-2 shadow-lg">
            <span
              className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center text-[8px] font-bold ${
                item.is_veg ? "border-emerald-400 text-emerald-400" : "border-red-500 text-red-500"
              }`}
            >
              ●
            </span>
            <span>{item.is_veg ? "Pure Veg" : "Non-Veg"}</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Title & Price Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
                {item.name}
              </h2>
              {item.category_name && (
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-md bg-surface border border-border text-[11px] font-semibold text-foreground-muted uppercase tracking-wider">
                  {item.category_name}
                </span>
              )}
            </div>
            <div className="text-3xl font-extrabold text-primary shrink-0">
              ₹{item.price}
            </div>
          </div>

          {/* Description Section */}
          <div>
            <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" /> Item Details & Ingredients
            </h3>
            {item.description ? (
              <p className="text-sm text-foreground-muted leading-relaxed whitespace-pre-line bg-surface/60 p-4 rounded-2xl border border-border/60">
                {item.description}
              </p>
            ) : (
              <p className="text-xs text-foreground-muted/60 italic p-3 rounded-xl bg-surface/30">
                No extra description provided for this dish.
              </p>
            )}
          </div>

          {/* Quantity Selector */}
          <div className="pt-2">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-foreground mb-2">
              Select Quantity
            </label>
            <div className="flex items-center justify-between p-3.5 rounded-2xl border border-border bg-surface">
              <span className="text-sm font-semibold text-foreground">Quantity</span>
              <div className="flex items-center gap-3 bg-background border border-border rounded-xl px-2.5 py-1.5 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1 rounded-lg hover:bg-surface text-foreground transition-colors disabled:opacity-30"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-extrabold text-sm text-foreground">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-1 rounded-lg hover:bg-surface text-foreground transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Action Bar */}
        <div className="p-4 border-t border-border bg-surface flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] text-foreground-muted uppercase font-extrabold tracking-wider">Total Price</p>
            <p className="text-2xl font-extrabold text-foreground">₹{totalPrice}</p>
          </div>
          <button
            onClick={handleAddToCart}
            className="flex-1 py-3.5 px-6 rounded-2xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/25 hover:bg-primary-dark transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
          >
            <ShoppingBag className="w-4 h-4" /> Add to Cart — ₹{totalPrice}
          </button>
        </div>
      </div>
    </div>
  );
}
