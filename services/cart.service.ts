/**
 * CartService — server-persisted cart mutations and restaurant-scoping.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

type Client = SupabaseClient<Database>;

/** Get or create the current user's cart. */
export async function getOrCreateCart(supabase: Client) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Try to get existing cart
  const { data: existing } = await supabase
    .from("carts")
    .select("*, cart_items(*, food_item:food_items(*, food_images(*)))")
    .eq("customer_id", user.id)
    .single();

  if (existing) return existing;

  // Create a new cart
  const { data: newCart, error } = await supabase
    .from("carts")
    .insert({ customer_id: user.id })
    .select("*, cart_items(*, food_item:food_items(*, food_images(*)))")
    .single();

  if (error) throw error;
  return newCart;
}

/** Add item to cart (handles restaurant-scoping). */
export async function addItem(
  supabase: Client,
  cartId: string,
  foodItemId: string,
  restaurantId: string,
  quantity: number,
  unitPrice: number
) {
  // Check if cart is for a different restaurant
  const { data: cart } = await supabase
    .from("carts")
    .select("restaurant_id")
    .eq("id", cartId)
    .single();

  if (cart?.restaurant_id && cart.restaurant_id !== restaurantId) {
    // Clear cart first — can only have items from one restaurant
    await supabase.from("cart_items").delete().eq("cart_id", cartId);
  }

  // Update cart's restaurant_id
  await supabase
    .from("carts")
    .update({ restaurant_id: restaurantId })
    .eq("id", cartId);

  // Check if item already in cart — if so, increment quantity
  const { data: existingItem } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("cart_id", cartId)
    .eq("food_item_id", foodItemId)
    .single();

  if (existingItem) {
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: existingItem.quantity + quantity })
      .eq("id", existingItem.id);
    if (error) throw error;
    return;
  }

  // Insert new cart item
  const { error } = await supabase.from("cart_items").insert({
    cart_id: cartId,
    food_item_id: foodItemId,
    quantity,
    unit_price_snapshot: unitPrice,
  });

  if (error) throw error;
}

/** Update item quantity in cart. */
export async function updateQuantity(
  supabase: Client,
  cartItemId: string,
  quantity: number
) {
  if (quantity <= 0) {
    return removeItem(supabase, cartItemId);
  }

  const { error } = await supabase
    .from("cart_items")
    .update({ quantity })
    .eq("id", cartItemId);

  if (error) throw error;
}

/** Remove item from cart. */
export async function removeItem(supabase: Client, cartItemId: string) {
  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("id", cartItemId);

  if (error) throw error;
}

/** Clear all items from cart. */
export async function clearCart(supabase: Client, cartId: string) {
  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("cart_id", cartId);

  if (error) throw error;

  // Reset restaurant_id
  await supabase
    .from("carts")
    .update({ restaurant_id: null })
    .eq("id", cartId);
}
