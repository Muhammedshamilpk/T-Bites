import { GourmetHome } from "@/components/customer/gourmet-home";
import { getUserProfileName, createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const userName = await getUserProfileName();
  const supabase = await createClient();

  const { data: restaurants } = await supabase
    .from("restaurants")
    .select("*, food_items(food_images(storage_path))")
    .eq("approval_status", "approved")
    .order("name");

  const formattedRestaurants = (restaurants || []).map((r: any) => {
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

  return <GourmetHome userName={userName} restaurants={formattedRestaurants as any} />;
}
