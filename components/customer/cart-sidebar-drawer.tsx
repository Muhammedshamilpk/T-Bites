"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingBag, X, Plus, Minus, Trash2, ArrowRight, Store, Sparkles } from "lucide-react";
import { useCartStore } from "@/store/cart-store";

export function CartSidebarDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const { items, restaurantName, updateQuantity, removeItem, clearCart, getTotalCount, getTotalPrice } = useCartStore();

  const totalCount = getTotalCount();
  const subtotal = getTotalPrice();
  const deliveryFee = subtotal > 299 || subtotal === 0 ? 0 : 30;
  const grandTotal = subtotal + deliveryFee;

  return (
    <>
      {/* Floating Home Page Quick Cart Pill Toggle */}
      {totalCount > 0 && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 right-5 z-40 px-5 py-3 rounded-full bg-primary text-white font-extrabold text-sm shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 border border-white/20"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-white text-primary text-[10px] font-black flex items-center justify-center shadow-xs">
              {totalCount}
            </span>
          </div>
          <span>My Cart</span>
          <span className="bg-black/20 px-2.5 py-0.5 rounded-full text-xs font-black">
            ₹{grandTotal}
          </span>
        </button>
      )}

      {/* Cart Slide-Over Drawer Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-background h-full shadow-2xl flex flex-col justify-between border-l border-border animate-in slide-in-from-right duration-300">
            
            {/* Drawer Header */}
            <div className="p-6 border-b border-border bg-surface flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-foreground text-lg">Your Order Cart</h3>
                  {restaurantName && (
                    <p className="text-xs text-foreground-muted font-medium flex items-center gap-1">
                      <Store className="w-3 h-3 text-primary" /> {restaurantName}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full hover:bg-surface-hover text-foreground-muted hover:text-foreground transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="text-6xl">🛒</div>
                <h4 className="text-lg font-bold text-foreground">Your cart is empty</h4>
                <p className="text-xs text-foreground-muted max-w-xs">
                  Explore top local kitchens on the homepage and add your favourite dishes!
                </p>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-md hover:bg-primary-dark transition-all"
                >
                  Browse Menu
                </button>
              </div>
            ) : (
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                {items.map((item) => (
                  <div
                    key={item.food_item_id}
                    className="p-3.5 rounded-2xl border border-border bg-surface flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-14 h-14 rounded-xl object-cover border border-border shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-background border border-border flex items-center justify-center text-xl shrink-0">
                          🍔
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2.5 h-2.5 rounded border flex items-center justify-center text-[7px] font-bold ${
                              item.is_veg ? "border-emerald-500 text-emerald-500" : "border-red-500 text-red-500"
                            }`}
                          >
                            ●
                          </span>
                          <h5 className="font-extrabold text-foreground text-sm truncate">
                            {item.name}
                          </h5>
                        </div>
                        <p className="text-xs font-bold text-primary mt-0.5">
                          ₹{item.price * item.quantity}
                        </p>
                      </div>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-2 bg-background border border-border rounded-xl px-2 py-1 shrink-0">
                      <button
                        onClick={() => updateQuantity(item.food_item_id, item.quantity - 1)}
                        className="p-1 hover:bg-surface text-foreground transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-4 text-center font-extrabold text-xs text-foreground">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.food_item_id, item.quantity + 1)}
                        className="p-1 hover:bg-surface text-foreground transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Trash Delete */}
                    <button
                      onClick={() => removeItem(item.food_item_id)}
                      className="p-1.5 text-foreground-muted hover:text-error transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {/* Clear Cart Button */}
                <div className="pt-2 text-right">
                  <button
                    onClick={clearCart}
                    className="text-xs font-semibold text-foreground-muted hover:text-error underline transition-colors"
                  >
                    Clear entire cart
                  </button>
                </div>
              </div>
            )}

            {/* Footer Summary & Checkout CTA */}
            {items.length > 0 && (
              <div className="p-6 border-t border-border bg-surface space-y-4">
                <div className="space-y-1.5 text-xs text-foreground-muted font-medium">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-bold text-foreground">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span className="font-bold text-foreground">
                      {deliveryFee === 0 ? <span className="text-emerald-600 font-extrabold">FREE</span> : `₹${deliveryFee}`}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border text-sm font-black text-foreground">
                    <span>Total Amount</span>
                    <span className="text-primary text-base">₹{grandTotal}</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  onClick={() => setIsOpen(false)}
                  className="w-full py-4 rounded-2xl bg-primary hover:bg-primary-dark text-white text-sm font-extrabold shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Proceed to Checkout — ₹{grandTotal} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
