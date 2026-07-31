"use client";

import { useState } from "react";
import { registerOwnerAndRestaurantAction } from "@/actions/restaurant.actions";
import { Plus, X, Store, User, Mail, Phone, Lock, MapPin, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export function AdminCreateRestaurantModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await registerOwnerAndRestaurantAction(undefined, formData);

    setLoading(false);

    if (result?.success) {
      toast.success(result.message || "Restaurant and owner registered successfully!");
      setIsOpen(false);
      window.location.reload();
    } else {
      toast.error(result?.message || "Failed to register restaurant.");
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-md hover:bg-primary-dark transition-all flex items-center gap-1.5"
      >
        <Plus className="w-4 h-4" /> Add New Restaurant
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-background rounded-3xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-border flex items-center justify-between bg-surface">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-foreground text-lg">
                    Register New Restaurant
                  </h3>
                  <p className="text-xs text-foreground-muted">
                    Main Admin registration portal for new store partners
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full hover:bg-surface text-foreground-muted hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="text-xs font-black text-primary uppercase tracking-wider mb-2">
                1. Owner Details
              </div>

              {/* Owner Full Name */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Owner Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
                  <input
                    name="full_name"
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface text-foreground text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              {/* Email & Phone Grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="owner@restaurant.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface text-foreground text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
                    <input
                      name="phone"
                      type="tel"
                      required
                      placeholder="9876543210"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface text-foreground text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Initial Account Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
                  <input
                    name="password"
                    type="password"
                    required
                    minLength={6}
                    placeholder="At least 6 characters"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface text-foreground text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-border text-xs font-black text-primary uppercase tracking-wider mb-2">
                2. Restaurant Info
              </div>

              {/* Restaurant Name */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Restaurant Name *
                </label>
                <div className="relative">
                  <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
                  <input
                    name="restaurant_name"
                    type="text"
                    required
                    placeholder="e.g. Spice Garden"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface text-foreground text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              {/* Street Address */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Street Address *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
                  <input
                    name="address_line"
                    type="text"
                    required
                    placeholder="Shop 12, Main Street"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface text-foreground text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              {/* City & Pincode Grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    City *
                  </label>
                  <input
                    name="city"
                    type="text"
                    required
                    placeholder="Downtown"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-foreground text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Pincode *
                  </label>
                  <input
                    name="pincode"
                    type="text"
                    required
                    placeholder="110001"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-foreground text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              {/* Modal Footer Submit */}
              <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-border text-foreground-muted text-xs font-bold hover:bg-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-md hover:bg-primary-dark disabled:opacity-50 flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? "Registering..." : "Register Restaurant"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
