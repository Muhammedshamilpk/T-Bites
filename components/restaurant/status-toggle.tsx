"use client";

import { useTransition } from "react";
import { toggleRestaurantStatusAction } from "@/actions/restaurant.actions";
import type { RestaurantStatus } from "@/types/database.types";
import { Loader2 } from "lucide-react";

import { toast } from "@/hooks/use-toast";

interface Props {
  restaurantId: string;
  currentStatus: RestaurantStatus;
}

export function RestaurantStatusToggle({ restaurantId, currentStatus }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (status: RestaurantStatus) => {
    startTransition(async () => {
      const res = await toggleRestaurantStatusAction(restaurantId, status);
      if (res.success) {
        toast.success(`Store status updated to ${status}`);
      } else {
        toast.error(res.error || "Failed to update restaurant status");
      }
    });
  };

  const statuses: Array<{ key: RestaurantStatus; label: string; activeColor: string }> = [
    { key: "open", label: "Open", activeColor: "bg-success text-white shadow-sm" },
    { key: "closed", label: "Closed", activeColor: "bg-error text-white shadow-sm" },
    { key: "holiday", label: "Holiday", activeColor: "bg-warning text-white shadow-sm" },
  ];

  return (
    <div className="flex items-center gap-3 p-2 rounded-2xl bg-surface border border-border">
      <span className="text-xs font-semibold text-foreground-muted px-2 uppercase tracking-wider">
        Store Status:
      </span>
      {isPending && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
      <div className="flex gap-1">
        {statuses.map((s) => (
          <button
            key={s.key}
            disabled={isPending}
            onClick={() => handleStatusChange(s.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
              currentStatus === s.key
                ? s.activeColor
                : "text-foreground-muted hover:text-foreground hover:bg-background"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
