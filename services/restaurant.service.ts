/**
 * RestaurantService — restaurant CRUD, discovery queries, timing/status management.
 *
 * All functions accept a Supabase server client (dependency injection).
 * They never instantiate their own client — RLS is the enforcement layer.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

type Client = SupabaseClient<Database>;

/** List all approved restaurants (for customer discovery). */
export async function listApproved(supabase: Client) {
  const { data, error } = await supabase
    .from("restaurants")
    .select("*, restaurant_categories(category_id, categories(*))")
    .eq("approval_status", "approved")
    .order("name");

  if (error) throw error;
  return data;
}

/** Get a single restaurant by ID. */
export async function getById(supabase: Client, id: string) {
  const { data, error } = await supabase
    .from("restaurants")
    .select("*, restaurant_hours(*), restaurant_categories(category_id, categories(*))")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

/** Search restaurants by name. */
export async function search(supabase: Client, query: string) {
  const { data, error } = await supabase
    .from("restaurants")
    .select("*, restaurant_categories(category_id, categories(*))")
    .eq("approval_status", "approved")
    .ilike("name", `%${query}%`)
    .order("name");

  if (error) throw error;
  return data;
}

/** Get restaurants by category. */
export async function listByCategory(supabase: Client, categorySlug: string) {
  const { data, error } = await supabase
    .from("restaurants")
    .select("*, restaurant_categories!inner(category_id, categories!inner(*))")
    .eq("approval_status", "approved")
    .eq("restaurant_categories.categories.slug", categorySlug)
    .order("name");

  if (error) throw error;
  return data;
}

/** Update restaurant status (open/closed/holiday). */
export async function updateStatus(
  supabase: Client,
  restaurantId: string,
  status: Database["public"]["Enums"]["restaurant_status"]
) {
  const { error } = await supabase
    .from("restaurants")
    .update({ status })
    .eq("id", restaurantId);

  if (error) throw error;
}

/** Get the restaurant owned by the current user. */
export async function getOwnRestaurant(supabase: Client) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("restaurants")
    .select("*, restaurant_hours(*)")
    .eq("owner_id", user.id)
    .single();

  if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows
  return data;
}
