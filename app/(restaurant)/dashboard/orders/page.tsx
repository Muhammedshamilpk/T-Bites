import { getCurrentUser } from "@/lib/supabase/server";
import { getSanityOrders } from "@/lib/sanity/sanity-store.service";
import { SanityOrdersManager } from "@/components/sanity/sanity-orders-manager";

export default async function DashboardOrdersPage() {
  // Supabase is used strictly for User Authentication
  const user = await getCurrentUser();

  // All order data is read 100% directly from Sanity CMS Lake
  const sanityOrders = await getSanityOrders();

  return (
    <div className="space-y-6">
      <SanityOrdersManager initialOrders={sanityOrders} />
    </div>
  );
}
