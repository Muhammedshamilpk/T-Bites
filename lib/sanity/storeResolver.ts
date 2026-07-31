import { cookies } from "next/headers";
import { sanityFetch } from "./client";

export interface OwnerRestaurantInfo {
  ownerId: string;
  email: string;
  role: string;
  restaurantId: string | null;
  restaurantName: string | null;
  restaurantStatus: string | null;
}

/**
 * Resolves assigned restaurant document reference from Sanity for a given Supabase User ID.
 */
export async function getOwnerRestaurantBySupabaseId(supabaseUserId: string): Promise<OwnerRestaurantInfo | null> {
  if (!supabaseUserId) return null;

  const query = `*[_type == "restaurantOwner" && (supabaseUserId == $supabaseUserId || _id == $supabaseUserId)][0] {
    _id,
    email,
    role,
    "restaurantId": restaurant._ref,
    "restaurantName": restaurant->name,
    "restaurantStatus": restaurant->status
  }`;

  const res = await sanityFetch<any>({
    query,
    params: { supabaseUserId },
    fallback: null,
  });

  if (!res) return null;

  return {
    ownerId: res._id,
    email: res.email,
    role: res.role || "restaurant_owner",
    restaurantId: res.restaurantId || null,
    restaurantName: res.restaurantName || null,
    restaurantStatus: res.restaurantStatus || "active",
  };
}

/**
 * Extracts active restaurant ID from session cookies for server components.
 */
export async function getEffectiveRestaurantIdFromCookies(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const demoUserCookie = cookieStore.get("tbites_demo_user")?.value;
    if (demoUserCookie) {
      const parsed = JSON.parse(demoUserCookie);
      return parsed.restaurantId || null;
    }
  } catch {
    // Fallback
  }
  return null;
}
