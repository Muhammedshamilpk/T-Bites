"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient, createAdminClient, getCurrentUser } from "@/lib/supabase/server";
import {
  createRestaurantSchema,
  updateRestaurantSchema,
} from "@/lib/validation/schemas";
import type { ActionResult } from "@/types/domain.types";
import type { RestaurantStatus } from "@/types/database.types";

export type RestaurantFormState = {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
} | undefined;

/** Register restaurant owner account + store in one step from /owner */
export async function registerOwnerAndRestaurantAction(
  _prevState: RestaurantFormState,
  formData: FormData
): Promise<RestaurantFormState> {
  const full_name = (formData.get("full_name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();
  const password = (formData.get("password") as string)?.trim();

  const restaurant_name = (formData.get("restaurant_name") as string)?.trim();
  const address_line = (formData.get("address_line") as string)?.trim();
  const city = (formData.get("city") as string)?.trim();
  const pincode = (formData.get("pincode") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;

  if (!full_name || !email || !phone || !password || !restaurant_name || !address_line || !city || !pincode) {
    return { message: "Please fill out all required fields." };
  }

  try {
    const { sanityClient } = await import("@/lib/sanity/client");
    const bcrypt = (await import("bcryptjs")).default;

    // 1. Create Sanity Restaurant Document
    const slug = restaurant_name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    const restaurantDoc = await sanityClient.create({
      _type: "restaurant",
      name: restaurant_name,
      slug: { _type: "slug", current: slug },
      address: `${address_line}, ${city} - ${pincode}`,
      contactNumber: phone,
      ownerEmail: email,
      status: "active",
      createdAt: new Date().toISOString(),
    });

    // 2. Hash Password & Create Sanity Restaurant Owner Auth Document
    const passwordHash = await bcrypt.hash(password, 10);
    await sanityClient.create({
      _type: "restaurantOwner",
      email: email.toLowerCase().trim(),
      passwordHash,
      restaurant: { _type: "reference", _ref: restaurantDoc._id },
      role: "restaurant_owner",
      createdAt: new Date().toISOString(),
    });

    // 3. Optional Supabase Profile Sync for compatibility
    try {
      const adminSupabase = await createAdminClient();
      await adminSupabase.from("profiles").upsert(
        {
          id: restaurantDoc._id,
          full_name,
          phone,
          role: "restaurant_owner",
          is_active: true,
        },
        { onConflict: "id" }
      );
    } catch {
      // Ignore Supabase table errors since Sanity is our primary store
    }

    revalidatePath("/admin/restaurants");
    revalidatePath("/admin");

    return {
      success: true,
      message: `Successfully registered ${restaurant_name}! Owner can log in with ${email}.`,
    };
  } catch (err: any) {
    console.error("Failed to register restaurant in Sanity:", err);
    return {
      success: false,
      message: err.message || "Failed to register restaurant in Sanity CMS.",
    };
  }
}

/** Create a new restaurant registration. */
export async function createRestaurantAction(
  _prevState: RestaurantFormState,
  formData: FormData
): Promise<RestaurantFormState> {
  const user = await getCurrentUser();
  if (!user) {
    return { message: "You must be logged in to register a restaurant." };
  }

  const raw = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
    address_line: formData.get("address_line") as string,
    city: formData.get("city") as string,
    pincode: formData.get("pincode") as string,
    phone: formData.get("phone") as string,
  };

  const result = createRestaurantSchema.safeParse(raw);
  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors as Record<string, string[]>,
      message: "Please fix the form errors below.",
    };
  }

  // Use Admin Client to ensure profile exists and restaurant inserts smoothly
  const adminSupabase = await createAdminClient();

  // 1. Ensure owner profile exists in profiles table to satisfy foreign key
  await adminSupabase.from("profiles").upsert(
    {
      id: user.id,
      full_name: (user.user_metadata?.full_name as string) || "Restaurant Owner",
      phone: result.data.phone.trim() || null,
      role: "restaurant_owner",
      is_active: true,
    },
    { onConflict: "id" }
  );

  // 2. Insert restaurant
  const { error } = await adminSupabase
    .from("restaurants")
    .insert({
      owner_id: user.id,
      ...result.data,
      status: "open",
      approval_status: "approved",
    });

  if (error) {
    console.error("Restaurant insert error:", error);
    return { message: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
  revalidatePath("/restaurants");
  return { success: true, message: "Restaurant registered successfully!" };
}

/** Update restaurant details. */
export async function updateRestaurantAction(
  restaurantId: string,
  _prevState: RestaurantFormState,
  formData: FormData
): Promise<RestaurantFormState> {
  const user = await getCurrentUser();
  if (!user) {
    return { message: "Unauthorized" };
  }

  const raw = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
    address_line: formData.get("address_line") as string,
    city: formData.get("city") as string,
    pincode: formData.get("pincode") as string,
    phone: formData.get("phone") as string,
  };

  const result = updateRestaurantSchema.safeParse(raw);
  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors as Record<string, string[]>,
      message: "Please fix the form errors below.",
    };
  }

  const adminSupabase = await createAdminClient();
  const { error } = await adminSupabase
    .from("restaurants")
    .update(result.data)
    .eq("id", restaurantId);

  if (error) {
    return { message: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
  revalidatePath("/restaurants");
  return { success: true, message: "Restaurant details updated successfully!" };
}

/** Toggle restaurant operational status (open / closed / holiday). */
export async function toggleRestaurantStatusAction(
  restaurantId: string,
  status: RestaurantStatus
): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const adminSupabase = await createAdminClient();
  const { error } = await adminSupabase
    .from("restaurants")
    .update({ status })
    .eq("id", restaurantId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
  revalidatePath("/restaurants");
  return { success: true };
}

/** Update operating hours for a restaurant. */
export async function updateOperatingHoursAction(
  restaurantId: string,
  hours: Array<{
    day_of_week: number;
    open_time: string | null;
    close_time: string | null;
    is_closed: boolean;
  }>
): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const adminSupabase = await createAdminClient();
  for (const h of hours) {
    const { error } = await adminSupabase.from("restaurant_hours").upsert(
      {
        restaurant_id: restaurantId,
        day_of_week: h.day_of_week,
        open_time: h.open_time,
        close_time: h.close_time,
        is_closed: h.is_closed,
      },
      { onConflict: "restaurant_id,day_of_week" }
    );

    if (error) {
      return { success: false, error: error.message };
    }
  }

  revalidatePath("/dashboard/settings");
  return { success: true };
}
