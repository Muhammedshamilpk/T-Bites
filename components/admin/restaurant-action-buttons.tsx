"use client";

import { useTransition } from "react";
import {
  approveRestaurantAction,
  suspendRestaurantAction,
  rejectRestaurantAction,
} from "@/actions/admin.actions";
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Props {
  restaurantId: string;
  currentStatus: "pending" | "approved" | "suspended" | "rejected";
}

export function RestaurantActionButtons({ restaurantId, currentStatus }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleApprove = () => {
    startTransition(async () => {
      const res = await approveRestaurantAction(restaurantId);
      if (res.success) {
        toast.success("Restaurant approved successfully!");
      } else {
        toast.error(res.error || "Failed to approve restaurant");
      }
    });
  };

  const handleSuspend = () => {
    if (!confirm("Are you sure you want to suspend this restaurant?")) return;
    startTransition(async () => {
      const res = await suspendRestaurantAction(restaurantId);
      if (res.success) {
        toast.warning("Restaurant status updated to suspended.");
      } else {
        toast.error(res.error || "Failed to suspend restaurant");
      }
    });
  };

  const handleReject = () => {
    if (!confirm("Are you sure you want to reject this restaurant registration?")) return;
    startTransition(async () => {
      const res = await rejectRestaurantAction(restaurantId);
      if (res.success) {
        toast.info("Restaurant registration rejected.");
      } else {
        toast.error(res.error || "Failed to reject restaurant");
      }
    });
  };

  if (isPending) {
    return (
      <div className="flex items-center gap-2 text-sm text-foreground-muted py-2">
        <Loader2 className="w-4 h-4 animate-spin text-primary" />
        Updating status...
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {currentStatus === "pending" && (
        <>
          <button
            onClick={handleApprove}
            className="flex-1 px-4 py-2 rounded-xl bg-success text-white font-semibold text-sm hover:bg-success/90 transition-all flex items-center justify-center gap-1.5 shadow-sm"
          >
            <CheckCircle className="w-4 h-4" />
            Approve
          </button>
          <button
            onClick={handleReject}
            className="flex-1 px-4 py-2 rounded-xl border-2 border-error text-error font-semibold text-sm hover:bg-error/5 transition-all flex items-center justify-center gap-1.5"
          >
            <XCircle className="w-4 h-4" />
            Reject
          </button>
        </>
      )}

      {currentStatus === "approved" && (
        <button
          onClick={handleSuspend}
          className="px-4 py-2 rounded-xl border border-warning text-warning text-sm font-semibold hover:bg-warning/10 transition-all flex items-center gap-1.5"
        >
          <AlertTriangle className="w-4 h-4" />
          Suspend
        </button>
      )}

      {currentStatus === "suspended" && (
        <button
          onClick={handleApprove}
          className="px-4 py-2 rounded-xl bg-success text-white text-sm font-semibold hover:bg-success/90 transition-all flex items-center gap-1.5 shadow-sm"
        >
          <CheckCircle className="w-4 h-4" />
          Reactivate
        </button>
      )}
    </div>
  );
}
