import { createClient } from "@/lib/supabase/server";
import { RestaurantCatalogClient } from "@/components/customer/restaurant-catalog-client";
import { getAllSanityRestaurants } from "@/lib/sanity/sanity-store.service";

export const revalidate = 0; // Disable static cache for instant visibility updates

export default async function RestaurantsPage() {
  const supabase = await createClient();

  // 1. Fetch Supabase DB restaurants
  const { data: rawRestaurants } = await supabase
    .from("restaurants")
    .select("*, restaurant_categories(category_id, categories(*)), food_items(food_images(storage_path))")
    .eq("approval_status", "approved")
    .order("name");

  // 2. Fetch Sanity CMS restaurants
  const sanityRestaurants = await getAllSanityRestaurants();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  const formattedDbRestaurants = (rawRestaurants || []).map((r: any) => {
    let firstFoodImage: string | null = null;
    if (r.food_items && r.food_items.length > 0) {
      for (const item of r.food_items) {
        if (item.food_images && item.food_images.length > 0) {
          firstFoodImage = item.food_images[0]?.storage_path || null;
          if (firstFoodImage) break;
        }
      }
    }
    return {
      ...r,
      banner_url: r.banner_url || firstFoodImage || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
    };
  });

  // Deduplicate restaurants by name
  const map = new Map<string, any>();
  [...sanityRestaurants, ...formattedDbRestaurants].forEach((r) => {
    if (r && r.name && !map.has(r.name.toLowerCase())) {
      map.set(r.name.toLowerCase(), r);
    }
  });

  const allRestaurants = Array.from(map.values());

  console.log(`[CUSTOMER APP RESTAURANTS CATALOG LOG] Total Displayed Restaurants Count: ${allRestaurants.length}`);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <RestaurantCatalogClient
        restaurants={allRestaurants}
        categories={(categories || []) as any}
      />
    </div>
  );
}
