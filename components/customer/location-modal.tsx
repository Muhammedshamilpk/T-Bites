"use client";

import { useState, useEffect } from "react";
import { useLocationStore } from "@/store/location-store";
import { Navigation, MapPin, Search, Loader2, Sparkles, Check, Edit3, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export function LocationModal() {
  const { location, setLocation, isModalOpen, closeModal, openModal } = useLocationStore();
  const [mounted, setMounted] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);

  // Form states
  const [manualAddress, setManualAddress] = useState(location.address || "");
  const [city, setCity] = useState(location.city || "Bangalore");
  const [landmark, setLandmark] = useState(location.landmark || "");
  const [showManualForm, setShowManualForm] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Auto-open modal on first visit if location is not set
    if (!location.isSet) {
      openModal();
    }
  }, [location.isSet, openModal]);

  if (!mounted) return null;
  if (!isModalOpen && location.isSet) return null;

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // OpenStreetMap Reverse Geocoding API
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          const readableAddress =
            data.display_name || `${data.address?.road || "Main Street"}, ${data.address?.suburb || "Area"}`;
          const detectedCity =
            data.address?.city || data.address?.town || data.address?.state_district || "Bangalore";
          const postcode = data.address?.postcode || "560064";

          setLocation({
            address: readableAddress,
            city: detectedCity,
            pincode: postcode,
            latitude,
            longitude,
          });
          toast.success("📍 Delivery location detected!");
        } catch (err) {
          setLocation({
            address: `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
            city: "Bangalore",
            latitude,
            longitude,
          });
          toast.success("📍 Location set!");
        } finally {
          setIsDetecting(false);
        }
      },
      (error) => {
        setIsDetecting(false);
        toast.error("Location permission denied. Please enter your address manually.");
        setShowManualForm(true);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSaveManualAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualAddress.trim()) {
      toast.error("Please enter a street address.");
      return;
    }

    setLocation({
      address: manualAddress,
      city: city || "Bangalore",
      landmark,
    });
    toast.success("📍 Delivery location saved!");
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-background rounded-t-[2.5rem] sm:rounded-3xl border border-border shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/25">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-foreground tracking-tight">Select Delivery Location</h2>
              <p className="text-xs text-foreground-muted font-medium">Find local kitchens serving food near you</p>
            </div>
          </div>

          {location.isSet && (
            <button
              onClick={closeModal}
              className="p-2 rounded-xl text-foreground-muted hover:text-foreground hover:bg-surface transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content Body - Scrollable with bottom padding for mobile nav */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(85vh-80px)] pb-24 sm:pb-6">
          {!showManualForm ? (
            <div className="space-y-4">
              {/* Detect Current Location CTA */}
              <button
                onClick={handleDetectLocation}
                disabled={isDetecting}
                className="w-full p-4.5 rounded-2xl bg-primary text-white font-extrabold text-sm shadow-xl shadow-primary/25 hover:bg-primary-dark disabled:opacity-60 transition-all flex items-center justify-center gap-3 group"
              >
                {isDetecting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Detecting Location...
                  </>
                ) : (
                  <>
                    <Navigation className="w-5 h-5 group-hover:scale-110 transition-transform" /> 📍 Use Current Location
                  </>
                )}
              </button>

              <div className="flex items-center gap-3 my-2">
                <div className="h-px bg-border flex-1" />
                <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">OR</span>
                <div className="h-px bg-border flex-1" />
              </div>

              {/* Enter Address Manually CTA */}
              <button
                onClick={() => setShowManualForm(true)}
                className="w-full p-4 rounded-2xl bg-surface border border-border text-foreground hover:border-primary/40 font-bold text-sm transition-all flex items-center justify-center gap-3"
              >
                <Edit3 className="w-4 h-4 text-primary" /> ✍️ Enter Address Manually
              </button>

              {/* Current Saved Location Preview */}
              {location.isSet && location.address && (
                <div className="p-4 rounded-2xl bg-surface/50 border border-border space-y-1">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider">ACTIVE LOCATION</span>
                  <p className="text-xs font-bold text-foreground truncate">{location.address}</p>
                  <p className="text-[11px] text-foreground-muted">{location.city} {location.pincode ? `• ${location.pincode}` : ""}</p>
                </div>
              )}
            </div>
          ) : (
            /* Manual Form */
            <form onSubmit={handleSaveManualAddress} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1">
                  House / Street Address *
                </label>
                <input
                  type="text"
                  required
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                  placeholder="e.g. Flat / Street Name, Area"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-foreground text-xs font-medium focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Bangalore"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-foreground text-xs font-medium focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1">
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="Near Water Tank"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-foreground text-xs font-medium focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowManualForm(false)}
                  className="flex-1 py-3.5 rounded-xl border border-border text-foreground-muted text-xs font-bold hover:bg-surface"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 rounded-xl bg-primary text-white text-xs font-extrabold shadow-lg shadow-primary/25 hover:bg-primary-dark"
                >
                  Save Address
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
