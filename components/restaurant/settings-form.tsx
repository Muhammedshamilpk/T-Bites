"use client";

import { useActionState, useState } from "react";
import {
  createRestaurantAction,
  updateRestaurantAction,
} from "@/actions/restaurant.actions";
import type { RestaurantFormState } from "@/actions/restaurant.actions";
import type { Restaurant } from "@/types/domain.types";
import {
  Loader2,
  Camera,
  Bell,
  Utensils,
  Truck,
  CheckCircle,
  AlertTriangle,
  Clock,
  MapPin,
  Save,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Props {
  restaurant?: Restaurant | null;
}

export function RestaurantSettingsForm({ restaurant }: Props) {
  const isEditing = !!restaurant;

  const actionFn = isEditing
    ? updateRestaurantAction.bind(null, restaurant.id)
    : createRestaurantAction;

  const [state, action, pending] = useActionState<RestaurantFormState, FormData>(
    actionFn,
    undefined
  );

  // Interactive settings state
  const [deliveryRadius, setDeliveryRadius] = useState(8.5);
  const [orderAlerts, setOrderAlerts] = useState(true);
  const [liveStatus, setLiveStatus] = useState(true);
  const [acceptDelivery, setAcceptDelivery] = useState(true);
  const [monFriActive, setMonFriActive] = useState(true);
  const [satActive, setSatActive] = useState(true);
  const [sunActive, setSunActive] = useState(false);

  return (
    <form action={action} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start pb-12">
      {state?.message && (
        <div
          className={`lg:col-span-2 p-4 rounded-2xl text-xs font-black border ${
            state.success
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {state.message}
        </div>
      )}

      {/* Column 1: Profile & Operating Hours */}
      <div className="space-y-8">
        {/* Profile Section */}
        <section className="space-y-6 bg-white p-6 md:p-8 rounded-[24px] border border-[#e0c0af]/30 ambient-glow shadow-xs">
          <div className="flex items-center justify-between border-b border-[#e0c0af]/20 pb-4">
            <h2 className="text-xl font-black text-[#251912]">
              Restaurant Profile
            </h2>
            <button
              type="submit"
              disabled={pending}
              className="text-[#994700] font-black text-xs uppercase tracking-wider hover:underline flex items-center gap-1.5"
            >
              {pending ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#994700]" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Save Changes</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-shrink-0 flex flex-col items-center gap-3">
              <div className="w-28 h-28 rounded-2xl bg-[#fff1ea] border-2 border-dashed border-[#e0c0af] flex flex-col items-center justify-center text-[#8c7263] hover:border-[#ff7a00] hover:text-[#994700] cursor-pointer transition-all shadow-xs">
                <Camera className="w-6 h-6 mb-1 text-[#994700]" />
                <span className="text-[10px] font-black uppercase tracking-wider">
                  Update Logo
                </span>
              </div>
            </div>

            <div className="flex-grow grid grid-cols-1 gap-4">
              <div className="space-y-1">
                <label className="font-black text-[10px] text-[#8c7263] uppercase tracking-wider px-1">
                  Establishment Name
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  defaultValue={restaurant?.name || "T-Bites Gourmet"}
                  placeholder="e.g. T-Bites Bistro"
                  className="w-full bg-[#fff1ea] border-none rounded-xl px-4 py-3 text-xs font-black text-[#251912] focus:bg-white focus:ring-1 focus:ring-[#ff7a00]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-black text-[10px] text-[#8c7263] uppercase tracking-wider px-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    defaultValue={(restaurant as any)?.email || "contact@tbites.com"}
                    placeholder="contact@restaurant.com"
                    className="w-full bg-[#fff1ea] border-none rounded-xl px-4 py-3 text-xs font-black text-[#251912] focus:bg-white focus:ring-1 focus:ring-[#ff7a00]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-black text-[10px] text-[#8c7263] uppercase tracking-wider px-1">
                    Primary Phone
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    defaultValue={restaurant?.phone || "+91 98765 43210"}
                    placeholder="+91 98765 43210"
                    className="w-full bg-[#fff1ea] border-none rounded-xl px-4 py-3 text-xs font-black text-[#251912] focus:bg-white focus:ring-1 focus:ring-[#ff7a00]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-black text-[10px] text-[#8c7263] uppercase tracking-wider px-1">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={restaurant?.description || ""}
                  placeholder="Describe your restaurant offerings, specialties, and dining experience..."
                  className="w-full bg-[#fff1ea] border-none rounded-xl px-4 py-3 text-xs font-semibold text-[#251912] focus:bg-white focus:ring-1 focus:ring-[#ff7a00] resize-none"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Operating Hours Section */}
        <section className="space-y-6 bg-white p-6 md:p-8 rounded-[24px] border border-[#e0c0af]/30 ambient-glow shadow-xs">
          <h2 className="text-xl font-black text-[#251912] border-b border-[#e0c0af]/20 pb-4">
            Operating Hours
          </h2>

          <div className="space-y-4">
            {/* Mon - Fri */}
            <div className="flex items-center justify-between p-4 bg-[#fff1ea] rounded-2xl">
              <span className="font-black text-xs text-[#251912] w-28">Mon — Fri</span>
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  defaultValue="09:00"
                  disabled={!monFriActive}
                  className="bg-white border-none rounded-lg px-3 py-1.5 text-xs font-extrabold focus:ring-1 focus:ring-[#ff7a00]"
                />
                <span className="text-xs font-bold text-[#8c7263]">to</span>
                <input
                  type="time"
                  defaultValue="22:00"
                  disabled={!monFriActive}
                  className="bg-white border-none rounded-lg px-3 py-1.5 text-xs font-extrabold focus:ring-1 focus:ring-[#ff7a00]"
                />
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={monFriActive}
                  onChange={(e) => setMonFriActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-[#e0c0af]/50 rounded-full peer peer-checked:bg-[#ff7a00] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
              </label>
            </div>

            {/* Saturday */}
            <div className="flex items-center justify-between p-4 bg-[#fff1ea] rounded-2xl">
              <span className="font-black text-xs text-[#251912] w-28">Saturday</span>
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  defaultValue="10:00"
                  disabled={!satActive}
                  className="bg-white border-none rounded-lg px-3 py-1.5 text-xs font-extrabold focus:ring-1 focus:ring-[#ff7a00]"
                />
                <span className="text-xs font-bold text-[#8c7263]">to</span>
                <input
                  type="time"
                  defaultValue="00:00"
                  disabled={!satActive}
                  className="bg-white border-none rounded-lg px-3 py-1.5 text-xs font-extrabold focus:ring-1 focus:ring-[#ff7a00]"
                />
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={satActive}
                  onChange={(e) => setSatActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-[#e0c0af]/50 rounded-full peer peer-checked:bg-[#ff7a00] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
              </label>
            </div>

            {/* Sunday */}
            <div
              className={`flex items-center justify-between p-4 rounded-2xl transition-all ${
                sunActive ? "bg-[#fff1ea]" : "bg-[#fff1ea]/50 opacity-60"
              }`}
            >
              <span className="font-black text-xs text-[#251912] w-28">Sunday</span>
              {sunActive ? (
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    defaultValue="10:00"
                    className="bg-white border-none rounded-lg px-3 py-1.5 text-xs font-extrabold focus:ring-1 focus:ring-[#ff7a00]"
                  />
                  <span className="text-xs font-bold text-[#8c7263]">to</span>
                  <input
                    type="time"
                    defaultValue="20:00"
                    className="bg-white border-none rounded-lg px-3 py-1.5 text-xs font-extrabold focus:ring-1 focus:ring-[#ff7a00]"
                  />
                </div>
              ) : (
                <span className="text-red-600 font-extrabold text-xs italic">
                  Closed
                </span>
              )}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={sunActive}
                  onChange={(e) => setSunActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-[#e0c0af]/50 rounded-full peer peer-checked:bg-[#ff7a00] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
              </label>
            </div>
          </div>
        </section>
      </div>

      {/* Column 2: Preferences & Platform Settings */}
      <div className="space-y-8">
        {/* Preferences Section */}
        <section className="space-y-6 bg-white p-6 md:p-8 rounded-[24px] border border-[#e0c0af]/30 ambient-glow shadow-xs">
          <h2 className="text-xl font-black text-[#251912] border-b border-[#e0c0af]/20 pb-4">
            Preferences &amp; Notifications
          </h2>

          <div className="space-y-6">
            {/* Order Alerts */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#ffeadf] rounded-2xl flex items-center justify-center shrink-0">
                  <Bell className="w-5 h-5 text-[#994700]" />
                </div>
                <div>
                  <p className="font-black text-sm text-[#251912]">Order Alerts</p>
                  <p className="text-xs font-semibold text-[#8c7263]">
                    Instant push notifications for new incoming orders
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={orderAlerts}
                  onChange={(e) => setOrderAlerts(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#e0c0af]/50 rounded-full peer peer-checked:bg-[#ff7a00] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
              </label>
            </div>

            {/* Live Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#ffeadf] rounded-2xl flex items-center justify-center shrink-0">
                  <Utensils className="w-5 h-5 text-[#994700]" />
                </div>
                <div>
                  <p className="font-black text-sm text-[#251912]">Live Status</p>
                  <p className="text-xs font-semibold text-[#8c7263]">
                    Show your restaurant as &apos;Open&apos; to local diners
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={liveStatus}
                  onChange={(e) => setLiveStatus(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#e0c0af]/50 rounded-full peer peer-checked:bg-[#ff7a00] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
              </label>
            </div>

            {/* Accept Delivery */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#ffeadf] rounded-2xl flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5 text-[#994700]" />
                </div>
                <div>
                  <p className="font-black text-sm text-[#251912]">
                    Accept Delivery
                  </p>
                  <p className="text-xs font-semibold text-[#8c7263]">
                    Toggle marketplace delivery availability
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptDelivery}
                  onChange={(e) => setAcceptDelivery(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#e0c0af]/50 rounded-full peer peer-checked:bg-[#ff7a00] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
              </label>
            </div>
          </div>
        </section>

        {/* Platform Settings Section */}
        <section className="space-y-6 bg-white p-6 md:p-8 rounded-[24px] border border-[#e0c0af]/30 ambient-glow shadow-xs">
          <h2 className="text-xl font-black text-[#251912] border-b border-[#e0c0af]/20 pb-4">
            Platform Settings
          </h2>

          <div className="space-y-8">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="font-black text-xs text-[#251912]">
                  Delivery Radius
                </label>
                <span className="text-[#994700] font-black text-sm">
                  {deliveryRadius} km
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                step="0.5"
                value={deliveryRadius}
                onChange={(e) => setDeliveryRadius(parseFloat(e.target.value))}
                className="w-full h-2 bg-[#fff1ea] rounded-lg appearance-none cursor-pointer accent-[#ff7a00]"
              />
              <div className="flex justify-between text-[10px] text-[#8c7263] uppercase font-black">
                <span>1 km</span>
                <span>20 km</span>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="p-5 bg-red-50/60 rounded-2xl border border-red-200 flex items-center justify-between">
              <div>
                <p className="font-black text-sm text-red-600">Go Offline</p>
                <p className="text-xs font-semibold text-[#8c7263]">
                  Temporarily hide your kitchen from all ordering platforms
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (confirm("Deactivate restaurant live listing temporarily?")) {
                    toast.success("Restaurant set to offline state");
                  }
                }}
                className="px-6 py-2.5 bg-red-600 text-white rounded-xl font-black text-xs hover:bg-red-700 transition-colors shadow-xs shrink-0"
              >
                Deactivate
              </button>
            </div>
          </div>
        </section>
      </div>
    </form>
  );
}
