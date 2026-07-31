"use client";

import Link from "next/link";
import { useState } from "react";
import { useCurrentProfile } from "@/hooks/use-current-profile";
import { logout } from "@/actions/auth.actions";
import {
  Menu,
  X,
  ShoppingCart,
  Bell,
  User,
  LogOut,
  ChevronDown,
  LayoutDashboard,
} from "lucide-react";

export function Navbar() {
  const { profile, loading } = useCurrentProfile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">T-Bites</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/restaurants"
              className="text-sm font-medium text-foreground-muted hover:text-foreground transition-colors"
            >
              Restaurants
            </Link>
          </nav>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-border animate-pulse" />
            ) : profile ? (
              <>
                {/* Cart */}
                <Link
                  href="/cart"
                  className="relative p-2.5 rounded-xl text-foreground-muted hover:text-foreground hover:bg-surface transition-all"
                >
                  <ShoppingCart className="w-5 h-5" />
                </Link>

                {/* Notifications */}
                <Link
                  href="/orders"
                  className="relative p-2.5 rounded-xl text-foreground-muted hover:text-foreground hover:bg-surface transition-all"
                >
                  <Bell className="w-5 h-5" />
                </Link>

                {/* Profile dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-surface transition-all"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">
                        {profile.full_name?.charAt(0)?.toUpperCase() || "U"}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-foreground max-w-[120px] truncate">
                      {profile.full_name}
                    </span>
                    <ChevronDown className="w-4 h-4 text-foreground-muted" />
                  </button>

                  {profileDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setProfileDropdownOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 rounded-xl bg-background border border-border shadow-xl z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="px-4 py-2.5 border-b border-border">
                          <p className="text-sm font-medium text-foreground truncate">
                            {profile.full_name}
                          </p>
                          <p className="text-xs text-foreground-muted capitalize">
                            {profile.role?.replace("_", " ")}
                          </p>
                        </div>

                        {profile.role === "restaurant_owner" && (
                          <Link
                            href="/dashboard"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-surface transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            Restaurant Dashboard
                          </Link>
                        )}

                        {profile.role === "admin" && (
                          <Link
                            href="/admin"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-surface transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            Admin Panel
                          </Link>
                        )}

                        <Link
                          href="/orders"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-surface transition-colors"
                        >
                          <User className="w-4 h-4" />
                          My Orders
                        </Link>

                        <form action={logout}>
                          <button
                            type="submit"
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-error hover:bg-error/5 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </form>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-sm font-medium text-foreground-muted hover:text-foreground transition-colors px-4 py-2"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="text-sm font-semibold bg-primary text-white px-5 py-2.5 rounded-xl shadow-md shadow-primary/20 hover:bg-primary-dark transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-foreground hover:bg-surface transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-4 space-y-3">
            <Link
              href="/restaurants"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-foreground-muted hover:text-foreground py-2"
            >
              Restaurants
            </Link>

            {profile ? (
              <>
                <Link
                  href="/cart"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-medium text-foreground-muted hover:text-foreground py-2"
                >
                  Cart
                </Link>
                <Link
                  href="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-medium text-foreground-muted hover:text-foreground py-2"
                >
                  My Orders
                </Link>
                <div className="pt-2 border-t border-border">
                  <form action={logout}>
                    <button
                      type="submit"
                      className="text-sm font-medium text-error py-2"
                    >
                      Sign Out
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex gap-3 pt-2 border-t border-border">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center text-sm font-medium text-foreground-muted border border-border py-2.5 rounded-xl"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center text-sm font-semibold bg-primary text-white py-2.5 rounded-xl"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
