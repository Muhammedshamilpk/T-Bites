import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ORDER_STATUS_CONFIG } from "@/lib/utils";
import {
  ArrowLeft,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  Utensils,
  Bike,
  Home,
  Star,
  Check,
  Radio,
} from "lucide-react";
import { LiveOrderTracker } from "@/components/customer/live-order-tracker";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select(
      "*, order_items(*), restaurant:restaurants(id, name, logo_url, phone, address_line, city), delivery_address:addresses(*)"
    )
    .eq("id", id)
    .single();

  if (error || !order) {
    notFound();
  }

  // Fetch status timeline
  const { data: timeline } = await supabase
    .from("order_status_history")
    .select("*")
    .eq("order_id", id)
    .order("created_at");

  const statusConfig =
    ORDER_STATUS_CONFIG[order.status as keyof typeof ORDER_STATUS_CONFIG] ||
    ORDER_STATUS_CONFIG.placed;

  const restaurant = order.restaurant as unknown as {
    id: string;
    name: string;
    logo_url: string | null;
    phone: string;
    address_line?: string;
    city?: string;
  } | null;

  const address = order.delivery_address as unknown as {
    label: string;
    line1: string;
    line2: string | null;
    city: string;
    pincode: string;
    landmark: string | null;
  } | null;

  const orderItems = order.order_items as Array<{
    id: string;
    food_name_snapshot: string;
    unit_price_snapshot: number;
    quantity: number;
    line_total: number;
  }>;

  // Timeline progress steps
  const steps = [
    { key: "placed", label: "Confirmed", icon: Check },
    { key: "preparing", label: "Preparing", icon: Utensils },
    { key: "out_for_delivery", label: "Delivery", icon: Bike },
    { key: "delivered", label: "Arrived", icon: Home },
  ];

  const getStepProgress = (status: string) => {
    switch (status) {
      case "placed":
        return 25;
      case "accepted":
      case "preparing":
        return 50;
      case "out_for_delivery":
        return 75;
      case "delivered":
        return 100;
      default:
        return 15;
    }
  };

  const progressPercent = getStepProgress(order.status);

  return (
    <div className="min-h-screen bg-[#fff8f5] text-[#251912] selection:bg-[#ffdbc8] selection:text-[#321200] pb-32">
      <LiveOrderTracker orderId={id} />

      {/* Top Navigation AppBar */}
      <header className="fixed top-0 w-full z-50 bg-[#fff8f5]/80 backdrop-blur-xl shadow-[0_0_40px_rgba(0,0,0,0.04)]">
        <div className="flex justify-between items-center px-4 md:px-12 py-4 max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <Link
              href="/orders"
              className="p-2 text-[#994700] hover:bg-[#ffeadf] rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-xl font-black text-[#994700]">
              Order Tracking
            </h1>
          </div>

          <div className="flex items-center gap-2 text-xs font-black text-[#584235]">
            <MapPin className="w-5 h-5 text-[#994700]" />
            <span className="hidden sm:inline">
              {address?.city || "Local Delivery"}
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="pt-24 px-4 md:px-0 max-w-2xl mx-auto space-y-6">
        {/* Live Status Visual Anchor */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="relative w-full h-64 rounded-3xl overflow-hidden ambient-glow bg-neutral-900 group shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80"
              alt="Kitchen Preparation"
              className="w-full h-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />

            <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 text-white">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff7a00] animate-ping" />
              <span className="font-black text-[10px] uppercase tracking-widest">
                Live Tracking
              </span>
            </div>
          </div>
        </section>

        {/* Progress Tracking Section */}
        <section className="bg-white rounded-3xl p-8 ambient-glow shadow-xs border border-neutral-100 space-y-8">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="p-4 bg-[#ffeadf] rounded-full text-[#994700] mb-2 animate-pulse">
              <Utensils className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-black text-[#251912]">
              {order.status === "placed" && "Order Confirmed"}
              {order.status === "accepted" && "Kitchen Accepted Order"}
              {order.status === "preparing" && "Chef is preparing your meal"}
              {order.status === "out_for_delivery" && "Delivery Expert is on the way"}
              {order.status === "delivered" && "Order Delivered! Enjoy your meal"}
              {["cancelled", "rejected"].includes(order.status) && "Order Cancelled"}
            </h2>

            <p className="text-xs text-[#5e5e5e] font-semibold">
              Status: <span className="text-[#994700] font-black">{statusConfig.label}</span>
            </p>
          </div>

          {/* Animated 4-Step Progress Bar */}
          <div className="relative px-2 py-4">
            <div className="absolute top-1/2 left-0 w-full h-1 -translate-y-1/2 bg-neutral-200" />
            <div
              className="absolute top-1/2 left-0 h-1 -translate-y-1/2 bg-[#ff7a00] transition-all duration-1000 ease-in-out"
              style={{ width: `${progressPercent}%` }}
            />

            <div className="flex justify-between relative z-10">
              {steps.map((step, idx) => {
                const isPassed = progressPercent >= (idx + 1) * 25;
                const IconComponent = step.icon;

                return (
                  <div key={step.key} className="flex flex-col items-center gap-2">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        isPassed
                          ? "bg-[#ff7a00] text-white shadow-md"
                          : "bg-neutral-100 text-neutral-400"
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider ${
                        isPassed ? "text-[#994700]" : "text-neutral-400"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Restaurant & Courier Information Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Restaurant Card */}
          <div className="bg-white rounded-3xl p-5 flex items-center gap-4 ambient-glow border border-neutral-100 shadow-xs">
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-orange-100 flex-shrink-0 flex items-center justify-center text-2xl">
              {restaurant?.logo_url ? (
                <img
                  src={restaurant.logo_url}
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                "🍽️"
              )}
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-[#251912]">
                {restaurant?.name || "Local Kitchen"}
              </h3>
              <p className="text-xs text-[#5e5e5e] font-semibold truncate max-w-[150px]">
                {restaurant?.address_line || "Main Street"}
              </p>
              {restaurant?.phone && (
                <a
                  href={`tel:${restaurant.phone}`}
                  className="text-xs font-black text-[#994700] hover:underline inline-flex items-center gap-1"
                >
                  Call Kitchen <Phone className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          {/* Courier Info Card */}
          <div className="bg-white rounded-3xl p-5 flex items-center gap-4 ambient-glow border border-neutral-100 shadow-xs">
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-emerald-100 flex-shrink-0 flex items-center justify-center text-2xl">
              🛵
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-[#251912]">
                Marcus T.
              </h3>
              <p className="text-xs text-[#5e5e5e] font-semibold">
                Your Delivery Expert
              </p>
              <div className="flex items-center gap-1 text-[#ff7a00] text-xs font-black">
                <Star className="w-3.5 h-3.5 fill-[#ff7a00]" /> 4.9 Rating
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary Section */}
        <section className="bg-white rounded-3xl p-6 ambient-glow border border-neutral-100 shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-neutral-100">
            <h3 className="text-lg font-black text-[#251912]">Order Summary</h3>
            <span className="text-xs font-bold text-[#5e5e5e]">
              #{order.id.slice(0, 8).toUpperCase()}
            </span>
          </div>

          <div className="space-y-3">
            {orderItems?.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between pb-3 border-b border-neutral-100 last:border-none"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#ffeadf] text-[#994700] flex items-center justify-center font-black text-xs">
                    {item.quantity}x
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-[#251912]">
                      {item.food_name_snapshot}
                    </h4>
                    <p className="text-xs text-[#5e5e5e] font-semibold">
                      ₹{item.unit_price_snapshot} each
                    </p>
                  </div>
                </div>
                <span className="text-sm font-black text-[#251912]">
                  ₹{item.line_total}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-neutral-100 space-y-2 text-xs font-semibold text-[#5e5e5e]">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-black text-[#251912]">₹{order.subtotal}</span>
            </div>
            <div className="flex justify-between text-sm font-black text-[#251912] pt-2">
              <span>Total Paid (COD)</span>
              <span className="text-[#994700]">₹{order.total}</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
