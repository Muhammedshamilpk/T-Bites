"use client";

import { useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { Order } from "@/types/domain.types";

type OrderEventCallback = (payload: {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: Order;
  old: Partial<Order>;
}) => void;

/**
 * Hook to subscribe to realtime order updates.
 *
 * @param restaurantId - Subscribe to orders for this restaurant (owner dashboard)
 * @param orderId - Subscribe to a specific order (customer tracking)
 * @param onEvent - Callback fired on new/updated orders
 */
export function useRealtimeOrders(
  {
    restaurantId,
    orderId,
  }: {
    restaurantId?: string;
    orderId?: string;
  },
  onEvent: OrderEventCallback
) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const callbackRef = useRef(onEvent);
  callbackRef.current = onEvent;

  const subscribe = useCallback(() => {
    const supabase = createClient();

    let filter: string | undefined;
    if (restaurantId) {
      filter = `restaurant_id=eq.${restaurantId}`;
    } else if (orderId) {
      filter = `id=eq.${orderId}`;
    }

    const channel = supabase
      .channel(`orders-${restaurantId || orderId || "all"}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter,
        },
        (payload) => {
          callbackRef.current({
            eventType: payload.eventType as "INSERT" | "UPDATE" | "DELETE",
            new: payload.new as Order,
            old: payload.old as Partial<Order>,
          });
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurantId, orderId]);

  useEffect(() => {
    const cleanup = subscribe();
    return cleanup;
  }, [subscribe]);
}
