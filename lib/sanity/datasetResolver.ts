import { cookies } from "next/headers";
import { sanityFetch, defaultDataset } from "./client";

export interface UserSessionPayload {
  id: string;
  role: string;
  datasetName?: string;
  restaurantId?: string;
  email?: string;
}

/**
 * Resolves the dataset name for a given user payload.
 * - Super Admin / Admin: 'production'
 * - Restaurant Owner: Assigned dataset (e.g., 'restaurant_a')
 */
export function getDatasetForUser(user: UserSessionPayload | null | undefined): string {
  if (!user) return defaultDataset;
  if (user.role === "admin" || user.role === "superadmin") {
    return defaultDataset; // Super admin uses production
  }
  if (user.role === "restaurant_owner" && user.datasetName) {
    return user.datasetName;
  }
  return defaultDataset;
}

/**
 * Server-side helper to extract the active dataset name from cookies.
 * Reads 'tbites_demo_user' or 'tbites_dataset'.
 */
export async function getEffectiveDatasetFromCookies(): Promise<string> {
  try {
    const cookieStore = await cookies();
    const explicitDataset = cookieStore.get("tbites_dataset")?.value;
    if (explicitDataset && explicitDataset.trim().length > 0) {
      return explicitDataset.trim();
    }

    const demoUserCookie = cookieStore.get("tbites_demo_user")?.value;
    if (demoUserCookie) {
      const parsed: UserSessionPayload = JSON.parse(demoUserCookie);
      return getDatasetForUser(parsed);
    }
  } catch {
    // Fallback to default production dataset
  }
  return defaultDataset;
}

/**
 * Looks up the assigned dataset name for a specific restaurant ID from the Super Admin production dataset.
 */
export async function getDatasetForRestaurantId(restaurantId: string): Promise<string> {
  if (!restaurantId) return defaultDataset;

  const query = `*[_type == "restaurant" && (_id == $restaurantId || slug.current == $restaurantId)][0].datasetName`;
  const assignedDataset = await sanityFetch<string | null>({
    query,
    params: { restaurantId },
    fallback: null,
    datasetName: defaultDataset,
  });

  return assignedDataset || defaultDataset;
}
