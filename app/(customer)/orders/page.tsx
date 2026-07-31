import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  Clock,
  Package,
  ChevronRight,
  ShoppingBag,
  MapPin,
  Navigation,
  RotateCcw,
  Star,
  HelpCircle,
  MoreHorizontal,
} from "lucide-react";
import { ORDER_STATUS_CONFIG } from "@/lib/utils";

export default async function OrdersPage() {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(*), restaurant:restaurants(id, name, logo_url)")
    .order("placed_at", { ascending: false });

  return (
    <div className="min-h-screen bg-[#fff8f5] text-[#251912] selection:bg-[#ffdbc8] selection:text-[#321200] pb-32">
      {/* Top Header AppBar */}
      <header className="fixed top-0 w-full z-50 bg-[#fff8f5]/80 backdrop-blur-xl shadow-[0_0_40px_rgba(0,0,0,0.04)]">
        <div className="flex justify-between items-center px-4 md:px-12 py-4 max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#ffeadf] border border-[#e0c0af] overflow-hidden flex items-center justify-center text-lg shrink-0">
              👤
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#994700]">
              My Orders
            </h1>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="pt-24 px-4 md:px-0 max-w-2xl mx-auto space-y-6">
        {/* Filter Chips */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          <button className="px-6 py-2 rounded-full bg-[#251912] text-white font-black text-xs whitespace-nowrap transition-all shadow-xs">
            All Orders
          </button>
          <button className="px-6 py-2 rounded-full bg-[#fbe3d7] text-[#584235] font-black text-xs whitespace-nowrap transition-all hover:bg-[#f6ded2]">
            Active
          </button>
          <button className="px-6 py-2 rounded-full bg-[#fbe3d7] text-[#584235] font-black text-xs whitespace-nowrap transition-all hover:bg-[#f6ded2]">
            Completed
          </button>
          <button className="px-6 py-2 rounded-full bg-[#fbe3d7] text-[#584235] font-black text-xs whitespace-nowrap transition-all hover:bg-[#f6ded2]">
            Cancelled
          </button>
        </div>

        {/* Orders List */}
        {!orders || orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center ambient-glow border border-neutral-100 space-y-4 shadow-xs">
            <div className="w-20 h-20 mx-auto rounded-full bg-[#ffeadf] flex items-center justify-center text-[#994700]">
              <Package className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-black text-[#251912]">No orders yet</h2>
            <p className="text-xs text-[#5e5e5e] font-semibold max-w-xs mx-auto">
              Your order history will appear here once you place your first order.
            </p>
            <Link
              href="/restaurants"
              className="inline-flex items-center px-8 py-3.5 rounded-full bg-[#994700] text-white font-black text-xs shadow-md hover:bg-[#753400] transition-all"
            >
              Browse Restaurants
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const statusConfig =
                ORDER_STATUS_CONFIG[
                  order.status as keyof typeof ORDER_STATUS_CONFIG
                ] || ORDER_STATUS_CONFIG.placed;

              const restaurant = order.restaurant as unknown as {
                id: string;
                name: string;
                logo_url: string | null;
              } | null;

              const orderItems = (order.order_items as Array<{
                food_name_snapshot: string;
                quantity: number;
              }>) || [];

              const itemsSummary =
                orderItems.length > 0
                  ? orderItems
                      .slice(0, 2)
                      .map((i) => `${i.quantity}x ${i.food_name_snapshot}`)
                      .join(", ")
                  : "Food items";

              const isActive = ["placed", "accepted", "preparing", "out_for_delivery"].includes(
                order.status
              );

              return (
                <div
                  key={order.id}
                  className="ambient-glow bg-white rounded-3xl overflow-hidden border border-neutral-100 hover:border-[#ff7a00]/20 transition-all duration-300 group shadow-xs"
                >
                  <div className="flex p-4 gap-4">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-orange-100 flex items-center justify-center text-3xl">
                      {restaurant?.logo_url ? (
                        <img
                          src={restaurant.logo_url}
                          alt={restaurant.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        "🍱"
                      )}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start">
                        <h3 className="text-base font-black text-[#251912] group-hover:text-[#994700] transition-colors">
                          {restaurant?.name || "Local Kitchen"}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${statusConfig.color}`}
                        >
                          {statusConfig.label}
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-[#584235] line-clamp-1">
                        {itemsSummary}
                      </p>

                      <div className="flex justify-between items-center pt-2">
                        <span className="text-base font-black text-[#994700]">
                          ₹{order.total}
                        </span>
                        <span className="text-xs text-[#5e5e5e] font-semibold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-neutral-400" />
                          {new Date(order.placed_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="p-4 bg-[#fff1ea]/40 border-t border-neutral-100 flex gap-3">
                    {isActive ? (
                      <>
                        <Link
                          href={`/orders/${order.id}`}
                          className="flex-1 py-3 px-4 rounded-2xl bg-[#994700] text-white font-black text-xs flex items-center justify-center gap-2 hover:bg-[#753400] transition-all shadow-sm"
                        >
                          <Navigation className="w-4 h-4" /> Track Order
                        </Link>
                        <Link
                          href={`/orders/${order.id}`}
                          className="px-4 py-3 rounded-2xl border border-[#251912] text-[#251912] font-black text-xs flex items-center justify-center hover:bg-[#251912] hover:text-white transition-all"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Link>
                      </>
                    ) : order.status === "delivered" ? (
                      <>
                        <Link
                          href={`/restaurants/${restaurant?.id || ""}`}
                          className="flex-1 py-3 px-4 rounded-2xl border border-[#251912] text-[#251912] font-black text-xs flex items-center justify-center gap-2 hover:bg-[#251912] hover:text-white transition-all"
                        >
                          <RotateCcw className="w-4 h-4" /> Reorder
                        </Link>
                        <Link
                          href={`/orders/${order.id}`}
                          className="flex-1 py-3 px-4 rounded-2xl bg-[#fbe3d7] text-[#584235] font-black text-xs flex items-center justify-center gap-1 hover:bg-[#f6ded2] transition-colors"
                        >
                          <Star className="w-4 h-4 text-[#ff7a00] fill-[#ff7a00]" /> Details
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          href={`/orders/${order.id}`}
                          className="flex-1 py-3 px-4 rounded-2xl border border-[#251912] text-[#251912] font-black text-xs flex items-center justify-center gap-2 hover:bg-[#251912] hover:text-white transition-all"
                        >
                          <HelpCircle className="w-4 h-4" /> Support
                        </Link>
                        <Link
                          href={`/orders/${order.id}`}
                          className="flex-1 py-3 px-4 rounded-2xl bg-[#fbe3d7] text-[#584235] font-black text-xs flex items-center justify-center hover:bg-[#f6ded2] transition-colors"
                        >
                          Details
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
