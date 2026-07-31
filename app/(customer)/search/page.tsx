"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  Star,
  Clock,
  Timer,
  SlidersHorizontal,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import { LocationModal } from "@/components/customer/location-modal";
import { useLocationStore } from "@/store/location-store";
import { createClient } from "@/lib/supabase/client";

const FILTER_CHIPS = [
  { id: "nearby", label: "Nearby" },
  { id: "fast", label: "Fast Delivery" },
  { id: "top_rated", label: "Top Rated" },
  { id: "veg", label: "Pure Veg" },
  { id: "offers", label: "Offers" },
  { id: "open", label: "Open Now" },
];

const SEARCH_RESULTS = [
  {
    id: "l-artisan",
    name: "L'Artisan Bistro",
    cuisine: "French • European • 25-35 min",
    rating: "4.8",
    status: "Accepting Orders",
    badge: "Free Delivery",
    badgeBg: "bg-[#994700] text-white",
    image:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
    tags: ["nearby", "fast", "top_rated", "open"],
  },
  {
    id: "umami-house",
    name: "Umami House",
    cuisine: "Japanese • Sushi • 20-30 min",
    rating: "4.9",
    status: "Popular Near You",
    badge: "Top Pick",
    badgeBg: "bg-[#ff7a00] text-white",
    image:
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80",
    tags: ["nearby", "top_rated", "open"],
  },
  {
    id: "terra-nova",
    name: "Terra Nova Pizza",
    cuisine: "Italian • Wood Fired • 15-25 min",
    rating: "4.7",
    status: "Fastest in your area",
    badge: "30% OFF",
    badgeBg: "bg-black/60 text-white backdrop-blur-md",
    image:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
    tags: ["fast", "offers", "open"],
  },
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("nearby");
  const [userName, setUserName] = useState("shamu");
  const { location, openModal } = useLocationStore();

  useEffect(() => {
    async function loadUser() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user?.user_metadata?.full_name) {
          setUserName(user.user_metadata.full_name);
        }
      } catch {
        // Fallback
      }
    }
    loadUser();
  }, []);

  const hour = new Date().getHours();
  const timePrefix =
    hour >= 5 && hour < 12
      ? "Good morning"
      : hour >= 12 && hour < 17
      ? "Good afternoon"
      : "Good evening";

  const greeting = `${timePrefix}, ${userName}`;

  const filteredResults = useMemo(() => {
    return SEARCH_RESULTS.filter((r) => {
      if (query.trim()) {
        const q = query.toLowerCase();
        const matchesName = r.name.toLowerCase().includes(q);
        const matchesCuisine = r.cuisine.toLowerCase().includes(q);
        if (!matchesName && !matchesCuisine) return false;
      }

      if (activeFilter === "fast") return r.tags.includes("fast");
      if (activeFilter === "top_rated") return parseFloat(r.rating) >= 4.8;
      if (activeFilter === "offers") return r.tags.includes("offers");
      if (activeFilter === "open") return r.tags.includes("open");
      return true;
    });
  }, [query, activeFilter]);

  return (
    <div className="min-h-screen bg-[#fff8f5] text-[#251912] selection:bg-[#ffdbc8] selection:text-[#321200] pb-32">
      {/* Location Modal */}
      <LocationModal />

      {/* Main Container */}
      <main className="pt-8 pb-32 px-4 md:px-12 max-w-7xl mx-auto space-y-8">
        {/* Search Input Section */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="relative max-w-2xl mx-auto md:mx-0">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#584235]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cravings? Search for dishes, cuisines, or restaurants..."
              className="w-full pl-14 pr-6 py-5 bg-white border-none rounded-[20px] shadow-xs focus:ring-2 focus:ring-[#994700] transition-all text-sm font-semibold placeholder:text-[#584235]/50"
              autoFocus
            />
          </div>
        </section>

        {/* Filter Chips Scroll */}
        <section className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-3 pb-2">
            {FILTER_CHIPS.map((chip) => {
              const active = activeFilter === chip.id;
              return (
                <button
                  key={chip.id}
                  onClick={() => setActiveFilter(chip.id)}
                  className={`px-6 py-2.5 rounded-full text-xs font-black whitespace-nowrap transition-all active:scale-95 shadow-xs ${
                    active
                      ? "bg-[#251912] text-white"
                      : "bg-[#fbe3d7] text-[#584235] hover:bg-[#f6ded2]"
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Dynamic Results Section */}
        {filteredResults.length > 0 ? (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-[#251912]">Curated for you</h2>
              <button
                onClick={() => {
                  setQuery("");
                  setActiveFilter("nearby");
                }}
                className="text-[#994700] text-xs font-extrabold hover:underline"
              >
                Clear Filters
              </button>
            </div>

            {/* Bento / Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredResults.map((r) => (
                <Link key={r.id} href="/restaurants" className="group cursor-pointer">
                  <div className="relative rounded-[24px] overflow-hidden aspect-[4/3] ambient-glow mb-4 shadow-sm">
                    <img
                      src={r.image}
                      alt={r.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />

                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1">
                      <Star className="w-4 h-4 fill-[#ff7a00] text-[#ff7a00]" />
                      <span className="text-xs font-black text-[#251912]">{r.rating}</span>
                    </div>

                    {r.badge && (
                      <div className={`absolute bottom-4 left-4 px-3 py-1 rounded-full ${r.badgeBg}`}>
                        <span className="text-[10px] font-black uppercase tracking-wider">
                          {r.badge}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-[#251912] group-hover:text-[#994700] transition-colors">
                      {r.name}
                    </h3>
                    <p className="text-xs font-semibold text-[#584235]">{r.cuisine}</p>

                    <div className="flex items-center gap-2 pt-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-extrabold text-emerald-700">{r.status}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : (
          /* Empty State ("Taste Discovery Failed") */
          <section className="flex flex-col items-center justify-center py-16 text-center max-w-lg mx-auto space-y-4">
            <div className="w-56 h-56 relative flex items-center justify-center">
              <div className="absolute inset-0 bg-[#ffdbc8]/40 rounded-full blur-3xl animate-pulse" />
              <div className="text-7xl relative z-10">👨‍🍳</div>
            </div>

            <h3 className="text-2xl font-black text-[#251912]">Taste Discovery Failed</h3>
            <p className="text-xs text-[#584235] font-semibold max-w-sm mx-auto leading-relaxed">
              We couldn&apos;t find any restaurants matching your refined palate. Try adjusting your filters or searching for something else.
            </p>

            <button
              onClick={() => {
                setQuery("");
                setActiveFilter("nearby");
              }}
              className="px-8 py-3.5 bg-[#994700] text-white rounded-full font-black text-xs hover:shadow-lg hover:shadow-[#994700]/20 transition-all active:scale-95 flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Reset All Filters
            </button>
          </section>
        )}
      </main>
    </div>
  );
}
