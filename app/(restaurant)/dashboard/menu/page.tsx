import { getSanityMenuItems } from "@/lib/sanity/sanity-store.service";
import { getEffectiveRestaurantIdFromCookies } from "@/lib/sanity/storeResolver";
import { SanityMenuManager } from "@/components/sanity/sanity-menu-manager";

export const revalidate = 0; // Disable caching so menu edits update live

export default async function DashboardMenuPage() {
  const restaurantId = await getEffectiveRestaurantIdFromCookies();
  const sanityMenuItems = await getSanityMenuItems(restaurantId || undefined);

  return <SanityMenuManager initialItems={sanityMenuItems} restaurantId={restaurantId || undefined} />;
}
