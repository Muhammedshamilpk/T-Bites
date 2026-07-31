"use client";

import { useState, useTransition, useMemo } from "react";
import { updateSanityOrderStatusAction } from "@/lib/sanity/sanity-store.service";
import type { SanityOrder } from "@/lib/sanity/sanity-store.service";
import { updateOrderStatusAction } from "@/actions/order.actions";
import {
  Clock,
  Printer,
  CheckCircle,
  MapPin,
  FileText,
  Phone,
  XCircle,
  Search,
  Timer,
  ShoppingBag,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Props {
  initialOrders: SanityOrder[];
}

export function SanityOrdersManager({ initialOrders }: Props) {
  const [orders, setOrders] = useState<SanityOrder[]>(initialOrders);
  const [selectedOrderId, setSelectedOrderId] = useState<string>(
    initialOrders[0]?._id || ""
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const selectedOrder = useMemo(
    () => orders.find((o) => o._id === selectedOrderId) || orders[0],
    [orders, selectedOrderId]
  );

  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const q = searchQuery.toLowerCase();
    return orders.filter(
      (o) =>
        o._id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q)
    );
  }, [orders, searchQuery]);

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o._id === orderId ? { ...o, status: newStatus as any } : o
      )
    );

    startTransition(async () => {
      await updateOrderStatusAction(orderId, newStatus as any);
      await updateSanityOrderStatusAction(orderId, newStatus);
      toast.success(`Order #${orderId.slice(0, 8)} updated to ${newStatus.toUpperCase()}!`);
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "placed":
      case "new":
        return (
          <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 font-extrabold text-[11px] uppercase">
            NEW
          </span>
        );
      case "accepted":
        return (
          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-extrabold text-[11px] uppercase">
            ACCEPTED
          </span>
        );
      case "preparing":
        return (
          <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 font-extrabold text-[11px] uppercase">
            PREPARING
          </span>
        );
      case "ready":
        return (
          <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 font-extrabold text-[11px] uppercase">
            READY
          </span>
        );
      case "out_for_delivery":
      case "out for delivery":
        return (
          <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 font-extrabold text-[11px] uppercase">
            OUT FOR DELIVERY
          </span>
        );
      case "delivered":
        return (
          <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 font-extrabold text-[11px] uppercase">
            DELIVERED
          </span>
        );
      case "rejected":
      case "cancelled":
        return (
          <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 font-extrabold text-[11px] uppercase">
            CANCELLED
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full bg-neutral-100 text-neutral-700 font-extrabold text-[11px] uppercase">
            {status}
          </span>
        );
    }
  };

  if (orders.length === 0) {
    return (
      <div className="min-h-[60vh] bg-white rounded-[32px] border border-[#e0c0af]/30 p-12 flex flex-col items-center justify-center text-center space-y-6 shadow-sm">
        <div className="w-20 h-20 rounded-full bg-[#ffeadf] flex items-center justify-center text-[#ff7a00]">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="space-y-2 max-w-md">
          <h3 className="text-2xl font-black text-[#251912]">No Active Orders Yet</h3>
          <p className="text-sm font-semibold text-[#584235] leading-relaxed">
            When customers place orders from your restaurant menu, incoming orders will appear here in real time.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left List Pane: Active Orders Feed */}
      <div className="lg:col-span-5 space-y-6">
        {/* Search & Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black text-[#251912] tracking-tight">
              Active Orders
            </h2>
            <span className="bg-[#ffeadf] text-[#994700] px-3 py-1 rounded-full font-black text-xs">
              {orders.length} LIVE
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#8c7263] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search orders or customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-[#fff1ea] border-none rounded-2xl text-xs font-bold text-[#251912] placeholder-[#8c7263] focus:ring-2 focus:ring-[#ff7a00]"
          />
        </div>

        {/* Orders Card Feed */}
        <div className="space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar pr-1">
          {filteredOrders.map((order) => {
            const isSelected = order._id === selectedOrderId;
            const itemCount = order.items?.reduce((acc, i) => acc + i.quantity, 0) || 1;

            return (
              <div
                key={order._id}
                onClick={() => setSelectedOrderId(order._id)}
                className={`p-6 rounded-[24px] cursor-pointer transition-all border ${
                  isSelected
                    ? "bg-white border-[#ff7a00] shadow-lg scale-[1.01]"
                    : "bg-white border-[#e0c0af]/30 hover:border-[#ff7a00]/50"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-extrabold text-sm text-[#251912]">
                    #{order._id.slice(0, 8)}
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#8c7263]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {order.placedAt
                        ? new Date(order.placedAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Just now"}
                    </span>
                  </div>
                </div>

                <div className="mb-3">
                  <h4 className="font-black text-base text-[#251912]">
                    {order.customerName}
                  </h4>
                  <div className="flex items-center gap-2 text-xs font-bold text-[#584235] mt-1">
                    <span>
                      {itemCount} Items • ₹{Number(order.total || 0).toLocaleString("en-IN")}
                    </span>
                    <span className="bg-[#ffeadf] text-[#584235] px-2 py-0.5 rounded-full text-[10px]">
                      DELIVERY
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  {getStatusBadge(order.status)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Pane: Selected Order Detailed View */}
      {selectedOrder && (
        <div className="lg:col-span-7 bg-white rounded-[32px] border border-[#e0c0af]/30 p-8 lg:p-10 space-y-8 shadow-sm">
          {/* Detailed Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e0c0af]/20 pb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-2xl font-black text-[#251912]">
                  Order #{selectedOrder._id.slice(0, 8)}
                </h3>
                {getStatusBadge(selectedOrder.status)}
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#8c7263]">
                <Timer className="w-4 h-4 text-[#ff7a00]" />
                <span>
                  Placed at{" "}
                  {selectedOrder.placedAt
                    ? new Date(selectedOrder.placedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Just now"}{" "}
                  (Estimated ready in 15 mins)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#e0c0af] text-xs font-black text-[#584235] hover:bg-[#fff1ea] transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>Print Ticket</span>
              </button>

              {selectedOrder.status === "placed" || selectedOrder.status === "new" ? (
                <button
                  disabled={isPending}
                  onClick={() => handleStatusUpdate(selectedOrder._id, "preparing")}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#ff7a00] text-white font-black text-xs hover:bg-[#994700] transition-all shadow-md"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Accept & Prepare</span>
                </button>
              ) : selectedOrder.status === "preparing" ? (
                <button
                  disabled={isPending}
                  onClick={() => handleStatusUpdate(selectedOrder._id, "ready")}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#ff7a00] text-white font-black text-xs hover:bg-[#994700] transition-all shadow-md"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Mark as Ready</span>
                </button>
              ) : selectedOrder.status === "ready" ? (
                <button
                  disabled={isPending}
                  onClick={() => handleStatusUpdate(selectedOrder._id, "out_for_delivery")}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 text-white font-black text-xs hover:bg-purple-700 transition-all shadow-md"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Dispatch Order</span>
                </button>
              ) : selectedOrder.status === "out_for_delivery" || selectedOrder.status === "out for delivery" ? (
                <button
                  disabled={isPending}
                  onClick={() => handleStatusUpdate(selectedOrder._id, "delivered")}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-green-600 text-white font-black text-xs hover:bg-green-700 transition-all shadow-md"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Mark Delivered</span>
                </button>
              ) : (
                <span className="font-black text-xs text-green-600 flex items-center gap-1.5 bg-green-50 px-4 py-2 rounded-xl border border-green-200">
                  <CheckCircle className="w-4 h-4" /> COMPLETED
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Order Contents Section */}
            <div className="space-y-4">
              <h4 className="font-black text-xs uppercase tracking-wider text-[#8c7263]">
                Order Contents
              </h4>

              <div className="space-y-3">
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  selectedOrder.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-2xl bg-[#fff1ea]/60 border border-[#e0c0af]/20"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#ffeadf] flex items-center justify-center text-base shrink-0">
                          🍱
                        </div>
                        <div>
                          <p className="font-extrabold text-xs text-[#251912]">
                            {item.quantity}x {item.food_name}
                          </p>
                          <p className="text-[10px] font-semibold text-[#8c7263]">
                            Regular Size • Fresh Preparation
                          </p>
                        </div>
                      </div>
                      <span className="font-black text-xs text-[#251912]">
                        ₹{Number(item.price * item.quantity).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 bg-[#fff1ea] rounded-xl text-xs font-bold text-[#584235]">
                    Standard Order Package
                  </div>
                )}
              </div>

              {/* Price Calculation */}
              <div className="pt-4 border-t border-dashed border-[#e0c0af] space-y-2 text-xs">
                <div className="flex justify-between font-semibold text-[#584235]">
                  <span>Subtotal</span>
                  <span>₹{Number(selectedOrder.subtotal || selectedOrder.total || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between font-semibold text-[#8c7263]">
                  <span>Tax (8.5%)</span>
                  <span>₹{(Number(selectedOrder.total || 0) * 0.085).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-black text-base text-[#251912] pt-2 border-t border-[#e0c0af]/30">
                  <span>Total</span>
                  <span>₹{Number(selectedOrder.total || 0).toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            {/* Customer Information & Delivery Details */}
            <div className="space-y-6">
              <div className="bg-[#fff1ea]/60 p-6 rounded-[24px] border border-[#e0c0af]/20 space-y-4">
                <h4 className="font-black text-xs uppercase tracking-wider text-[#8c7263]">
                  Customer Information
                </h4>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#ffeadf] flex items-center justify-center text-sm font-bold text-[#994700] shrink-0">
                    👤
                  </div>
                  <div>
                    <p className="font-black text-sm text-[#251912]">
                      {selectedOrder.customerName}
                    </p>
                    <p className="text-xs font-bold text-[#8c7263]">
                      {selectedOrder.customerPhone || "+91 (Mobile Verified)"}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#e0c0af]/20 space-y-2">
                  <div className="flex items-start gap-2.5 text-xs text-[#584235]">
                    <MapPin className="w-4 h-4 text-[#ff7a00] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-black text-[#251912]">Delivery Address</p>
                      <p className="font-medium leading-relaxed">
                        {selectedOrder.deliveryAddress || "Customer Location"}
                        {selectedOrder.city ? `, ${selectedOrder.city}` : ""}
                        {selectedOrder.pincode ? ` (${selectedOrder.pincode})` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 text-xs text-[#584235] pt-2">
                    <FileText className="w-4 h-4 text-[#ff7a00] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-black text-[#251912]">Driver Instructions</p>
                      <p className="font-medium italic text-[#8c7263]">
                        "Contact customer upon arrival."
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleStatusUpdate(selectedOrder._id, "cancelled")}
                  className="w-1/2 py-3 rounded-xl border border-red-200 text-red-600 font-black text-xs hover:bg-red-50 transition-all flex items-center justify-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject Order</span>
                </button>
                <a
                  href={`tel:${selectedOrder.customerPhone || ""}`}
                  className="w-1/2 py-3 rounded-xl border border-[#e0c0af] text-[#251912] font-black text-xs hover:bg-[#fff1ea] transition-all flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-4 h-4 text-[#ff7a00]" />
                  <span>Contact Customer</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
