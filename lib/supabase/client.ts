import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";

/**
 * Browser-side Supabase client.
 * Used ONLY in Client Components for:
 *   - Realtime subscriptions (order status, notifications)
 *   - Auth state listeners
 *
 * Never use this for mutations — all writes go through Server Actions.
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

  return createBrowserClient<Database>(
    supabaseUrl,
    supabaseAnonKey
  );
}
