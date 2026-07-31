"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  approveRestaurant,
  suspendRestaurant,
  rejectRestaurant,
  deactivateUser,
  reactivateUser,
} from "@/services/admin.service";
import { create as createNotification } from "@/services/notification.service";
import type { ActionResult } from "@/types/domain.types";

/** Admin action to approve a pending restaurant. */
export async function approveRestaurantAction(
  restaurantId: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  try {
    await approveRestaurant(supabase, restaurantId, user.id);

    // Fetch restaurant owner to notify
    const { data: restaurant } = await supabase
      .from("restaurants")
      .select("owner_id, name")
      .eq("id", restaurantId)
      .single();

    if (restaurant) {
      await createNotification(
        supabase,
        restaurant.owner_id,
        "restaurant_approved",
        "Restaurant Approved! 🎉",
        `Great news! "${restaurant.name}" has been approved. You can now set your status to Open and start accepting orders.`
      );
    }

    revalidatePath("/admin");
    revalidatePath("/admin/restaurants");
    revalidatePath("/restaurants");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to approve restaurant";
    return { success: false, error: message };
  }
}

/** Admin action to suspend an approved restaurant. */
export async function suspendRestaurantAction(
  restaurantId: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  try {
    await suspendRestaurant(supabase, restaurantId, user.id);

    const { data: restaurant } = await supabase
      .from("restaurants")
      .select("owner_id, name")
      .eq("id", restaurantId)
      .single();

    if (restaurant) {
      await createNotification(
        supabase,
        restaurant.owner_id,
        "restaurant_suspended",
        "Restaurant Suspended",
        `Your restaurant "${restaurant.name}" has been temporarily suspended by an administrator. Please contact support.`
      );
    }

    revalidatePath("/admin");
    revalidatePath("/admin/restaurants");
    revalidatePath("/restaurants");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to suspend restaurant";
    return { success: false, error: message };
  }
}

/** Admin action to reject a pending restaurant. */
export async function rejectRestaurantAction(
  restaurantId: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  try {
    await rejectRestaurant(supabase, restaurantId, user.id);

    revalidatePath("/admin");
    revalidatePath("/admin/restaurants");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to reject restaurant";
    return { success: false, error: message };
  }
}

/** Admin action to deactivate a user account. */
export async function deactivateUserAction(
  targetUserId: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  try {
    await deactivateUser(supabase, targetUserId, user.id);
    revalidatePath("/admin/users");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to deactivate user";
    return { success: false, error: message };
  }
}

/** Admin action to reactivate a user account. */
export async function reactivateUserAction(
  targetUserId: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  try {
    await reactivateUser(supabase, targetUserId, user.id);
    revalidatePath("/admin/users");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to reactivate user";
    return { success: false, error: message };
  }
}

/** Update restaurant partner details in Sanity CMS. */
export async function updateRestaurantSanityAction(
  restaurantId: string,
  formData: FormData
): Promise<ActionResult> {
  const name = (formData.get("name") as string)?.trim();
  const address = (formData.get("address") as string)?.trim();
  const contactNumber = (formData.get("contactNumber") as string)?.trim();
  const ownerEmail = (formData.get("ownerEmail") as string)?.trim();
  const status = (formData.get("status") as string)?.trim() || "active";

  if (!restaurantId || !name) {
    return { success: false, error: "Restaurant ID and Name are required." };
  }

  try {
    const { sanityClient } = await import("@/lib/sanity/client");
    await sanityClient
      .patch(restaurantId)
      .set({
        name,
        address,
        contactNumber,
        ownerEmail,
        status,
      })
      .commit();

    revalidatePath("/admin/restaurants");
    revalidatePath("/admin");
    return { success: true };
  } catch (err: any) {
    console.error("Failed to update restaurant in Sanity:", err);
    return { success: false, error: err.message || "Failed to update restaurant." };
  }
}

/** Toggle restaurant status (active <-> suspended) in Sanity CMS. */
export async function toggleRestaurantStatusAction(
  restaurantId: string,
  newStatus: "active" | "suspended"
): Promise<ActionResult> {
  try {
    const { sanityClient } = await import("@/lib/sanity/client");
    await sanityClient
      .patch(restaurantId)
      .set({ status: newStatus })
      .commit();

    revalidatePath("/admin/restaurants");
    revalidatePath("/admin");
    return { success: true };
  } catch (err: any) {
    console.error("Failed to toggle status:", err);
    return { success: false, error: err.message || "Failed to toggle status." };
  }
}

/** Delete restaurant partner & all linked referencing documents from Sanity CMS cleanly. */
export async function deleteRestaurantSanityAction(
  restaurantId: string
): Promise<ActionResult> {
  if (!restaurantId) return { success: false, error: "Restaurant ID is required." };

  try {
    const { sanityClient } = await import("@/lib/sanity/client");

    // 1. Delete all orders linked to this restaurant first
    const orderIds = await sanityClient.fetch(
      `*[_type == "order" && restaurant._ref == $restaurantId]._id`,
      { restaurantId }
    );
    for (const id of orderIds || []) {
      await sanityClient.delete(id);
    }

    // 2. Delete all food items linked to this restaurant (and any sub-references)
    const foodIds = await sanityClient.fetch(
      `*[_type == "foodItem" && restaurant._ref == $restaurantId]._id`,
      { restaurantId }
    );
    for (const id of foodIds || []) {
      const subRefs = await sanityClient.fetch(`*[references($id)]._id`, { id });
      for (const subId of subRefs || []) {
        await sanityClient.delete(subId);
      }
      await sanityClient.delete(id);
    }

    // 3. Delete all owner accounts linked to this restaurant
    const ownerIds = await sanityClient.fetch(
      `*[_type == "restaurantOwner" && restaurant._ref == $restaurantId]._id`,
      { restaurantId }
    );
    for (const id of ownerIds || []) {
      await sanityClient.delete(id);
    }

    // 4. Delete any remaining documents referencing this restaurant
    const remainingRefs = await sanityClient.fetch(
      `*[references($restaurantId)]._id`,
      { restaurantId }
    );
    for (const id of remainingRefs || []) {
      await sanityClient.delete(id);
    }

    // 5. Finally delete the restaurant document itself
    await sanityClient.delete(restaurantId);

    revalidatePath("/admin/restaurants");
    revalidatePath("/admin");
    return { success: true };
  } catch (err: any) {
    console.error("Failed to delete restaurant from Sanity:", err);
    return { success: false, error: err.message || "Failed to delete restaurant." };
  }
}
