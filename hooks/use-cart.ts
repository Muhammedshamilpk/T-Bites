"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { CartWithItems } from "@/types/domain.types";

/**
 * Hook for client-side cart state.
 * Fetches the server-persisted cart and provides optimistic helpers.
 */
export function useCart() {
  const [cart, setCart] = useState<CartWithItems | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCart = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setCart(null);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("carts")
      .select("*, cart_items(*, food_item:food_items(*, food_images(*))), restaurant:restaurants(*)")
      .eq("customer_id", user.id)
      .single();

    setCart(data as unknown as CartWithItems);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const itemCount = cart?.cart_items?.reduce(
    (sum, item) => sum + item.quantity,
    0
  ) ?? 0;

  const subtotal = cart?.cart_items?.reduce(
    (sum, item) => sum + item.unit_price_snapshot * item.quantity,
    0
  ) ?? 0;

  return {
    cart,
    loading,
    itemCount,
    subtotal,
    refetch: fetchCart,
  };
}
