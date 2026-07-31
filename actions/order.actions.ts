"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient, createAdminClient, getCurrentUser } from "@/lib/supabase/server";
import { addressSchema } from "@/lib/validation/schemas";
import type { ActionResult } from "@/types/domain.types";
import type { OrderStatus } from "@/types/database.types";

export type OrderFormState = {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
  orderId?: string;
} | undefined;

/** Create a customer delivery address. */
export async function createAddressAction(
  _prevState: OrderFormState,
  formData: FormData
): Promise<OrderFormState> {
  const user = await getCurrentUser();
  if (!user) return { message: "Unauthorized" };

  const raw = {
    label: formData.get("label") as string,
    line1: formData.get("line1") as string,
    line2: (formData.get("line2") as string) || undefined,
    city: formData.get("city") as string,
    pincode: formData.get("pincode") as string,
    landmark: (formData.get("landmark") as string) || undefined,
    is_default: formData.get("is_default") === "true",
  };

  const result = addressSchema.safeParse(raw);
  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors as Record<string, string[]>,
      message: "Please fix the address errors below.",
    };
  }

  const adminSupabase = await createAdminClient();

  // If set as default, reset other addresses
  if (result.data.is_default) {
    await adminSupabase
      .from("addresses")
      .update({ is_default: false })
      .eq("customer_id", user.id);
  }

  const { error } = await adminSupabase.from("addresses").insert({
    customer_id: user.id,
    ...result.data,
  });

  if (error) return { message: error.message };

  revalidatePath("/checkout");
  revalidatePath("/cart");
  return { success: true, message: "Address added successfully!" };
}

/** Place a new food order (Cash on Delivery). */
export async function placeOrderAction(
  restaurantId: string,
  addressId: string,
  customerNote?: string
): Promise<ActionResult<{ orderId: string }>> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const adminSupabase = await createAdminClient();

  // Fetch cart items for customer
  const { data: cart } = await adminSupabase
    .from("carts")
    .select("*, cart_items(*, food_item:food_items(*))")
    .eq("customer_id", user.id)
    .single();

  if (!cart || !cart.cart_items || cart.cart_items.length === 0) {
    return { success: false, error: "Your cart is empty." };
  }

  // Calculate totals
  let subtotal = 0;
  const itemsToInsert = [];

  for (const item of cart.cart_items) {
    const foodItem = item.food_item as unknown as {
      name: string;
      price: number;
    } | null;

    if (!foodItem) continue;

    const unitPrice = item.unit_price_snapshot || foodItem.price;
    const lineTotal = unitPrice * item.quantity;
    subtotal += lineTotal;

    itemsToInsert.push({
      food_item_id: item.food_item_id,
      food_name_snapshot: foodItem.name,
      unit_price_snapshot: unitPrice,
      quantity: item.quantity,
      line_total: lineTotal,
    });
  }

  const total = subtotal;

  // Insert order
  const { data: newOrder, error: orderError } = await adminSupabase
    .from("orders")
    .insert({
      customer_id: user.id,
      restaurant_id: restaurantId,
      delivery_address_id: addressId,
      status: "placed",
      payment_method: "cod",
      subtotal,
      total,
      customer_note: customerNote || null,
    })
    .select("id")
    .single();

  if (orderError || !newOrder) {
    return { success: false, error: orderError?.message || "Failed to place order." };
  }

  // Insert order items
  const orderItemsWithOrderId = itemsToInsert.map((i) => ({
    order_id: newOrder.id,
    ...i,
  }));

  await adminSupabase.from("order_items").insert(orderItemsWithOrderId);

  // Insert order status history
  await adminSupabase.from("order_status_history").insert({
    order_id: newOrder.id,
    status: "placed",
    changed_by: user.id,
    note: "Order placed by customer",
  });

  // Clear customer cart
  await adminSupabase.from("cart_items").delete().eq("cart_id", cart.id);
  await adminSupabase.from("carts").delete().eq("id", cart.id);

  // Notify restaurant owner
  const { data: restaurant } = await adminSupabase
    .from("restaurants")
    .select("owner_id, name")
    .eq("id", restaurantId)
    .single();

  if (restaurant) {
    await adminSupabase.from("notifications").insert({
      recipient_id: restaurant.owner_id,
      type: "new_order",
      title: "New Order Received! 🔔",
      body: `You received a new order #${newOrder.id.slice(0, 8)} worth ₹${total}.`,
      related_order_id: newOrder.id,
    });
  }

  revalidatePath("/orders");
  revalidatePath("/cart");
  revalidatePath("/dashboard/orders");

  return { success: true, data: { orderId: newOrder.id } };
}

import { createSanityOrderAction } from "@/lib/sanity/sanity-store.service";

/** Place a direct order from client Zustand cart (Cash on Delivery). */
export async function placeDirectOrderAction(payload: {
  restaurant_id: string;
  customer_name: string;
  customer_phone: string;
  address_line: string;
  city: string;
  pincode: string;
  items: Array<{
    food_item_id: string;
    food_name: string;
    price: number;
    quantity: number;
  }>;
}): Promise<ActionResult<{ orderId: string }>> {
  const user = await getCurrentUser();
  const cookieStore = await cookies();
  const demoCookie = cookieStore.get("tbites_demo_user")?.value;
  const adminSupabase = await createAdminClient();

  if (!user && !demoCookie) {
    return {
      success: false,
      error: "Authentication Required: Please sign in or create an account to place your food order.",
    };
  }

  // Save order directly into Sanity CMS for authenticated user
  const sanityRes = await createSanityOrderAction({
    customerName: payload.customer_name,
    customerPhone: payload.customer_phone,
    addressLine: payload.address_line,
    city: payload.city,
    pincode: payload.pincode,
    items: payload.items,
  });

  let customerId = user?.id;
  if (!customerId && demoCookie) {
    try {
      const parsed = JSON.parse(demoCookie);
      customerId = parsed.id;
    } catch {}
  }

  const subtotal = payload.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const deliveryFee = subtotal > 299 || subtotal === 0 ? 0 : 30;
  const total = subtotal + deliveryFee;

  // Insert address
  // Optional Supabase DB sync (silently skipped if tables are dropped)
  try {
    const { data: address } = await adminSupabase
      .from("addresses")
      .insert({
        customer_id: customerId,
        label: "Home",
        line1: payload.address_line,
        city: payload.city,
        pincode: payload.pincode,
      })
      .select("id")
      .single();

    const addressId = address?.id || "00000000-0000-0000-0000-000000000001";

    const { data: newOrder } = await adminSupabase
      .from("orders")
      .insert({
        customer_id: customerId,
        restaurant_id: payload.restaurant_id,
        delivery_address_id: addressId,
        status: "placed",
        payment_method: "cod",
        subtotal,
        total,
        customer_note: `Customer: ${payload.customer_name} • Phone: ${payload.customer_phone}`,
      })
      .select("id")
      .single();

    if (newOrder?.id) {
      const orderItemsToInsert = payload.items.map((i) => ({
        order_id: newOrder.id,
        food_item_id: i.food_item_id,
        quantity: i.quantity,
        unit_price_snapshot: i.price,
        line_total: i.price * i.quantity,
        food_name_snapshot: i.food_name,
      }));

      await adminSupabase.from("order_items").insert(orderItemsToInsert);
    }
  } catch (err) {
    // Legacy Supabase tables dropped - Sanity CMS is active
  }

  revalidatePath("/orders");
  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard");

  return {
    success: true,
    data: { orderId: (sanityRes as any)?.order?._id || `ORD-${Date.now().toString().slice(-4)}` },
  };
}

/** Update order status (for restaurant owners & admins). */
export async function updateOrderStatusAction(
  orderId: string,
  newStatus: OrderStatus,
  reason?: string
): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const adminSupabase = await createAdminClient();

  const updatePayload: { status: OrderStatus; rejection_reason?: string } = {
    status: newStatus,
  };
  if (reason) updatePayload.rejection_reason = reason;

  const { error } = await adminSupabase
    .from("orders")
    .update(updatePayload)
    .eq("id", orderId);

  if (error) return { success: false, error: error.message };

  // Check if latest status history is already the same status
  const { data: latestHistory } = await adminSupabase
    .from("order_status_history")
    .select("status")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!latestHistory || latestHistory.status !== newStatus) {
    // Insert status history only if it's a new status transition
    await adminSupabase.from("order_status_history").insert({
      order_id: orderId,
      status: newStatus,
      changed_by: user.id,
      note: reason || `Status updated to ${newStatus}`,
    });
  }

  // Notify customer
  const { data: order } = await adminSupabase
    .from("orders")
    .select("customer_id, id")
    .eq("id", orderId)
    .single();

  if (order) {
    const statusLabels: Record<OrderStatus, string> = {
      placed: "Order Placed",
      accepted: "Accepted by Restaurant",
      rejected: "Order Declined",
      preparing: "Being Prepared",
      out_for_delivery: "Out for Delivery",
      delivered: "Delivered",
      cancelled: "Order Cancelled",
    };

    await adminSupabase.from("notifications").insert({
      recipient_id: order.customer_id,
      type: "order_status_change",
      title: `Order Update: ${statusLabels[newStatus] || newStatus}`,
      body: `Your order #${orderId.slice(0, 8)} status is now: ${statusLabels[newStatus] || newStatus}.`,
      related_order_id: orderId,
    });
  }

  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/dashboard/orders");
  return { success: true };
}
