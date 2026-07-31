"use client";

import { useTransition } from "react";
import { updateOrderStatusAction } from "@/actions/order.actions";
import type { OrderStatus } from "@/types/database.types";
import { CheckCircle2, XCircle, Clock, Truck, PackageCheck, Loader2 } from "lucide-react";

import { toast } from "@/hooks/use-toast";

interface Props {
  orderId: string;
  currentStatus: OrderStatus;
}

export function OrderStatusButtons({ orderId, currentStatus }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleUpdateStatus = (newStatus: OrderStatus, reason?: string) => {
    startTransition(async () => {
      const res = await updateOrderStatusAction(orderId, newStatus, reason);
      if (res.success) {
        toast.success(`Order status changed to ${newStatus.replace(/_/g, " ")}`);
      } else {
        toast.error(res.error || "Failed to update order status");
      }
    });
  };

  const handleReject = () => {
    const reason = prompt("Please enter a reason for declining this order:");
    if (!reason) return;
    handleUpdateStatus("rejected", reason);
  };

  if (isPending) {
    return (
      <div className="flex items-center gap-2 text-xs font-semibold text-foreground-muted py-2">
        <Loader2 className="w-4 h-4 animate-spin text-primary" /> Updating order...
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {currentStatus === "placed" && (
        <>
          <button
            onClick={() => handleUpdateStatus("accepted")}
            className="px-4 py-2 rounded-xl bg-success text-white font-semibold text-xs hover:bg-success/90 transition-all flex items-center gap-1.5 shadow-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Accept Order
          </button>
          <button
            onClick={handleReject}
            className="px-4 py-2 rounded-xl border border-error text-error font-semibold text-xs hover:bg-error/10 transition-all flex items-center gap-1.5"
          >
            <XCircle className="w-3.5 h-3.5" /> Decline
          </button>
        </>
      )}

      {currentStatus === "accepted" && (
        <button
          onClick={() => handleUpdateStatus("preparing")}
          className="px-4 py-2 rounded-xl bg-warning text-white font-semibold text-xs hover:bg-warning/90 transition-all flex items-center gap-1.5 shadow-xs"
        >
          <Clock className="w-3.5 h-3.5" /> Start Preparing
        </button>
      )}

      {currentStatus === "preparing" && (
        <button
          onClick={() => handleUpdateStatus("out_for_delivery")}
          className="px-4 py-2 rounded-xl bg-info text-white font-semibold text-xs hover:bg-info/90 transition-all flex items-center gap-1.5 shadow-xs"
        >
          <Truck className="w-3.5 h-3.5" /> Out for Delivery
        </button>
      )}

      {currentStatus === "out_for_delivery" && (
        <button
          onClick={() => handleUpdateStatus("delivered")}
          className="px-4 py-2 rounded-xl bg-success text-white font-semibold text-xs hover:bg-success/90 transition-all flex items-center gap-1.5 shadow-xs"
        >
          <PackageCheck className="w-3.5 h-3.5" /> Mark Delivered
        </button>
      )}

      {["delivered", "cancelled", "rejected"].includes(currentStatus) && (
        <span className="text-xs font-semibold text-foreground-muted italic">
          Order completed ({currentStatus})
        </span>
      )}
    </div>
  );
}
