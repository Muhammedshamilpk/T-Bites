"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCurrentProfile } from "@/hooks/use-current-profile";
import { logout } from "@/actions/auth.actions";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ClipboardList,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  Bell,
} from "lucide-react";
import { useState } from "react";
import { RestaurantDashboardNotifier } from "@/components/restaurant/restaurant-dashboard-notifier";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/orders", label: "Live Orders", icon: ClipboardList },
  { href: "/dashboard/menu", label: "Menu Manager", icon: UtensilsCrossed },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function RestaurantDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { profile } = useCurrentProfile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#fff8f5] text-[#251912]">
      {/* Desktop SideNavBar Shell */}
      <aside className="fixed left-0 top-0 hidden lg:flex flex-col h-full w-64 bg-[#fff8f5] border-r border-[#e0c0af]/40 shadow-xs z-50 py-8 px-6">
        <div className="mb-10">
          <h1 className="text-[28px] font-black text-[#994700] leading-none mb-1 tracking-tight">
            Culinary OS
          </h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#584235] opacity-60">
            Management Suite
          </p>
        </div>

        <nav className="flex-1 space-y-2">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150 font-bold ${isActive
                    ? "text-[#994700] bg-[#fbe3d7] border-r-4 border-[#994700]"
                    : "text-[#584235] opacity-70 hover:bg-[#fbe3d7]/50"
                  }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm font-extrabold">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-8 border-t border-[#e0c0af]/30 space-y-3">
          <form action={logout}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[#584235] opacity-70 hover:text-[#ba1a1a] transition-colors text-xs font-extrabold"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile Drawer Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#fff8f5] border-r border-[#e0c0af] p-6 transform transition-transform duration-200 lg:hidden flex flex-col justify-between ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-black text-[#994700] leading-none mb-1">
                Culinary OS
              </h1>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#584235] opacity-60">
                Management Suite
              </p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-lg hover:bg-[#ffeadf]"
            >
              <X className="w-5 h-5 text-[#994700]" />
            </button>
          </div>

          <nav className="space-y-2">
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold ${isActive
                      ? "text-[#994700] bg-[#fbe3d7] border-r-4 border-[#994700]"
                      : "text-[#584235] opacity-70 hover:bg-[#fbe3d7]/50"
                    }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm font-extrabold">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-[#e0c0af]/30 space-y-3">
          <Link
            href="/"
            className="w-full py-3 px-4 rounded-xl bg-[#ff7a00] text-white font-extrabold text-xs text-center block"
          >
            Back to Home
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-4 py-2.5 text-[#ba1a1a] text-xs font-extrabold"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </form>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Container with Top Header Shell */}
      <div className="lg:ml-64 min-h-screen">
        {/* TopNavBar Shell */}
        <header className="fixed top-0 right-0 left-0 lg:left-64 h-20 z-40 bg-[#fff8f5]/80 backdrop-blur-xl border-b border-[#e0c0af]/40 flex justify-between items-center px-4 md:px-12 shadow-xs">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-[#994700]"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="relative w-full max-w-md hidden sm:block">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#584235]/50" />
              <input
                type="text"
                suppressHydrationWarning
                placeholder="Search orders, dishes, or analytics..."
                className="w-full bg-white border-none rounded-2xl py-3 pl-12 pr-4 text-xs font-semibold focus:ring-2 focus:ring-[#ff7a00] transition-all ambient-glow"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 bg-green-50 text-green-700 rounded-full border border-green-200">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <span className="text-xs font-extrabold">Online Status</span>
            </div>
            <div className="flex items-center gap-3">
              <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#fbe3d7] transition-colors text-[#584235]">
                <Bell className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 rounded-full bg-[#ffeadf] border-2 border-[#ff7a00]/20 flex items-center justify-center text-lg shrink-0">
                👤
              </div>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="pt-28 pb-20 px-4 md:px-12 max-w-7xl mx-auto">
          <RestaurantDashboardNotifier />
          {children}
        </main>
      </div>
    </div>
  );
}
