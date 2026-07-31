/**
 * FoodService — food category + food item CRUD, image upload, stock toggling.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { FoodItemInput, FoodCategoryInput } from "@/lib/validation/schemas";

type Client = SupabaseClient<Database>;

// ── Food Categories ─────────────────────────────────────────

export async function listCategories(supabase: Client, restaurantId: string) {
  const { data, error } = await supabase
    .from("food_categories")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("display_order");

  if (error) throw error;
  return data;
}

export async function createCategory(
  supabase: Client,
  restaurantId: string,
  input: FoodCategoryInput
) {
  const { data, error } = await supabase
    .from("food_categories")
    .insert({ restaurant_id: restaurantId, ...input })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCategory(
  supabase: Client,
  categoryId: string,
  input: Partial<FoodCategoryInput>
) {
  const { data, error } = await supabase
    .from("food_categories")
    .update(input)
    .eq("id", categoryId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCategory(supabase: Client, categoryId: string) {
  const { error } = await supabase
    .from("food_categories")
    .delete()
    .eq("id", categoryId);

  if (error) throw error;
}

// ── Food Items ──────────────────────────────────────────────

export async function listByRestaurant(supabase: Client, restaurantId: string) {
  const { data, error } = await supabase
    .from("food_items")
    .select("*, food_images(*), food_categories(name)")
    .eq("restaurant_id", restaurantId)
    .order("display_order");

  if (error) throw error;
  return data;
}

export async function getItem(supabase: Client, itemId: string) {
  const { data, error } = await supabase
    .from("food_items")
    .select("*, food_images(*), food_categories(name)")
    .eq("id", itemId)
    .single();

  if (error) throw error;
  return data;
}

export async function createItem(
  supabase: Client,
  restaurantId: string,
  input: FoodItemInput
) {
  const { data, error } = await supabase
    .from("food_items")
    .insert({ restaurant_id: restaurantId, ...input })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateItem(
  supabase: Client,
  itemId: string,
  input: Partial<FoodItemInput>
) {
  const { data, error } = await supabase
    .from("food_items")
    .update(input)
    .eq("id", itemId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteItem(supabase: Client, itemId: string) {
  const { error } = await supabase
    .from("food_items")
    .delete()
    .eq("id", itemId);

  if (error) throw error;
}

export async function toggleAvailability(
  supabase: Client,
  itemId: string,
  isAvailable: boolean
) {
  const { error } = await supabase
    .from("food_items")
    .update({ is_available: isAvailable })
    .eq("id", itemId);

  if (error) throw error;
}

// ── Food Images ─────────────────────────────────────────────

export async function uploadImage(
  supabase: Client,
  foodItemId: string,
  restaurantId: string,
  file: File,
  isPrimary = false
) {
  const ext = file.name.split(".").pop();
  const path = `${restaurantId}/${foodItemId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("food-images")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) throw uploadError;

  // If marking as primary, unmark existing primary first
  if (isPrimary) {
    await supabase
      .from("food_images")
      .update({ is_primary: false })
      .eq("food_item_id", foodItemId);
  }

  const { data, error } = await supabase
    .from("food_images")
    .insert({
      food_item_id: foodItemId,
      storage_path: path,
      is_primary: isPrimary,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
