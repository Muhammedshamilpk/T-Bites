/**
 * NotificationService — notification creation, read-state, and subscription helpers.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, NotificationType } from "@/types/database.types";

type Client = SupabaseClient<Database>;

/** Create a notification for a user. */
export async function create(
  supabase: Client,
  recipientId: string,
  type: NotificationType,
  title: string,
  body: string,
  relatedOrderId?: string
) {
  const { error } = await supabase.from("notifications").insert({
    recipient_id: recipientId,
    type,
    title,
    body,
    related_order_id: relatedOrderId || null,
  });

  if (error) throw error;
}

/** Mark a notification as read. */
export async function markRead(supabase: Client, notificationId: string) {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId);

  if (error) throw error;
}

/** Mark all notifications as read for the current user. */
export async function markAllRead(supabase: Client) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("recipient_id", user.id)
    .eq("is_read", false);

  if (error) throw error;
}

/** List unread notifications for the current user. */
export async function listUnread(supabase: Client) {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("is_read", false)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw error;
  return data;
}

/** List all notifications (paginated). */
export async function listAll(supabase: Client, limit = 50, offset = 0) {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data;
}

/** Get unread count. */
export async function getUnreadCount(supabase: Client) {
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("is_read", false);

  if (error) throw error;
  return count ?? 0;
}
