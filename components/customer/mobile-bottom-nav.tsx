"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Receipt, ShoppingCart, User } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { useState, useEffect } from "react";

export function MobileBottomNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const cartItems = useCartStore((s) => s.items);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Hide bottom nav on admin, dashboard, studio & auth pages (/login, /signup, /owner)
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/studio") ||
    pathname === "/owner" ||
    pathname === "/login" ||
    pathname === "/signup"
  ) {
    return null;
  }

  const navItems = [
    {
      label: "Home",
      href: "/",
      icon: Home,
      isActive: pathname === "/" || pathname === "/restaurants",
    },
    {
      label: "Search",
      href: "/search",
      icon: Search,
      isActive: pathname === "/search",
    },
    {
      label: "Orders",
      href: "/orders",
      icon: Receipt,
      isActive: pathname === "/orders" || pathname.startsWith("/orders/"),
    },
    {
      label: "Cart",
      href: "/cart",
      icon: ShoppingCart,
      badge: mounted ? totalCartCount : 0,
      isActive: pathname === "/cart",
    },
    {
      label: "Profile",
      href: "/account",
      icon: User,
      isActive: pathname === "/account",
    },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 inset-x-0 z-50 bg-[#fff8f5]/85 backdrop-blur-2xl border-t border-neutral-100/60 shadow-[0_-4px_40px_rgba(0,0,0,0.04)] rounded-t-[24px]"
    >
      <div className="flex items-center justify-around h-16 px-4 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`relative flex flex-col items-center justify-center w-full h-full gap-1 transition-all duration-200 ${
                active
                  ? "text-[#994700] scale-105 font-black"
                  : "text-[#5e5e5e] opacity-70 hover:opacity-100 font-semibold"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-6 h-6 ${
                    active ? "stroke-[2.5]" : "stroke-[1.8]"
                  }`}
                />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-[#ff7a00] text-white text-[9px] font-black flex items-center justify-center border-2 border-white shadow-xs">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight">{item.label}</span>
              {active && (
                <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-[#ff7a00]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
