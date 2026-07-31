"use client";

import { useState } from "react";
import {
  Bell,
  CheckCircle2,
  ArrowLeft,
  Bike,
  Sparkles,
  Star,
  Clock,
} from "lucide-react";
import Link from "next/link";

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  category: "updates" | "offers" | "new";
}

const INITIAL_ALERTS: NotificationItem[] = [
  {
    id: "1",
    title: "Your order is on the way!",
    body: "The rider is just 5 minutes away from your location with your feast. Get ready!",
    time: "2m ago",
    read: false,
    category: "updates",
  },
  {
    id: "2",
    title: "Payment Successful",
    body: "Transaction #ORD-9921 for ₹425.00 has been processed successfully.",
    time: "15m ago",
    read: false,
    category: "updates",
  },
  {
    id: "3",
    title: "Taco Tuesday Bonanza",
    body: "Buy 1 Get 1 Free on all Mexican delicacies until midnight.",
    time: "3h ago",
    read: true,
    category: "offers",
  },
  {
    id: "4",
    title: "Sushi Night Credits",
    body: "Earn double loyalty points on all Japanese orders tonight.",
    time: "5h ago",
    read: true,
    category: "offers",
  },
];

export default function NotificationsPage() {
  const [alerts, setAlerts] = useState<NotificationItem[]>(INITIAL_ALERTS);
  const [activeFilter, setActiveFilter] = useState("all");

  const markAllRead = () => {
    setAlerts(alerts.map((a) => ({ ...a, read: true })));
  };

  const filteredAlerts = alerts.filter((a) => {
    if (activeFilter === "updates") return a.category === "updates";
    if (activeFilter === "offers") return a.category === "offers";
    return true;
  });

  return (
    <div className="min-h-screen bg-[#fff8f5] text-[#251912] selection:bg-[#ffdbc8] selection:text-[#321200] pb-32">
      {/* Top Header AppBar */}
      <header className="fixed top-0 w-full z-50 bg-[#fff8f5]/80 backdrop-blur-xl shadow-[0_0_40px_rgba(0,0,0,0.04)]">
        <div className="flex justify-between items-center px-4 md:px-12 py-4 max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <Link
              href="/restaurants"
              className="p-2 text-[#994700] hover:bg-[#ffeadf] rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-xl sm:text-2xl font-black text-[#994700]">
              Notifications
            </h1>
          </div>

          <button
            onClick={markAllRead}
            className="px-4 py-2 rounded-full border border-[#994700] text-[#994700] hover:bg-[#ffeadf] text-xs font-black transition-all flex items-center gap-1.5"
          >
            Mark all as read
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="pt-24 px-4 md:px-0 max-w-2xl mx-auto space-y-8">
        {/* Category Filter Chips */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: "all", label: "All" },
            { id: "updates", label: "Order Updates" },
            { id: "offers", label: "Offers" },
            { id: "new", label: "New Restaurants" },
            { id: "deals", label: "Festival Deals" },
          ].map((chip) => {
            const active = activeFilter === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => setActiveFilter(chip.id)}
                className={`px-6 py-2 rounded-full font-black text-xs whitespace-nowrap transition-all shadow-xs ${
                  active
                    ? "bg-[#251912] text-white"
                    : "bg-[#fff1ea] text-[#584235] hover:bg-[#f6ded2]"
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>

        {/* Section 1: Order Updates */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-[#251912]">Order Updates</h2>
            <span className="bg-[#ffeadf] text-[#994700] px-3 py-1 rounded-full text-xs font-black">
              2 New
            </span>
          </div>

          <div className="grid gap-4">
            {filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className="relative overflow-hidden rounded-3xl bg-white ambient-glow border border-neutral-100 p-4 flex items-center gap-4 shadow-xs"
              >
                <div className="relative flex-shrink-0 w-14 h-14 rounded-2xl bg-[#ffeadf] flex items-center justify-center text-[#994700]">
                  {alert.category === "updates" ? (
                    <Bike className="w-7 h-7" />
                  ) : (
                    <Sparkles className="w-7 h-7" />
                  )}
                  {!alert.read && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#ff7a00] rounded-full ring-2 ring-white animate-pulse" />
                  )}
                </div>

                <div className="flex-grow space-y-1">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-black text-[#251912]">
                      {alert.title}
                    </h3>
                    <span className="text-xs text-neutral-400 font-semibold shrink-0">
                      {alert.time}
                    </span>
                  </div>
                  <p className="text-xs text-[#5e5e5e] font-semibold leading-relaxed">
                    {alert.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: Festival Deals (Featured Asymmetric Layout) */}
        <section className="space-y-4">
          <h2 className="text-lg font-black text-[#251912]">Festival Deals</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Featured Bento Card */}
            <div className="rounded-3xl overflow-hidden bg-[#251912] text-white p-8 relative flex flex-col justify-end min-h-[260px] shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80"
                alt="Autumn Harvest"
                className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
              />
              <div className="relative z-10 space-y-2">
                <span className="bg-[#ff7a00] text-white font-black text-[10px] uppercase tracking-wider px-3 py-1 rounded-full inline-block">
                  EXCLUSIVE
                </span>
                <h3 className="text-2xl font-black leading-tight">
                  Autumn Harvest Festival
                </h3>
                <p className="text-xs text-white/80 font-semibold">
                  Enjoy up to 40% off on all seasonal menus from top-rated kitchens.
                </p>
                <Link
                  href="/restaurants"
                  className="inline-block bg-white text-[#994700] px-6 py-2.5 rounded-2xl font-black text-xs hover:scale-105 transition-transform shadow-md"
                >
                  Explore Deals
                </Link>
              </div>
            </div>

            {/* Secondary Deal Cards Stacked */}
            <div className="space-y-4">
              <div className="rounded-3xl bg-white p-4 border border-neutral-100 flex gap-4 ambient-glow shadow-xs">
                <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 bg-orange-100">
                  <img
                    src="https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=300&q=80"
                    alt="Taco Tuesday"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-[#251912]">
                    Taco Tuesday Bonanza
                  </h4>
                  <p className="text-xs text-[#5e5e5e] font-semibold">
                    Buy 1 Get 1 Free on all Mexican delicacies until midnight.
                  </p>
                  <p className="text-[11px] font-black text-[#ff7a00]">
                    Ends in 4h 20m
                  </p>
                </div>
              </div>

              <div className="rounded-3xl bg-white p-4 border border-neutral-100 flex gap-4 ambient-glow shadow-xs">
                <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 bg-orange-100">
                  <img
                    src="https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=300&q=80"
                    alt="Sushi Night"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-[#251912]">
                    Sushi Night Credits
                  </h4>
                  <p className="text-xs text-[#5e5e5e] font-semibold">
                    Earn double loyalty points on all Japanese orders tonight.
                  </p>
                  <p className="text-[11px] font-black text-[#ff7a00]">
                    Active Now
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: New Restaurants in Your Area */}
        <section className="space-y-4">
          <h2 className="text-lg font-black text-[#251912]">New in Your Area</h2>

          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {[
              {
                id: "rest-1",
                name: "L'Artiste Bistro",
                cuisine: "Modern French • 1.2 km",
                rating: "4.9",
                image:
                  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80",
                tag: "NEW OPENING",
              },
              {
                id: "rest-2",
                name: "Umami House",
                cuisine: "Authentic Ramen • 0.8 km",
                rating: "4.7",
                image:
                  "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=400&q=80",
                tag: "20% OFF",
              },
            ].map((r) => (
              <Link
                key={r.id}
                href="/restaurants"
                className="min-w-[260px] rounded-3xl bg-white ambient-glow overflow-hidden border border-neutral-100 shadow-xs hover:scale-[1.02] transition-transform"
              >
                <div className="h-36 overflow-hidden">
                  <img
                    src={r.image}
                    alt={r.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-black text-[#251912]">
                      {r.name}
                    </h3>
                    <div className="flex items-center gap-1 text-[#ff7a00] text-xs font-black">
                      <Star className="w-3.5 h-3.5 fill-[#ff7a00]" /> {r.rating}
                    </div>
                  </div>
                  <p className="text-xs text-[#5e5e5e] font-semibold">
                    {r.cuisine}
                  </p>
                  <span className="inline-block bg-[#ffeadf] text-[#994700] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                    {r.tag}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
