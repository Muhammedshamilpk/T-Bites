"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { LiveOwnerOrderNotifier } from "./live-owner-order-notifier";

export function RestaurantDashboardNotifier() {
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  useEffect(() => {
    const fetchOwnerRestaurant = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: restaurant } = await supabase
        .from("restaurants")
        .select("id")
        .eq("owner_id", user.id)
        .single();

      if (restaurant?.id) {
        setRestaurantId(restaurant.id);
      }
    };

    fetchOwnerRestaurant();
  }, []);

  if (!restaurantId) return null;

  return <LiveOwnerOrderNotifier restaurantId={restaurantId} />;
}
