import { cookies } from "next/headers";
import { getEffectiveRestaurantIdFromCookies, getOwnerRestaurantBySupabaseId } from "./storeResolver";

export { getOwnerRestaurantBySupabaseId, getEffectiveRestaurantIdFromCookies };

export function getDatasetForUser(): string {
  return "production";
}

export async function getEffectiveDatasetFromCookies(): Promise<string> {
  return "production";
}

export async function getDatasetForRestaurantId(): Promise<string> {
  return "production";
}
