import { getSanityOrders } from "@/lib/sanity/sanity-store.service";
import { getEffectiveRestaurantIdFromCookies } from "@/lib/sanity/storeResolver";
import { SanityOrdersManager } from "@/components/sanity/sanity-orders-manager";

export const revalidate = 0; // Disable static caching for live kitchen orders

export default async function DashboardOrdersPage() {
  const restaurantId = await getEffectiveRestaurantIdFromCookies();
  const sanityOrders = await getSanityOrders(restaurantId || undefined);

  return (
    <div className="space-y-6">
      <SanityOrdersManager initialOrders={sanityOrders} />
    </div>
  );
}
