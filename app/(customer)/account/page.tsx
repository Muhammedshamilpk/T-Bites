import { getCurrentUser, getUserProfileName } from "@/lib/supabase/server";
import { logout } from "@/actions/auth.actions";
import Link from "next/link";
import {
  MapPin,
  Receipt,
  Heart,
  CreditCard,
  Headphones,
  Settings,
  LogOut,
  Edit3,
  User,
  ChevronRight,
} from "lucide-react";

export default async function AccountPage() {
  const user = await getCurrentUser();
  const fullName = await getUserProfileName();
  const email = user?.email || "muhammedshamilpkmpd@gmail.com";
  const phone = ((user?.user_metadata as any)?.phone as string) || "+919048795432";

  const hour = new Date().getHours();
  const timePrefix =
    hour >= 5 && hour < 12
      ? "Good morning"
      : hour >= 12 && hour < 17
      ? "Good afternoon"
      : "Good evening";

  const fullGreeting = `${timePrefix}, ${fullName}`;

  return (
    <div className="min-h-screen bg-[#fff8f5] text-[#251912] selection:bg-[#ffdbc8] selection:text-[#321200] pb-36">
      {/* Top AppBar */}
      <header className="fixed top-0 w-full z-50 bg-[#fff8f5]/80 backdrop-blur-xl shadow-[0_0_40px_rgba(0,0,0,0.04)]">
        <div className="flex justify-between items-center px-4 md:px-12 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#ffeadf] border-2 border-[#ff7a00]/20 overflow-hidden flex items-center justify-center text-lg shrink-0">
              👤
            </div>
            <h1 className="text-lg font-black text-[#994700]">
              {fullGreeting}
            </h1>
          </div>
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#ffeadf] transition-colors text-[#994700]">
            <MapPin className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="pt-28 px-4 md:px-12 max-w-7xl mx-auto space-y-12">
        {/* Profile Header Section */}
        <section className="flex flex-col md:flex-row items-center gap-8 md:items-start text-center md:text-left">
          <div className="relative group">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden ambient-glow border-4 border-white bg-orange-100 flex items-center justify-center text-6xl shadow-md">
              👤
            </div>
            <button className="absolute -bottom-2 -right-2 bg-[#ff7a00] text-white p-2.5 rounded-xl shadow-lg hover:scale-105 transition-transform">
              <Edit3 className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 flex-1">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#251912]">
                {fullName}
              </h2>
              <p className="text-xs font-semibold text-[#5e5e5e] mt-0.5">
                {email} • {phone}
              </p>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-1">
              <span className="px-4 py-1.5 bg-[#ffdbc8] text-[#321200] rounded-full font-black text-xs uppercase tracking-wider">
                PREMIUM MEMBER
              </span>
              <span className="px-4 py-1.5 bg-[#f6ded2] text-[#584235] rounded-full font-black text-xs uppercase tracking-wider">
                124 ORDERS
              </span>
            </div>
          </div>
        </section>

        {/* Bento Grid Menu Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* My Orders */}
          <Link
            href="/orders"
            className="group bg-white p-6 rounded-3xl ambient-glow flex items-start justify-between border border-neutral-100 hover:border-[#ff7a00]/30 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#ffdbc8]/40 flex items-center justify-center text-[#994700] shrink-0">
                <Receipt className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-base font-black text-[#251912] group-hover:text-[#994700] transition-colors">
                  My Orders
                </h3>
                <p className="text-xs font-semibold text-[#5e5e5e]">
                  Track, reorder, or view history
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#e0c0af] group-hover:translate-x-1 transition-transform mt-1" />
          </Link>

          {/* Favourite Restaurants */}
          <Link
            href="/restaurants"
            className="group bg-white p-6 rounded-3xl ambient-glow flex items-start justify-between border border-neutral-100 hover:border-[#ff7a00]/30 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#ffdbc8]/40 flex items-center justify-center text-[#994700] shrink-0">
                <Heart className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-base font-black text-[#251912] group-hover:text-[#994700] transition-colors">
                  Favourite Restaurants
                </h3>
                <p className="text-xs font-semibold text-[#5e5e5e]">
                  Your curated culinary list
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#e0c0af] group-hover:translate-x-1 transition-transform mt-1" />
          </Link>

          {/* Saved Addresses */}
          <Link
            href="/checkout"
            className="group bg-white p-6 rounded-3xl ambient-glow flex items-start justify-between border border-neutral-100 hover:border-[#ff7a00]/30 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#ffdbc8]/40 flex items-center justify-center text-[#994700] shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-base font-black text-[#251912] group-hover:text-[#994700] transition-colors">
                  Saved Addresses
                </h3>
                <p className="text-xs font-semibold text-[#5e5e5e]">
                  Home, Office, and others
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#e0c0af] group-hover:translate-x-1 transition-transform mt-1" />
          </Link>

          {/* Payment Methods */}
          <div className="group bg-white p-6 rounded-3xl ambient-glow flex items-start justify-between border border-neutral-100 hover:border-[#ff7a00]/30 hover:shadow-md transition-all duration-300 cursor-pointer">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#ffdbc8]/40 flex items-center justify-center text-[#994700] shrink-0">
                <CreditCard className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-base font-black text-[#251912] group-hover:text-[#994700] transition-colors">
                  Payments
                </h3>
                <p className="text-xs font-semibold text-[#5e5e5e]">
                  Manage cards and wallets
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#e0c0af] group-hover:translate-x-1 transition-transform mt-1" />
          </div>

          {/* Help & Support */}
          <div className="group bg-white p-6 rounded-3xl ambient-glow flex items-start justify-between border border-neutral-100 hover:border-[#ff7a00]/30 hover:shadow-md transition-all duration-300 cursor-pointer">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#ffdbc8]/40 flex items-center justify-center text-[#994700] shrink-0">
                <Headphones className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-base font-black text-[#251912] group-hover:text-[#994700] transition-colors">
                  Help &amp; Support
                </h3>
                <p className="text-xs font-semibold text-[#5e5e5e]">
                  24/7 Concierge assistance
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#e0c0af] group-hover:translate-x-1 transition-transform mt-1" />
          </div>

          {/* Settings */}
          <div className="group bg-white p-6 rounded-3xl ambient-glow flex items-start justify-between border border-neutral-100 hover:border-[#ff7a00]/30 hover:shadow-md transition-all duration-300 cursor-pointer">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#ffdbc8]/40 flex items-center justify-center text-[#994700] shrink-0">
                <Settings className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-base font-black text-[#251912] group-hover:text-[#994700] transition-colors">
                  Settings
                </h3>
                <p className="text-xs font-semibold text-[#5e5e5e]">
                  Privacy and app preferences
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#e0c0af] group-hover:translate-x-1 transition-transform mt-1" />
          </div>
        </div>

        {/* Logout CTA */}
        <div className="pt-4 flex justify-center">
          <form action={logout} className="w-full max-w-md">
            <button
              type="submit"
              className="w-full py-4 px-8 flex items-center justify-center gap-3 bg-white text-red-600 border border-red-200 rounded-2xl font-black text-xs hover:bg-red-50 transition-all duration-300 ambient-glow shadow-xs"
            >
              <LogOut className="w-4 h-4 text-red-600" /> Logout
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
