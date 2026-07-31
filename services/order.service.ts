/**
 * OrderService — order placement, status transitions, history, and tracking.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { OrderStatus } from "@/types/domain.types";

type Client = SupabaseClient<Database>;

/** Place a new order from the current cart. */
export async function placeOrder(
  supabase: Client,
  cartId: string,
  deliveryAddressId: string,
  customerNote?: string
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Fetch cart with items
  const { data: cart, error: cartError } = await supabase
    .from("carts")
    .select("*, cart_items(*, food_item:food_items(name, price, is_available))")
    .eq("id", cartId)
    .single();

  if (cartError || !cart) throw new Error("Cart not found");
  if (!cart.restaurant_id) throw new Error("Cart is empty");
  if (!cart.cart_items?.length) throw new Error("Cart has no items");

  // Validate items are still available
  const unavailable = cart.cart_items.filter(
    (item: { food_item: { is_available: boolean } | null }) => !item.food_item?.is_available
  );
  if (unavailable.length > 0) {
    throw new Error("Some items are no longer available. Please update your cart.");
  }

  // Calculate totals
  const subtotal = cart.cart_items.reduce(
    (sum: number, item: { unit_price_snapshot: number; quantity: number }) =>
      sum + item.unit_price_snapshot * item.quantity,
    0
  );

  // Create order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_id: user.id,
      restaurant_id: cart.restaurant_id,
      delivery_address_id: deliveryAddressId,
      subtotal,
      total: subtotal, // Same as subtotal in MVP (no fees)
      customer_note: customerNote || null,
    })
    .select()
    .single();

  if (orderError || !order) throw orderError || new Error("Failed to create order");

  // Create order items (immutable snapshots)
  const orderItems = cart.cart_items.map(
    (item: {
      food_item_id: string;
      food_item: { name: string } | null;
      unit_price_snapshot: number;
      quantity: number;
    }) => ({
      order_id: order.id,
      food_item_id: item.food_item_id,
      food_name_snapshot: item.food_item?.name || "Unknown Item",
      unit_price_snapshot: item.unit_price_snapshot,
      quantity: item.quantity,
      line_total: item.unit_price_snapshot * item.quantity,
    })
  );

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) throw itemsError;

  // Insert initial status history
  const { error: historyError } = await supabase
    .from("order_status_history")
    .insert({
      order_id: order.id,
      status: "placed" as OrderStatus,
      changed_by: user.id,
    });

  if (historyError) throw historyError;

  // Clear cart
  await supabase.from("cart_items").delete().eq("cart_id", cartId);
  await supabase.from("carts").update({ restaurant_id: null }).eq("id", cartId);

  return order;
}

/** Accept an order (restaurant owner). */
export async function acceptOrder(supabase: Client, orderId: string) {
  const { error } = await supabase
    .from("orders")
    .update({ status: "accepted" as OrderStatus })
    .eq("id", orderId);

  if (error) throw error;
}

/** Reject an order with reason (restaurant owner). */
export async function rejectOrder(
  supabase: Client,
  orderId: string,
  rejectionReason: string
) {
  const { error } = await supabase
    .from("orders")
    .update({
      status: "rejected" as OrderStatus,
      rejection_reason: rejectionReason,
    })
    .eq("id", orderId);

  if (error) throw error;
}

/** Update order status (restaurant owner). */
export async function updateStatus(
  supabase: Client,
  orderId: string,
  status: OrderStatus
) {
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);

  if (error) throw error;
}

/** Get order tracking timeline. */
export async function getTrackingTimeline(supabase: Client, orderId: string) {
  const { data, error } = await supabase
    .from("order_status_history")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at");

  if (error) throw error;
  return data;
}

/** List orders for a customer. */
export async function listByCustomer(supabase: Client) {
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*), restaurant:restaurants(id, name, logo_url, phone)")
    .order("placed_at", { ascending: false });

  if (error) throw error;
  return data;
}

/** List orders for a restaurant. */
export async function listByRestaurant(
  supabase: Client,
  restaurantId: string,
  statusFilter?: OrderStatus
) {
  let query = supabase
    .from("orders")
    .select("*, order_items(*), customer:profiles!orders_customer_id_fkey(full_name, phone), delivery_address:addresses(*)")
    .eq("restaurant_id", restaurantId)
    .order("placed_at", { ascending: false });

  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}
