"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCurrentProfile } from "@/hooks/use-current-profile";
import { logout } from "@/actions/auth.actions";
import {
  LayoutDashboard,
  Store,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  X,
  Shield,
} from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/restaurants", label: "Restaurants", icon: Store },
  { href: "/admin/orders", label: "All Orders", icon: ShoppingBag },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { profile } = useCurrentProfile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex bg-surface">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-background border-r border-border transform transition-transform duration-200 lg:translate-x-0 lg:static lg:inset-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold text-primary">T-Bites</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/10 text-secondary font-medium flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Admin
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-lg hover:bg-surface transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-foreground-muted hover:bg-surface hover:text-foreground"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-3 border-t border-border">
            <div className="px-4 py-2.5 mb-2">
              <p className="text-sm font-medium text-foreground truncate">
                {profile?.full_name}
              </p>
              <p className="text-xs text-foreground-muted">Administrator</p>
            </div>
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-foreground-muted hover:bg-surface hover:text-foreground transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to T-Bites
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-error hover:bg-error/5 transition-all"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-16 bg-background/80 backdrop-blur-lg border-b border-border flex items-center px-4 sm:px-6 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl text-foreground hover:bg-surface transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="ml-3 text-lg font-bold text-primary">T-Bites</span>
          <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-secondary/10 text-secondary font-medium">
            Admin
          </span>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
