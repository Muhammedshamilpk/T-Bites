"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Phone,
  User,
  ShoppingBag,
  Loader2,
  ArrowRight,
  CheckCircle2,
  Store,
  ArrowLeft,
  ShieldCheck,
  Banknote,
} from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { placeDirectOrderAction } from "@/actions/order.actions";
import { toast } from "@/hooks/use-toast";

export function CheckoutClientPage() {
  const router = useRouter();
  const { items, restaurantId, restaurantName, clearCart, getTotalPrice } = useCartStore();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("Yelahanka");
  const [pincode, setPincode] = useState("560064");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isPlacingOrder, startTransition] = useTransition();

  const subtotal = getTotalPrice();
  const deliveryFee = subtotal > 299 || subtotal === 0 ? 0 : 25;
  const platformFee = subtotal > 0 ? 5 : 0;
  const grandTotal = Math.max(0, subtotal + deliveryFee + platformFee);

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.warning("Your cart is empty!");
      return;
    }

    if (!restaurantId) {
      toast.error("Restaurant selection missing. Please select items from a restaurant.");
      return;
    }

    startTransition(async () => {
      const res = await placeDirectOrderAction({
        restaurant_id: restaurantId,
        customer_name: customerName || "Customer",
        customer_phone: customerPhone || "9876543210",
        address_line: addressLine || "Yelahanka, Bangalore",
        city: city || "Bangalore",
        pincode: pincode || "560064",
        items: items.map((i) => ({
          food_item_id: i.food_item_id,
          food_name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
      });

      if (res.success) {
        toast.success("🎉 Order placed successfully! The restaurant has been notified.");
        clearCart();
        router.push("/orders");
      } else {
        if (res.error?.includes("Authentication Required")) {
          setShowAuthModal(true);
        } else {
          toast.error(res.error || "Failed to place order. Please try again.");
        }
      }
    });
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#fff8f5] text-[#251912] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center p-8 rounded-3xl bg-white ambient-glow border border-neutral-100 shadow-sm space-y-4">
          <div className="text-6xl">🛒</div>
          <h1 className="text-xl font-black text-[#251912]">Your cart is empty</h1>
          <p className="text-xs text-[#5e5e5e] font-semibold">
            Add some delicious items from a restaurant before checking out!
          </p>
          <Link
            href="/restaurants"
            className="inline-flex items-center px-8 py-3.5 rounded-full bg-[#994700] text-white font-black text-xs shadow-md hover:bg-[#753400] transition-all"
          >
            Browse Restaurants
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff8f5] text-[#251912] selection:bg-[#ffdbc8] selection:text-[#321200] pb-32">
      {/* Top Header AppBar */}
      <header className="fixed top-0 w-full z-50 bg-[#fff8f5]/80 backdrop-blur-xl shadow-[0_0_40px_rgba(0,0,0,0.04)]">
        <div className="flex justify-between items-center px-4 md:px-12 py-4 max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <Link
              href="/cart"
              className="p-2 text-[#994700] hover:bg-[#ffeadf] rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-xl sm:text-2xl font-black text-[#994700]">Checkout</h1>
          </div>
          <p className="text-xs font-black text-[#5e5e5e] truncate max-w-xs">
            From: <span className="text-[#994700]">{restaurantName || "Local Kitchen"}</span>
          </p>
        </div>
      </header>

      {/* Main Container */}
      <main className="pt-24 px-4 md:px-0 max-w-4xl mx-auto">
        <form onSubmit={handlePlaceOrder} className="grid lg:grid-cols-5 gap-6">
          {/* Left Column: Delivery Details */}
          <div className="lg:col-span-3 space-y-6">
            <div className="p-6 rounded-3xl bg-white ambient-glow border border-neutral-100 shadow-xs space-y-4">
              <h2 className="text-lg font-black text-[#251912] flex items-center gap-2">
                <User className="w-5 h-5 text-[#994700]" /> Delivery Details
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-black text-[#584235] block mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Muhammed Shamil"
                    className="w-full px-4 py-3 rounded-2xl bg-[#fff1ea] border border-[#f6ded2] text-xs font-semibold text-[#251912] focus:outline-none focus:ring-2 focus:ring-[#ff7a00]"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-[#584235] block mb-1">
                    Phone Number (COD Verification)
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="e.g. 9048795432"
                    className="w-full px-4 py-3 rounded-2xl bg-[#fff1ea] border border-[#f6ded2] text-xs font-semibold text-[#251912] focus:outline-none focus:ring-2 focus:ring-[#ff7a00]"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-[#584235] block mb-1">
                    Street Address & House No.
                  </label>
                  <input
                    type="text"
                    required
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                    placeholder="e.g. Pannikkodan House, Yelahanka"
                    className="w-full px-4 py-3 rounded-2xl bg-[#fff1ea] border border-[#f6ded2] text-xs font-semibold text-[#251912] focus:outline-none focus:ring-2 focus:ring-[#ff7a00]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-black text-[#584235] block mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-[#fff1ea] border border-[#f6ded2] text-xs font-semibold text-[#251912] focus:outline-none focus:ring-2 focus:ring-[#ff7a00]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-[#584235] block mb-1">
                      Pincode
                    </label>
                    <input
                      type="text"
                      required
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-[#fff1ea] border border-[#f6ded2] text-xs font-semibold text-[#251912] focus:outline-none focus:ring-2 focus:ring-[#ff7a00]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="p-6 rounded-3xl bg-white ambient-glow border border-neutral-100 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-[#251912] flex items-center gap-2">
                  <Banknote className="w-5 h-5 text-[#994700]" /> Payment Method
                </h2>
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>

              <div className="p-4 rounded-2xl bg-[#fff1ea] border border-[#f6ded2] flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-xs font-black text-[#251912]">
                    Cash on Delivery (COD)
                  </p>
                  <p className="text-[11px] font-semibold text-[#5e5e5e]">
                    Pay cash to delivery partner upon arrival
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Place Order Button */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-3xl bg-white ambient-glow border border-neutral-100 shadow-xs space-y-4">
              <h2 className="text-lg font-black text-[#251912] flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#994700]" /> Summary ({items.length})
              </h2>

              <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide">
                {items.map((i) => (
                  <div key={i.food_item_id} className="flex justify-between text-xs font-semibold text-[#5e5e5e]">
                    <span>
                      {i.quantity}x {i.name}
                    </span>
                    <span className="font-black text-[#251912]">₹{i.price * i.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-neutral-100 space-y-2 text-xs font-semibold text-[#5e5e5e]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-black text-[#251912]">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="font-black text-[#251912]">₹{deliveryFee}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-[#251912] pt-2 border-t border-neutral-100">
                  <span>Total Payable</span>
                  <span className="text-[#994700]">₹{grandTotal}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isPlacingOrder}
                className="w-full py-4 rounded-2xl bg-[#ff7a00] text-white font-black text-xs shadow-lg shadow-orange-500/20 hover:bg-[#994700] transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isPlacingOrder ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Placing Order...
                  </>
                ) : (
                  <>
                    Confirm COD Order <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </main>

      {/* Auth Gate Modal for Unauthenticated Customers */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-neutral-100 shadow-2xl space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-orange-100 text-[#ff7a00] flex items-center justify-center text-3xl mx-auto shadow-sm">
              🔐
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-[#251912]">Account Required</h3>
              <p className="text-xs text-[#5e5e5e] font-semibold leading-relaxed">
                To place your food order on T-Bites, please log in to your existing account or create a new account.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <Link
                href="/login?redirect=/checkout"
                className="w-full py-3.5 rounded-2xl bg-[#ff7a00] text-white font-black text-xs shadow-md hover:bg-[#994700] transition-all flex items-center justify-center gap-2"
              >
                Log In to Existing Account
              </Link>
              
              <Link
                href="/signup?redirect=/checkout"
                className="w-full py-3.5 rounded-2xl border-2 border-[#ff7a00] text-[#ff7a00] font-black text-xs hover:bg-orange-50 transition-all flex items-center justify-center gap-2"
              >
                New Customer? Create Account
              </Link>

              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="text-xs font-extrabold text-[#5e5e5e] hover:underline pt-2"
              >
                Cancel & Return to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
