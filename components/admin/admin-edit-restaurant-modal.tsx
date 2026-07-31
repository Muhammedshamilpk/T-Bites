"use client";

import { useState } from "react";
import { updateRestaurantSanityAction } from "@/actions/admin.actions";
import { Edit2, X, Store, Mail, Phone, MapPin, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Props {
  restaurant: {
    _id: string;
    name: string;
    ownerEmail?: string;
    contactNumber?: string;
    address?: string;
    status?: string;
  };
}

export function AdminEditRestaurantModal({ restaurant }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await updateRestaurantSanityAction(restaurant._id, formData);

    setLoading(false);

    if (result.success) {
      toast.success("Restaurant details updated successfully!");
      setIsOpen(false);
    } else {
      toast.error(result.error || "Failed to update restaurant details.");
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-3 py-1.5 rounded-xl bg-surface border border-border text-foreground hover:border-primary hover:text-primary transition-all text-xs font-extrabold flex items-center gap-1.5"
      >
        <Edit2 className="w-3.5 h-3.5" /> Edit
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-background rounded-3xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-border flex items-center justify-between bg-surface">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-foreground text-lg">
                    Edit {restaurant.name}
                  </h3>
                  <p className="text-xs text-foreground-muted">
                    Super Admin Partner Management
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

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-extrabold text-foreground uppercase tracking-wider mb-1">
                  Restaurant Store Name *
                </label>
                <div className="relative">
                  <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
                  <input
                    type="text"
                    name="name"
                    defaultValue={restaurant.name}
                    required
                    className="w-full h-11 pl-10 pr-4 bg-surface border border-border rounded-xl text-sm font-semibold focus:outline-none focus:border-primary text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-foreground uppercase tracking-wider mb-1">
                  Owner Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
                  <input
                    type="email"
                    name="ownerEmail"
                    defaultValue={restaurant.ownerEmail || ""}
                    className="w-full h-11 pl-10 pr-4 bg-surface border border-border rounded-xl text-sm font-semibold focus:outline-none focus:border-primary text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-foreground uppercase tracking-wider mb-1">
                  Contact Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
                  <input
                    type="text"
                    name="contactNumber"
                    defaultValue={restaurant.contactNumber || ""}
                    className="w-full h-11 pl-10 pr-4 bg-surface border border-border rounded-xl text-sm font-semibold focus:outline-none focus:border-primary text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-foreground uppercase tracking-wider mb-1">
                  Street Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
                  <input
                    type="text"
                    name="address"
                    defaultValue={restaurant.address || ""}
                    className="w-full h-11 pl-10 pr-4 bg-surface border border-border rounded-xl text-sm font-semibold focus:outline-none focus:border-primary text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-foreground uppercase tracking-wider mb-1">
                  Store Status
                </label>
                <select
                  name="status"
                  defaultValue={restaurant.status || "active"}
                  className="w-full h-11 px-4 bg-surface border border-border rounded-xl text-sm font-semibold focus:outline-none focus:border-primary text-foreground"
                >
                  <option value="active">Active (Can Accept Orders)</option>
                  <option value="suspended">Suspended (Blocked from Login)</option>
                </select>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-border text-foreground text-xs font-extrabold hover:bg-surface transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-extrabold shadow-md hover:bg-primary-dark transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
