import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database.types";

/**
 * Server-side Supabase client for use in:
 *   - React Server Components (data fetching)
 *   - Server Actions (mutations)
 *   - Route Handlers
 *
 * This client uses the current user's session (via cookies),
 * so all queries are subject to RLS policies.
 */
export async function createClient() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignored in Server Components
          }
        },
      },
    }
  );
}

/**
 * Server-side Supabase client with SERVICE_ROLE key.
 * ONLY used in AdminService for cross-tenant operations.
 * Bypasses RLS — use with extreme caution.
 */
export async function createAdminClient() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-service-role-key";

  return createServerClient<Database>(
    supabaseUrl,
    serviceKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignored in Server Components
          }
        },
      },
    }
  );
}

/**
 * Get current user seamlessly (supports both Supabase Auth session and fallback demo cookie).
 */
export async function getCurrentUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) return user;
  } catch {
    // Ignore Supabase auth error
  }

  const cookieStore = await cookies();
  const demoCookie = cookieStore.get("tbites_demo_user")?.value;
  if (demoCookie) {
    try {
      const demoUser = JSON.parse(demoCookie);
      return {
        id: demoUser.id,
        email: demoUser.email || "demo@example.com",
        user_metadata: {
          full_name: demoUser.full_name || "User",
          role: demoUser.role || "customer",
        },
      };
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Fetch the exact profile full_name from Supabase Auth or profiles table.
 * Returns empty string if no user is currently authenticated.
 */
export async function getUserProfileName(): Promise<string> {
  const user = await getCurrentUser();
  if (!user) return "";

  if (user.user_metadata?.full_name) {
    return user.user_metadata.full_name;
  }

  try {
    const adminSupabase = await createAdminClient();
    if (user.id) {
      const { data: profile } = await adminSupabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();
      if (profile?.full_name) return profile.full_name;
    }
  } catch {
    // Ignore
  }

  return user.email?.split("@")[0] || "User";
}
