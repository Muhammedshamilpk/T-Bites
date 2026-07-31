"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Search as SearchIcon,
  MapPin,
  Star,
  Clock,
  RotateCcw,
  Loader2,
  SlidersHorizontal,
} from "lucide-react";
import { LocationModal } from "@/components/customer/location-modal";
import { createClient } from "@/lib/supabase/client";
import { getAllSanityRestaurants } from "@/lib/sanity/sanity-store.service";

const FILTER_CHIPS = [
  { id: "all", label: "All Stores" },
  { id: "open", label: "Open Now" },
  { id: "top_rated", label: "Top Rated" },
  { id: "fast", label: "Fast Delivery" },
];

export interface RealRestaurantSearchItem {
  id: string;
  name: string;
  description: string | null;
  address_line: string;
  city: string;
  phone: string;
  logo_url: string | null;
  banner_url: string | null;
  status: "open" | "closed" | "holiday";
  approval_status: string;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [restaurants, setRestaurants] = useState<RealRestaurantSearchItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRealRestaurants() {
      try {
        const supabase = createClient();
        const { data: dbData } = await supabase
          .from("restaurants")
          .select("*, food_items(food_images(storage_path))")
          .eq("approval_status", "approved")
          .order("name");

        const sanityData = await getAllSanityRestaurants();

        const formattedDb = (dbData || []).map((r: any) => {
          let firstFoodImage: string | null = null;
          if (r.food_items && r.food_items.length > 0) {
            for (const item of r.food_items) {
              if (item.food_images && item.food_images.length > 0) {
                firstFoodImage = item.food_images[0]?.storage_path || null;
                if (firstFoodImage) break;
              }
            }
          }
          return {
            ...r,
            banner_url:
              r.banner_url ||
              r.logo_url ||
              firstFoodImage ||
              "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
          };
        });

        // Deduplicate restaurants by name
        const map = new Map<string, any>();
        [...sanityData, ...formattedDb].forEach((r) => {
          if (r && r.name && !map.has(r.name.toLowerCase())) {
            map.set(r.name.toLowerCase(), r);
          }
        });

        const combined = Array.from(map.values());
        console.log(`[SEARCH PAGE LOG] Total Searchable Restaurants Count: ${combined.length}`);
        setRestaurants(combined);
      } catch (err) {
        console.error("Failed to load real restaurants:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchRealRestaurants();
  }, []);

  const filteredResults = useMemo(() => {
    return restaurants.filter((r) => {
      if (query.trim()) {
        const q = query.toLowerCase();
        const matchesName = r.name.toLowerCase().includes(q);
        const matchesCity = r.city ? r.city.toLowerCase().includes(q) : false;
        const matchesDesc = r.description ? r.description.toLowerCase().includes(q) : false;
        if (!matchesName && !matchesCity && !matchesDesc) return false;
      }

      if (activeFilter === "open") return r.status === "open";
      return true;
    });
  }, [query, activeFilter, restaurants]);

  return (
    <div className="min-h-screen bg-[#fff8f5] text-[#251912] selection:bg-[#ffdbc8] selection:text-[#321200] pb-32">
      {/* Location Modal */}
      <LocationModal />

      {/* Main Container */}
      <main className="pt-8 pb-32 px-4 md:px-12 max-w-7xl mx-auto space-y-8">
        {/* Search Input Section */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="relative max-w-2xl mx-auto md:mx-0">
            <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#584235]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for restaurants, dishes, or cities..."
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

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-[#994700]">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : filteredResults.length > 0 ? (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-[#251912]">
                Active Restaurants ({filteredResults.length})
              </h2>
              <button
                onClick={() => {
                  setQuery("");
                  setActiveFilter("all");
                }}
                className="text-[#994700] text-xs font-extrabold hover:underline"
              >
                Clear Search
              </button>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredResults.map((r) => {
                const isOpened = r.status === "open";
                return (
                  <Link key={r.id} href={`/restaurants/${r.id}`} className="group cursor-pointer">
                    <div className="relative rounded-[24px] overflow-hidden aspect-[4/3] ambient-glow mb-4 shadow-sm bg-neutral-100">
                      <img
                        src={r.banner_url || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80"}
                        alt={r.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />

                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1">
                        <Star className="w-4 h-4 fill-[#ff7a00] text-[#ff7a00]" />
                        <span className="text-xs font-black text-[#251912]">4.8</span>
                      </div>

                      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[#994700]">
                        <span className="text-[10px] font-black uppercase tracking-wider">
                          VERIFIED
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-lg font-black text-[#251912] group-hover:text-[#994700] transition-colors">
                        {r.name}
                      </h3>
                      <p className="text-xs font-semibold text-[#584235] line-clamp-1">
                        {r.description || "Multi-Cuisine • Fast Food • Biriyani"}
                      </p>

                      <div className="flex items-center gap-3 pt-1 text-xs">
                        <span className="flex items-center gap-1 font-extrabold text-emerald-700">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isOpened ? "bg-emerald-500 animate-pulse" : "bg-neutral-400"
                            }`}
                          />
                          {isOpened ? "Open Now" : "Closed"}
                        </span>
                        <span className="text-[#5e5e5e] font-semibold flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                          {r.city || "Local Area"}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ) : (
          /* Empty State */
          <section className="flex flex-col items-center justify-center py-16 text-center max-w-lg mx-auto space-y-4">
            <div className="w-48 h-48 relative flex items-center justify-center">
              <div className="absolute inset-0 bg-[#ffdbc8]/40 rounded-full blur-3xl animate-pulse" />
              <div className="text-6xl relative z-10">🏪</div>
            </div>

            <h3 className="text-2xl font-black text-[#251912]">No Stores Found</h3>
            <p className="text-xs text-[#584235] font-semibold max-w-sm mx-auto leading-relaxed">
              We couldn&apos;t find any stores matching your search query. Try adjusting your search term or exploring all stores.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setQuery("");
                  setActiveFilter("all");
                }}
                className="px-6 py-3 bg-[#994700] text-white rounded-full font-black text-xs hover:bg-[#753400] transition-all flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Reset Search
              </button>
              <Link
                href="/restaurants"
                className="px-6 py-3 border border-[#251912] text-[#251912] rounded-full font-black text-xs hover:bg-[#251912] hover:text-white transition-all"
              >
                View All Stores
              </Link>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
