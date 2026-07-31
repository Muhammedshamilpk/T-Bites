import { GourmetHome } from "@/components/customer/gourmet-home";
import { getUserProfileName, createClient } from "@/lib/supabase/server";
import { getAllSanityRestaurants } from "@/lib/sanity/sanity-store.service";

export const revalidate = 0; // Disable static caching so newly added restaurants appear immediately

export default async function HomePage() {
  const userName = await getUserProfileName();
  const supabase = await createClient();

  // 1. Fetch Supabase DB restaurants
  const { data: dbRestaurants } = await supabase
    .from("restaurants")
    .select("*, food_items(food_images(storage_path))")
    .eq("approval_status", "approved")
    .order("name");

  // 2. Fetch Sanity CMS restaurants
  const sanityRestaurants = await getAllSanityRestaurants();

  const formattedDbRestaurants = (dbRestaurants || []).map((r: any) => {
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

  console.log(`[CUSTOMER APP HOMEPAGE LOG] Total Displayed Restaurants Count: ${allRestaurants.length}`);

  return <GourmetHome userName={userName} restaurants={allRestaurants as any} />;
}
