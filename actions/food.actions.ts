"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient, getCurrentUser } from "@/lib/supabase/server";
import {
  foodCategorySchema,
  foodItemSchema,
} from "@/lib/validation/schemas";
import type { ActionResult } from "@/types/domain.types";

export type FoodFormState = {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
} | undefined;

/** Create a new food category for a restaurant. */
export async function createFoodCategoryAction(
  restaurantId: string,
  _prevState: FoodFormState,
  formData: FormData
): Promise<FoodFormState> {
  const user = await getCurrentUser();
  if (!user) return { message: "Unauthorized" };

  const raw = {
    name: formData.get("name") as string,
    display_order: Number(formData.get("display_order") || 0),
  };

  const result = foodCategorySchema.safeParse(raw);
  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors as Record<string, string[]>,
      message: "Please fix the category errors below.",
    };
  }

  const adminSupabase = await createAdminClient();
  const { error } = await adminSupabase.from("food_categories").insert({
    restaurant_id: restaurantId,
    name: result.data.name,
    display_order: result.data.display_order ?? 0,
  });

  if (error) return { message: error.message };

  revalidatePath("/dashboard/menu");
  revalidatePath("/restaurants");
  return { success: true, message: "Food category added successfully!" };
}

/** Update an existing food category. */
export async function updateFoodCategoryAction(
  categoryId: string,
  _prevState: FoodFormState,
  formData: FormData
): Promise<FoodFormState> {
  const user = await getCurrentUser();
  if (!user) return { message: "Unauthorized" };

  const raw = {
    name: formData.get("name") as string,
    display_order: Number(formData.get("display_order") || 0),
  };

  const result = foodCategorySchema.safeParse(raw);
  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors as Record<string, string[]>,
      message: "Please fix the category errors below.",
    };
  }

  const adminSupabase = await createAdminClient();
  const { error } = await adminSupabase
    .from("food_categories")
    .update({
      name: result.data.name,
      display_order: result.data.display_order ?? 0,
    })
    .eq("id", categoryId);

  if (error) return { message: error.message };

  revalidatePath("/dashboard/menu");
  revalidatePath("/restaurants");
  return { success: true, message: "Category updated!" };
}

/** Delete a food category. */
export async function deleteFoodCategoryAction(
  categoryId: string
): Promise<ActionResult> {
  const adminSupabase = await createAdminClient();
  const { error } = await adminSupabase
    .from("food_categories")
    .delete()
    .eq("id", categoryId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/menu");
  revalidatePath("/restaurants");
  return { success: true };
}

/** Create a new food item. */
export async function createFoodItemAction(
  restaurantId: string,
  _prevState: FoodFormState,
  formData: FormData
): Promise<FoodFormState> {
  const user = await getCurrentUser();
  if (!user) return { message: "Unauthorized" };

  const foodCatId = formData.get("food_category_id") as string;
  const imageUrl = (formData.get("image_url") as string)?.trim();

  const raw = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
    price: Number(formData.get("price")),
    is_veg: formData.get("is_veg") === "true",
    is_available: formData.get("is_available") === "true",
    display_order: Number(formData.get("display_order") || 0),
  };

  const result = foodItemSchema.safeParse(raw);
  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors as Record<string, string[]>,
      message: "Please fix the food item errors below.",
    };
  }

  const adminSupabase = await createAdminClient();
  const { data: newItem, error } = await adminSupabase
    .from("food_items")
    .insert({
      restaurant_id: restaurantId,
      food_category_id: foodCatId || null,
      name: result.data.name,
      description: result.data.description || null,
      price: result.data.price,
      is_veg: result.data.is_veg ?? true,
      is_available: result.data.is_available ?? true,
      display_order: result.data.display_order ?? 0,
    })
    .select("id")
    .single();

  if (error) return { message: error.message };

  if (imageUrl && newItem?.id) {
    await adminSupabase.from("food_images").insert({
      food_item_id: newItem.id,
      storage_path: imageUrl,
      is_primary: true,
    });
  }

  revalidatePath("/dashboard/menu");
  revalidatePath("/restaurants");
  return { success: true, message: "Food item created successfully!" };
}

/** Update an existing food item. */
export async function updateFoodItemAction(
  foodItemId: string,
  _prevState: FoodFormState,
  formData: FormData
): Promise<FoodFormState> {
  const user = await getCurrentUser();
  if (!user) return { message: "Unauthorized" };

  const foodCatId = formData.get("food_category_id") as string;
  const imageUrl = (formData.get("image_url") as string)?.trim();

  const raw = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
    price: Number(formData.get("price")),
    is_veg: formData.get("is_veg") === "true",
    is_available: formData.get("is_available") === "true",
    display_order: Number(formData.get("display_order") || 0),
  };

  const result = foodItemSchema.safeParse(raw);
  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors as Record<string, string[]>,
      message: "Please fix the food item errors below.",
    };
  }

  const adminSupabase = await createAdminClient();
  const { error } = await adminSupabase
    .from("food_items")
    .update({
      food_category_id: foodCatId || null,
      name: result.data.name,
      description: result.data.description || null,
      price: result.data.price,
      is_veg: result.data.is_veg,
      is_available: result.data.is_available,
      display_order: result.data.display_order,
    })
    .eq("id", foodItemId);

  if (error) return { message: error.message };

  if (imageUrl !== undefined) {
    await adminSupabase
      .from("food_images")
      .delete()
      .eq("food_item_id", foodItemId);

    if (imageUrl) {
      await adminSupabase.from("food_images").insert({
        food_item_id: foodItemId,
        storage_path: imageUrl,
        is_primary: true,
      });
    }
  }

  revalidatePath("/dashboard/menu");
  revalidatePath("/restaurants");
  return { success: true, message: "Food item updated successfully!" };
}

/** Toggle stock availability of a food item. */
export async function toggleFoodAvailabilityAction(
  foodItemId: string,
  isAvailable: boolean
): Promise<ActionResult> {
  const adminSupabase = await createAdminClient();

  const { error } = await adminSupabase
    .from("food_items")
    .update({ is_available: isAvailable })
    .eq("id", foodItemId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/menu");
  revalidatePath("/restaurants");
  return { success: true };
}

/** Delete a food item. */
export async function deleteFoodItemAction(
  foodItemId: string
): Promise<ActionResult> {
  const adminSupabase = await createAdminClient();

  const { error } = await adminSupabase
    .from("food_items")
    .delete()
    .eq("id", foodItemId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/menu");
  revalidatePath("/restaurants");
  return { success: true };
}
