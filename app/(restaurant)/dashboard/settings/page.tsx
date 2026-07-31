import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { RestaurantSettingsForm } from "@/components/restaurant/settings-form";
import { RestaurantStatusToggle } from "@/components/restaurant/status-toggle";
import type { RestaurantStatus } from "@/types/database.types";

export default async function DashboardSettingsPage() {
  const user = await getCurrentUser();
  const supabase = await createClient();

  let restaurant: any = null;
  if (user) {
    const { data } = await supabase
      .from("restaurants")
      .select("*")
      .eq("owner_id", user.id)
      .maybeSingle();
    restaurant = data;
  }

  if (!restaurant) {
    const { data: firstStore } = await supabase
      .from("restaurants")
      .select("*")
      .limit(1)
      .maybeSingle();
    restaurant = firstStore;
  }

  if (!restaurant) {
    return (
      <div className="max-w-xl py-12 text-center space-y-4">
        <div className="text-5xl">🏪</div>
        <h1 className="text-2xl font-bold text-foreground">No Registered Restaurant Found</h1>
        <p className="text-foreground-muted text-sm">
          You haven't completed your restaurant registration yet. Please contact Main Admin to list your restaurant.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h1 className="text-3xl font-black text-[#251912]">
            Restaurant Settings
          </h1>
          <p className="text-xs font-semibold text-[#584235] mt-1">
            View and update your registered restaurant profile, operating hours, and kitchen notifications.
          </p>
        </div>

        <RestaurantStatusToggle
          restaurantId={restaurant.id}
          currentStatus={restaurant.status as RestaurantStatus}
        />
      </div>

      <RestaurantSettingsForm restaurant={restaurant} />
    </div>
  );
}
