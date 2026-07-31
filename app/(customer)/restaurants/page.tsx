import { createClient } from "@/lib/supabase/server";
import { RestaurantCatalogClient } from "@/components/customer/restaurant-catalog-client";

export default async function RestaurantsPage() {
  const supabase = await createClient();

  const { data: rawRestaurants } = await supabase
    .from("restaurants")
    .select("*, restaurant_categories(category_id, categories(*)), food_items(food_images(storage_path))")
    .eq("approval_status", "approved")
    .order("name");

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  // Fallback: If banner_url is not set, use the picture of the first food item as the cover photo
  const formattedRestaurants = (rawRestaurants || []).map((r: any) => {
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
      banner_url: r.banner_url || firstFoodImage,
    };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <RestaurantCatalogClient
        restaurants={formattedRestaurants}
        categories={(categories || []) as any}
      />
    </div>
  );
}
