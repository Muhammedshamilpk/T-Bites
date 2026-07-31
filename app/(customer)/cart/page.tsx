"use client";

import { useCartStore } from "@/store/cart-store";
import { useLocationStore } from "@/store/location-store";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Minus,
  Plus,
  Trash2,
  ChevronRight,
  Banknote,
  Info,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { useState, useEffect } from "react";
import { LocationModal } from "@/components/customer/location-modal";

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const [instructions, setInstructions] = useState("");
  const { items, restaurantName, updateQuantity, removeItem, clearCart, getTotalPrice } =
    useCartStore();
  const { location, openModal } = useLocationStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const subtotal = getTotalPrice();
  const deliveryFee = subtotal > 299 || subtotal === 0 ? 0 : 25;
  const platformFee = subtotal > 0 ? 5 : 0;
  const discount = subtotal > 500 ? 50 : 0;
  const total = Math.max(0, subtotal + deliveryFee + platformFee - discount);

  return (
    <div className="min-h-screen bg-[#fff8f5] text-[#251912] selection:bg-[#ffdbc8] selection:text-[#321200] pb-36">
      {/* Location Modal */}
      <LocationModal />

      {/* Top Header AppBar */}
      <header className="fixed top-0 w-full z-50 bg-[#fff8f5]/80 backdrop-blur-xl shadow-[0_0_40px_rgba(0,0,0,0.04)]">
        <div className="flex justify-between items-center px-4 md:px-12 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link
              href="/restaurants"
              className="p-2 text-[#994700] hover:bg-[#ffeadf] rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-xl sm:text-2xl font-black text-[#994700]">
              Your Cart
            </h1>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="pt-28 px-4 md:px-12 max-w-7xl mx-auto">
        {items.length === 0 ? (
          /* Empty Cart State */
          <div className="min-h-[70vh] flex flex-col justify-center items-center text-center max-w-md mx-auto py-12">
            <div className="relative w-64 h-64 md:w-80 md:h-80 mb-8">
              {/* Circular background glow */}
              <div className="absolute inset-0 bg-[#ff7a00]/10 rounded-full blur-3xl animate-pulse" />
              {/* 3D Illustration inside circle */}
              <div className="relative w-full h-full rounded-full overflow-hidden bg-[#fff1ea] ambient-glow border-4 border-white flex items-center justify-center shadow-xl">
                <img
                  alt="Empty cart illustration"
                  className="w-full h-full object-cover"
                  src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80"
                />
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-[#251912] mb-3">
              Your Cart is Empty
            </h2>
            <p className="text-xs text-[#584235] font-semibold px-4 mb-8 leading-relaxed">
              Good food is always cooking! Discover top local kitchens and add your favourite dishes.
            </p>

            <Link
              href="/restaurants"
              className="w-full bg-[#ff7a00] text-white font-black text-sm px-12 py-4 rounded-[18px] shadow-lg shadow-orange-500/20 hover:bg-[#994700] transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              <span>Browse Restaurants</span>
              <span className="text-lg">🧭</span>
            </Link>
          </div>
        ) : (
          /* Populated Cart Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column (Items & Instructions) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Restaurant Summary Card */}
              <section className="bg-white rounded-[24px] p-6 ambient-glow flex items-center gap-4 shadow-xs border border-neutral-100">
                <div className="w-16 h-16 rounded-[18px] overflow-hidden bg-orange-100 flex-shrink-0 flex items-center justify-center text-3xl">
                  🏪
                </div>
                <div>
                  <h2 className="text-lg font-black text-[#251912]">
                    {restaurantName || "Local Kitchen"}
                  </h2>
                  <p className="text-xs text-[#5e5e5e] font-semibold">
                    {location.city || "Nearby"} • 25-30 mins delivery
                  </p>
                </div>
              </section>

              {/* Food Items List */}
              <section className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-black text-[#251912] uppercase tracking-widest">
                    Order Items ({items.length})
                  </h3>
                  <button
                    onClick={clearCart}
                    className="text-xs font-extrabold text-red-600 hover:underline"
                  >
                    Clear All
                  </button>
                </div>

                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.food_item_id}
                      className="bg-white rounded-[24px] p-4 ambient-glow flex gap-4 items-center shadow-xs border border-neutral-100"
                    >
                      <div className="w-20 h-20 rounded-[18px] overflow-hidden flex-shrink-0 bg-neutral-100">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl bg-orange-50 text-orange-400">
                            🍲
                          </div>
                        )}
                      </div>

                      <div className="flex-grow space-y-1">
                        <div className="flex justify-between items-start">
                          <h4 className="text-base font-black text-[#251912]">
                            {item.name}
                          </h4>
                          <p className="text-base font-black text-[#994700]">
                            ₹{item.price * item.quantity}
                          </p>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                          <p className="text-xs text-[#5e5e5e] font-semibold">
                            ₹{item.price} each
                          </p>

                          <div className="flex items-center gap-3">
                            {/* Quantity Stepper */}
                            <div className="flex items-center bg-[#ffeadf] rounded-full p-1">
                              <button
                                onClick={() =>
                                  updateQuantity(item.food_item_id, item.quantity - 1)
                                }
                                className="w-7 h-7 rounded-full bg-white text-[#994700] font-black text-xs shadow-xs flex items-center justify-center hover:bg-neutral-50 transition-transform active:scale-95"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="px-3 font-black text-xs text-[#251912]">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(item.food_item_id, item.quantity + 1)
                                }
                                className="w-7 h-7 rounded-full bg-white text-[#994700] font-black text-xs shadow-xs flex items-center justify-center hover:bg-neutral-50 transition-transform active:scale-95"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <button
                              onClick={() => removeItem(item.food_item_id)}
                              className="p-1.5 text-neutral-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Special Instructions */}
              <section className="space-y-2">
                <label
                  htmlFor="instructions"
                  className="text-xs font-black text-[#251912] uppercase tracking-widest px-1 block"
                >
                  Special Instructions
                </label>
                <div className="bg-white rounded-[24px] p-4 ambient-glow border border-neutral-100 shadow-xs focus-within:ring-2 focus-within:ring-[#ff7a00] transition-all">
                  <textarea
                    id="instructions"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="Any allergies? Door code? Specific preferences..."
                    className="w-full bg-transparent border-none focus:outline-none font-semibold text-xs text-[#251912] min-h-[90px] resize-none placeholder:text-[#e0c0af]"
                  />
                </div>
              </section>
            </div>

            {/* Right Column (Payment & Bill Summary) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Payment Method */}
              <section className="bg-white rounded-[24px] p-6 ambient-glow space-y-4 shadow-xs border border-neutral-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-[#251912]">
                    Payment Method
                  </h3>
                  <ShieldCheck className="w-5 h-5 text-[#994700]" />
                </div>

                <div className="flex items-center gap-4 bg-[#fff1ea] p-4 rounded-[18px] border border-[#f6ded2]">
                  <div className="bg-[#ff7a00] text-white p-2.5 rounded-xl shrink-0">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-[#251912]">
                      Cash on Delivery only
                    </p>
                    <p className="text-[11px] font-semibold text-[#5e5e5e]">
                      Pay securely at your doorstep
                    </p>
                  </div>
                </div>
              </section>

              {/* Bill Details */}
              <section className="bg-white rounded-[24px] p-6 ambient-glow space-y-4 shadow-xs border border-neutral-100">
                <h3 className="text-lg font-black text-[#251912]">
                  Bill Summary
                </h3>

                <div className="space-y-2 text-xs font-semibold text-[#5e5e5e]">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-black text-[#251912]">
                      ₹{subtotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span
                      className={
                        deliveryFee === 0
                          ? "text-emerald-600 font-black"
                          : "font-black text-[#251912]"
                      }
                    >
                      {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Platform Fee</span>
                    <span className="font-black text-[#251912]">
                      ₹{platformFee}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount (Promo)</span>
                      <span className="font-black">-₹{discount}</span>
                    </div>
                  )}
                </div>

                <div className="h-[1px] bg-neutral-100 w-full my-4" />

                <div className="flex justify-between items-center">
                  <span className="text-lg font-black text-[#251912]">
                    Total Amount
                  </span>
                  <span className="text-2xl font-black text-[#994700]">
                    ₹{total.toFixed(2)}
                  </span>
                </div>

                <div className="bg-[#ffeadf] p-4 rounded-[18px] flex items-start gap-3">
                  <Info className="w-5 h-5 text-[#ff7a00] shrink-0 mt-0.5" />
                  <p className="text-[11px] font-semibold text-[#5c2800] leading-relaxed">
                    Includes all applicable taxes and convenience fees. Delivery partners will wait for a maximum of 10 minutes at the location.
                  </p>
                </div>

                {/* Primary Proceed to Checkout Button */}
                <Link
                  href="/checkout"
                  className="w-full py-4 rounded-2xl bg-[#ff7a00] text-white font-black text-sm shadow-xl shadow-orange-500/25 hover:bg-[#994700] transition-all active:scale-95 flex items-center justify-center gap-2 text-center"
                >
                  <span>Proceed to Checkout</span>
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </section>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
