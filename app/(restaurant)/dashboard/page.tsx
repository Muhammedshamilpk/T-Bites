import { getCurrentUser } from "@/lib/supabase/server";
import Link from "next/link";
import {
  getSanityRestaurantDetails,
  getSanityOrders,
  getSanityMenuItems,
} from "@/lib/sanity/sanity-store.service";
import { getEffectiveRestaurantIdFromCookies } from "@/lib/sanity/storeResolver";
import {
  ShoppingBag,
  TrendingUp,
  UtensilsCrossed,
  Timer,
  ArrowRight,
  Plus,
} from "lucide-react";

export const revalidate = 0; // Disable static caching for live dashboard metrics

export default async function DashboardOverview() {
  const user = await getCurrentUser();
  const restaurantId = await getEffectiveRestaurantIdFromCookies();

  // All store data is fetched 100% directly from Sanity CMS Lake, filtered strictly by owner's restaurantId
  const [restaurantDetails, sanityOrders, sanityMenuItems] = await Promise.all([
    getSanityRestaurantDetails(restaurantId || undefined),
    getSanityOrders(restaurantId || undefined),
    getSanityMenuItems(restaurantId || undefined),
  ]);

  const restaurantName =
    restaurantDetails?.name ||
    (user?.user_metadata as any)?.restaurant_name ||
    "T-Bites Gourmet";

  // Calculate live order stats from owner's Sanity orders
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayOrders = sanityOrders.filter(
    (o) => o.placedAt && new Date(o.placedAt) >= todayStart
  );

  const todayRevenue = todayOrders.reduce(
    (sum, order) => sum + (Number(order.total) || 0),
    0
  );

  const pendingOrders = sanityOrders.filter(
    (o) => o.status === "placed" || o.status === "preparing" || o.status === "new"
  );

  const recentOrders = sanityOrders.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <section className="bg-white p-8 rounded-[32px] border border-[#e0c0af]/30 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            <span className="font-black text-xs uppercase tracking-wider text-[#994700]">
              Sanity CMS Isolated Sync
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#251912] tracking-tight">
            Welcome back, {restaurantName}!
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-[#584235] mt-1">
            Here is your isolated kitchen operations summary and real-time orders feed.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/dashboard/menu"
            className="flex items-center gap-2 bg-[#ff7a00] text-white px-6 py-3.5 rounded-2xl font-black text-xs hover:bg-[#994700] transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>+ ADD NEW DISH</span>
          </Link>
        </div>
      </section>

      {/* 4 Metric Bento Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Metric 1: Today's Sales */}
        <div className="bg-white p-6 rounded-[28px] border border-[#e0c0af]/30 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-black text-xs text-[#8c7263] uppercase tracking-wider">
              Today's Revenue
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#ffeadf] flex items-center justify-center text-[#ff7a00]">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-[#251912]">
              ₹{todayRevenue.toLocaleString("en-IN")}
            </p>
            <p className="text-xs font-bold text-green-600 mt-1 flex items-center gap-1">
              <span>+14% from yesterday</span>
            </p>
          </div>
        </div>

        {/* Metric 2: Today's Orders */}
        <div className="bg-white p-6 rounded-[28px] border border-[#e0c0af]/30 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-black text-xs text-[#8c7263] uppercase tracking-wider">
              Today's Orders
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#ffeadf] flex items-center justify-center text-[#ff7a00]">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-[#251912]">
              {todayOrders.length}
            </p>
            <p className="text-xs font-bold text-[#8c7263] mt-1">
              {sanityOrders.length} total lifetime orders
            </p>
          </div>
        </div>

        {/* Metric 3: Active Menu Items */}
        <div className="bg-white p-6 rounded-[28px] border border-[#e0c0af]/30 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-black text-xs text-[#8c7263] uppercase tracking-wider">
              Menu Items
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#ffeadf] flex items-center justify-center text-[#ff7a00]">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-[#251912]">
              {sanityMenuItems.length}
            </p>
            <p className="text-xs font-bold text-green-600 mt-1">
              {sanityMenuItems.filter((i) => i.isAvailable).length} Live in Kitchen
            </p>
          </div>
        </div>

        {/* Metric 4: Active Kitchen Orders */}
        <div className="bg-[#251912] text-white p-6 rounded-[28px] shadow-xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-black text-xs text-[#ff7a00] uppercase tracking-wider">
              Pending Orders
            </span>
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-[#ff7a00]">
              <Timer className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-white">
              {pendingOrders.length}
            </p>
            <Link
              href="/dashboard/orders"
              className="text-xs font-bold text-[#ff7a00] hover:underline flex items-center gap-1 mt-1"
            >
              <span>Manage live kitchen orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <section className="bg-white rounded-[32px] border border-[#e0c0af]/30 p-8 space-y-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#e0c0af]/20 pb-4">
          <div className="flex items-center gap-3">
            <span className="w-1 h-7 bg-[#994700] rounded-full" />
            <h2 className="text-2xl font-black text-[#251912]">
              Recent Kitchen Orders
            </h2>
          </div>
          <Link
            href="/dashboard/orders"
            className="text-xs font-black text-[#ff7a00] hover:underline flex items-center gap-1"
          >
            <span>VIEW ALL ORDERS</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#e0c0af]/20 text-[11px] font-black uppercase text-[#8c7263]">
                <th className="py-4 px-6 md:px-8">Order ID</th>
                <th className="py-4 px-6 md:px-8">Customer</th>
                <th className="py-4 px-6 md:px-8">Items Summary</th>
                <th className="py-4 px-6 md:px-8">Total</th>
                <th className="py-4 px-6 md:px-8">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e0c0af]/15">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => {
                  const itemsSummary =
                    order.items
                      ?.map((i) => `${i.quantity}x ${i.food_name}`)
                      .join(", ") || "Food Order Items";

                  const orderLink = `/dashboard/orders?id=${order._id}`;

                  return (
                    <tr
                      key={order._id}
                      className="hover:bg-[#fff1ea]/60 transition-colors group cursor-pointer"
                    >
                      <td className="py-5 px-6 md:px-8 font-extrabold text-[#251912] text-sm">
                        <Link href={orderLink} className="block w-full h-full text-inherit">
                          #{order._id.slice(0, 8)}
                        </Link>
                      </td>
                      <td className="py-5 px-6 md:px-8">
                        <Link href={orderLink} className="block w-full h-full text-inherit">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#ffeadf] flex items-center justify-center text-sm shrink-0">
                              👤
                            </div>
                            <span className="font-bold text-[#251912] text-sm">
                              {order.customerName}
                            </span>
                          </div>
                        </Link>
                      </td>
                      <td className="py-5 px-6 md:px-8 text-[#584235] text-xs font-semibold truncate max-w-xs">
                        <Link href={orderLink} className="block w-full h-full text-inherit truncate">
                          {itemsSummary}
                        </Link>
                      </td>
                      <td className="py-5 px-6 md:px-8 font-black text-[#251912] text-sm">
                        <Link href={orderLink} className="block w-full h-full text-inherit">
                          ₹{Number(order.total || 0).toLocaleString("en-IN")}
                        </Link>
                      </td>
                      <td className="py-5 px-6 md:px-8">
                        <Link href={orderLink} className="block w-full h-full text-inherit">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-black uppercase ${
                              order.status === "preparing"
                                ? "bg-orange-100 text-orange-700"
                                : order.status === "placed" || order.status === "new"
                                ? "bg-blue-100 text-[#251912]"
                                : order.status === "delivered"
                                ? "bg-green-100 text-green-700"
                                : "bg-neutral-100 text-neutral-700"
                            }`}
                          >
                            {order.status}
                          </span>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs font-bold text-[#8c7263]">
                    No recent orders. Placed customer orders for your restaurant will appear here automatically.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
