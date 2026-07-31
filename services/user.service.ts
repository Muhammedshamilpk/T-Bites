/**
 * UserService — profile management and role lookups.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

type Client = SupabaseClient<Database>;

/** Get the current user's profile. */
export async function getProfile(supabase: Client) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) throw error;
  return data;
}

/** Update the current user's profile. */
export async function updateProfile(
  supabase: Client,
  updates: { full_name?: string; phone?: string; avatar_url?: string }
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Get the current user's role. */
export async function getRole(supabase: Client) {
  const profile = await getProfile(supabase);
  return profile?.role ?? null;
}

/** Get a profile by ID (for admin or display purposes). */
export async function getProfileById(supabase: Client, userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
}
