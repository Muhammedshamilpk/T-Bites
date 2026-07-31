/**
 * AdminService — restaurant approval, user management, platform settings, and audit logging.
 * Uses elevated (service-role) queries only for cross-tenant reads.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, ApprovalStatus, Json } from "@/types/database.types";

type Client = SupabaseClient<Database>;

// ── Restaurant Management ───────────────────────────────────

/** List all restaurants with optional status filter. */
export async function listRestaurants(
  supabase: Client,
  statusFilter?: ApprovalStatus
) {
  let query = supabase
    .from("restaurants")
    .select("*, owner:profiles!restaurants_owner_id_fkey(full_name, phone, email:id)")
    .order("created_at", { ascending: false });

  if (statusFilter) {
    query = query.eq("approval_status", statusFilter);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/** Approve a restaurant. */
export async function approveRestaurant(
  supabase: Client,
  restaurantId: string,
  actorId: string
) {
  const { error } = await supabase
    .from("restaurants")
    .update({ approval_status: "approved" })
    .eq("id", restaurantId);

  if (error) throw error;

  await logAudit(supabase, actorId, "restaurant.approved", "restaurant", restaurantId);
}

/** Suspend a restaurant. */
export async function suspendRestaurant(
  supabase: Client,
  restaurantId: string,
  actorId: string
) {
  const { error } = await supabase
    .from("restaurants")
    .update({ approval_status: "suspended" })
    .eq("id", restaurantId);

  if (error) throw error;

  await logAudit(supabase, actorId, "restaurant.suspended", "restaurant", restaurantId);
}

/** Reject a restaurant. */
export async function rejectRestaurant(
  supabase: Client,
  restaurantId: string,
  actorId: string
) {
  const { error } = await supabase
    .from("restaurants")
    .update({ approval_status: "rejected" })
    .eq("id", restaurantId);

  if (error) throw error;

  await logAudit(supabase, actorId, "restaurant.rejected", "restaurant", restaurantId);
}

// ── User Management ─────────────────────────────────────────

/** List all users. */
export async function listUsers(supabase: Client) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

/** Deactivate a user. */
export async function deactivateUser(
  supabase: Client,
  userId: string,
  actorId: string
) {
  const { error } = await supabase
    .from("profiles")
    .update({ is_active: false })
    .eq("id", userId);

  if (error) throw error;

  await logAudit(supabase, actorId, "user.deactivated", "user", userId);
}

/** Reactivate a user. */
export async function reactivateUser(
  supabase: Client,
  userId: string,
  actorId: string
) {
  const { error } = await supabase
    .from("profiles")
    .update({ is_active: true })
    .eq("id", userId);

  if (error) throw error;

  await logAudit(supabase, actorId, "user.reactivated", "user", userId);
}

// ── Platform Settings ───────────────────────────────────────

/** Get a setting by key. */
export async function getSetting(supabase: Client, key: string) {
  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .eq("key", key)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
}

/** Update a setting. */
export async function updateSetting(
  supabase: Client,
  key: string,
  value: unknown,
  actorId: string
) {
  const { error } = await supabase.from("settings").upsert({
    key,
    value: value as Database["public"]["Tables"]["settings"]["Row"]["value"],
    updated_by: actorId,
  });

  if (error) throw error;
}

// ── Platform Stats ──────────────────────────────────────────

/** Get platform-wide dashboard stats. */
export async function getPlatformStats(supabase: Client) {
  const [restaurants, pendingRestaurants, todayOrders, users] = await Promise.all([
    supabase.from("restaurants").select("*", { count: "exact", head: true }),
    supabase
      .from("restaurants")
      .select("*", { count: "exact", head: true })
      .eq("approval_status", "pending"),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .gte("placed_at", new Date().toISOString().split("T")[0]),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
  ]);

  return {
    totalRestaurants: restaurants.count ?? 0,
    pendingApprovals: pendingRestaurants.count ?? 0,
    todayOrders: todayOrders.count ?? 0,
    totalUsers: users.count ?? 0,
  };
}

// ── Audit Logging ───────────────────────────────────────────

/** Log an admin/system action. */
export async function logAudit(
  supabase: Client,
  actorId: string,
  action: string,
  entityType: string,
  entityId: string,
  metadata?: Record<string, Json | undefined>
) {
  const { error } = await supabase.from("audit_logs").insert({
    actor_id: actorId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    metadata: (metadata as Json) ?? null,
  });

  if (error) {
    // Don't throw on audit failures — log to console, don't block operations
    console.error("Audit log failed:", error);
  }
}
