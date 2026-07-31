"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  Star,
  Clock,
  MapPin,
  Heart,
  ChevronDown,
} from "lucide-react";
import { LocationModal } from "./location-modal";
import { useLocationStore } from "@/store/location-store";

export interface RestaurantItem {
  id: string;
  name: string;
  description: string | null;
  address_line: string;
  city: string;
  pincode: string;
  phone: string;
  logo_url: string | null;
  banner_url: string | null;
  status: "open" | "closed" | "holiday";
  approval_status: "approved" | "pending" | "rejected" | "suspended";
}

interface CategoryItem {
  id: string;
  name: string;
}

interface Props {
  restaurants: RestaurantItem[];
  categories: CategoryItem[];
}

const CATEGORIES = [
  {
    name: "Burger",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80",
  },
  {
    name: "Pizza",
    image:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=300&q=80",
  },
  {
    name: "Biriyani",
    image:
      "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=300&q=80",
  },
  {
    name: "Shawarma",
    image:
      "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=300&q=80",
  },
  {
    name: "Chinese",
    image:
      "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=300&q=80",
  },
  {
    name: "Juice",
    image:
      "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=300&q=80",
  },
  {
    name: "Alfaham",
    image:
      "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=300&q=80",
  },
  {
    name: "Desserts",
    image:
      "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=300&q=80",
  },
];

export function RestaurantCatalogClient({ restaurants }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const { location, openModal } = useLocationStore();

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((r) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = r.name.toLowerCase().includes(q);
        const matchesCity = r.city.toLowerCase().includes(q);
        const matchesDesc = r.description?.toLowerCase().includes(q) || false;
        if (!matchesName && !matchesCity && !matchesDesc) return false;
      }
      return true;
    });
  }, [restaurants, searchQuery]);

  return (
    <div className="min-h-screen bg-[#fff8f5] text-[#251912] pb-32 -mt-10">
      {/* Full-Screen Location Modal */}
      <LocationModal />

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 md:px-12 pt-8 space-y-10">
        {/* Search Bar Section */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="relative group">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-[#8c7263]" />
            </div>
            <input
              type="text"
              suppressHydrationWarning
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for stores or food items..."
              className="w-full h-16 pl-14 pr-16 bg-white border-none rounded-2xl text-base font-semibold ambient-glow focus:ring-2 focus:ring-[#ff7a00] transition-all placeholder:text-[#e0c0af]"
            />
            <div className="absolute inset-y-0 right-3 flex items-center">
              <button suppressHydrationWarning className="p-3 bg-[#ff7a00] rounded-xl text-white hover:bg-[#994700] transition-colors">
                <SlidersHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>

        {/* Quick Categories ("Taste the Best") */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-black text-[#251912] tracking-tight">
              Taste the Best
            </h2>
            <span className="text-[#994700] text-xs font-extrabold uppercase tracking-wider">
              {CATEGORIES.length} Categories
            </span>
          </div>

          <div className="flex overflow-x-auto scrollbar-hide gap-6 py-4">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.name}
                className="category-chip flex flex-col items-center gap-3 shrink-0 animate-float cursor-pointer group"
              >
                <div className="w-20 h-20 rounded-full overflow-hidden ambient-glow bg-white p-1 group-hover:scale-110 transition-transform shadow-md">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <span className="text-xs font-extrabold text-[#251912]">
                  {cat.name}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Promotional Banners */}
        <section className="overflow-hidden relative">
          <div className="flex overflow-x-auto scrollbar-hide gap-6 snap-x snap-mandatory">
            {/* Banner 1 */}
            <div className="min-w-[85%] md:min-w-[45%] h-52 relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#ff7a00] to-[#994700] snap-center shrink-0 group shadow-xl">
              <div className="relative z-10 p-8 flex flex-col justify-center h-full text-white space-y-2">
                <h3 className="text-2xl sm:text-3xl font-black leading-tight">
                  First Order <br /> Magic
                </h3>
                <p className="text-sm font-semibold opacity-90">
                  Get 50% OFF on your first 3 orders
                </p>
                <button className="w-fit px-6 py-2.5 bg-white text-[#994700] rounded-full text-xs font-black hover:scale-105 transition-transform shadow-md">
                  Claim Now
                </button>
              </div>
              <img
                src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80"
                alt="First Order Magic"
                className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-80 mix-blend-overlay"
              />
            </div>

            {/* Banner 2 */}
            <div className="min-w-[85%] md:min-w-[45%] h-52 relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#5d5f5f] to-[#353737] snap-center shrink-0 group shadow-xl">
              <div className="relative z-10 p-8 flex flex-col justify-center h-full text-white space-y-2">
                <h3 className="text-2xl sm:text-3xl font-black leading-tight">
                  Weekend <br /> Feast
                </h3>
                <p className="text-sm font-semibold opacity-90">
                  Free delivery on all premium orders
                </p>
                <button className="w-fit px-6 py-2.5 bg-white text-[#353737] rounded-full text-xs font-black hover:scale-105 transition-transform shadow-md">
                  Explore
                </button>
              </div>
              <img
                src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80"
                alt="Weekend Feast"
                className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-80 mix-blend-overlay"
              />
            </div>
          </div>
        </section>

        {/* Restaurant List: Top Picks Near You */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-[#251912]">
                Top Picks Near You
              </h2>
              <p className="text-xs text-[#5e5e5e] font-semibold mt-0.5">
                Curated selection of high-end kitchens
              </p>
            </div>
            <button className="w-10 h-10 flex items-center justify-center rounded-full border border-neutral-200 bg-white hover:shadow-md transition-all">
              <SlidersHorizontal className="w-4 h-4 text-[#251912]" />
            </button>
          </div>

          {filteredRestaurants.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl p-8 ambient-glow">
              <div className="text-5xl mb-3">🏪</div>
              <p className="text-base font-bold text-[#251912]">
                No stores found matching your search.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRestaurants.map((r) => {
                const isOpened = r.status === "open";
                const bannerPhoto =
                  r.banner_url ||
                  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80";

                return (
                  <Link key={r.id} href={`/restaurants/${r.id}`}>
                    <div className="group bg-white rounded-3xl overflow-hidden ambient-glow cursor-pointer transition-all duration-500 hover:-translate-y-2 shadow-sm border border-neutral-100 flex flex-col h-full">
                      <div className="relative h-64 overflow-hidden bg-neutral-100">
                        <img
                          src={bannerPhoto}
                          alt={r.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[#994700] text-xs font-black shadow-sm">
                            EXCLUSIVE
                          </span>
                        </div>

                        <button className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/30 backdrop-blur-md text-white hover:bg-white hover:text-red-500 transition-all">
                          <Heart className="w-5 h-5" />
                        </button>

                        <div className="absolute bottom-4 left-4">
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[#251912] text-xs font-black">
                            <Star className="w-3.5 h-3.5 fill-[#ff7a00] text-[#ff7a00]" />
                            4.8 (Top Rated)
                          </div>
                        </div>
                      </div>

                      <div className="p-6 flex flex-col justify-between flex-1 space-y-4">
                        <div className="space-y-1">
                          <div className="flex justify-between items-start">
                            <h3 className="text-lg font-black text-[#251912] group-hover:text-[#994700] transition-colors">
                              {r.name}
                            </h3>
                            <span
                              className={`text-xs font-extrabold flex items-center gap-1 ${
                                isOpened ? "text-emerald-600" : "text-neutral-500"
                              }`}
                            >
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  isOpened
                                    ? "bg-emerald-500 animate-pulse"
                                    : "bg-neutral-400"
                                }`}
                              />
                              {isOpened ? "Open" : "Closed"}
                            </span>
                          </div>

                          <p className="text-xs text-[#5e5e5e] font-semibold line-clamp-2">
                            {r.description || "Indian • Chinese • Broast • Biriyani"}
                          </p>
                        </div>

                        <div className="flex items-center gap-4 pt-4 border-t border-neutral-100 text-xs font-bold text-[#584235]">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-neutral-400" /> 25-35 MINS
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-neutral-400" /> {r.city}
                          </span>
                          <span className="ml-auto px-3 py-1 bg-[#fff1ea] text-[#5c2800] rounded-full text-[10px] font-black uppercase tracking-wider">
                            Free Delivery
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
