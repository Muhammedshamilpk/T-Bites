import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CustomerMenuSection } from "@/components/customer/customer-menu-section";
import { OffersCarousel } from "@/components/customer/offers-carousel";
import { MapPin, Phone, Clock, Star, ArrowLeft } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function RestaurantDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch restaurant
  const { data: restaurant, error } = await supabase
    .from("restaurants")
    .select("*, restaurant_hours(*), restaurant_categories(category_id, categories(*))")
    .eq("id", id)
    .single();

  if (error || !restaurant) {
    notFound();
  }

  // Fetch food categories + items
  const { data: foodCategories } = await supabase
    .from("food_categories")
    .select("*")
    .eq("restaurant_id", id)
    .order("display_order");

  const { data: foodItems } = await supabase
    .from("food_items")
    .select("*, food_images(*), food_categories(name)")
    .eq("restaurant_id", id)
    .eq("is_available", true)
    .order("display_order");

  // Extract food image URLs for the offers slider
  const foodImageUrls = (foodItems || [])
    .flatMap((item) => (item.food_images as Array<{ storage_path: string }> | null) || [])
    .map((img) => img.storage_path)
    .filter(Boolean);

  // Group food items by category
  const formattedItems = (foodItems || []).map((item) => ({
    ...item,
    category_name: (item.food_categories as { name: string } | null)?.name || null,
  }));

  const itemsByCategory = new Map<string | null, typeof formattedItems>();
  formattedItems.forEach((item) => {
    const catId = item.food_category_id;
    if (!itemsByCategory.has(catId)) {
      itemsByCategory.set(catId, []);
    }
    itemsByCategory.get(catId)!.push(item);
  });

  // Cover photo fallback: Use banner_url or first food item photo
  const coverPhoto = restaurant.banner_url || foodImageUrls[0] || null;

  return (
    <div className="space-y-6 pb-16">
      {/* Modern Integrated Restaurant Hero Header */}
      <div className="relative bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white overflow-hidden shadow-2xl">
        {coverPhoto ? (
          <img
            src={coverPhoto}
            alt={restaurant.name}
            className="absolute inset-0 w-full h-full object-cover opacity-40 scale-105 pointer-events-none"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 via-orange-500/10 to-amber-500/20 pointer-events-none" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-neutral-950/60 to-black/40" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-8">
          {/* Back Arrow Button */}
          <Link
            href="/restaurants"
            className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs font-bold transition-all duration-200 hover:scale-[1.02] shadow-lg"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {restaurant.logo_url ? (
              <img
                src={restaurant.logo_url}
                alt=""
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-white/20 shadow-2xl shrink-0"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-primary/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-4xl shrink-0 shadow-2xl">
                🏪
              </div>
            )}

            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3.5 flex-wrap">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
                  {restaurant.name}
                </h1>
                <span
                  className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold backdrop-blur-md border shadow-lg flex items-center gap-1.5 ${
                    restaurant.status === "open"
                      ? "bg-emerald-500/90 text-white border-emerald-400/30"
                      : "bg-neutral-800/90 text-neutral-300 border-neutral-700/50"
                  }`}
                >
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      restaurant.status === "open" ? "bg-white animate-pulse" : "bg-neutral-500"
                    }`}
                  />
                  {restaurant.status === "open" ? "Open Now" : "Closed"}
                </span>
              </div>

              {/* Description & Badges */}
              {restaurant.description ? (
                <p className="text-sm sm:text-base text-neutral-200 max-w-2xl leading-relaxed font-medium drop-shadow-sm">
                  {restaurant.description}
                </p>
              ) : (
                <div className="flex items-center gap-3 text-xs font-bold text-white flex-wrap">
                  <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/20">
                    <Star className="w-3.5 h-3.5 fill-red-500 text-red-500" /> 4.8 Top Rated Kitchen
                  </span>
                  <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/20">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" /> 25-35 Min Delivery
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Interactive Offers & Food Photo Slider Banner */}
        <OffersCarousel
          restaurantName={restaurant.name}
          foodPhotos={foodImageUrls}
        />

        {/* Menu */}
        <h2 className="text-2xl font-bold text-foreground mb-6">Menu</h2>

        {!foodItems || foodItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">📋</div>
            <p className="text-foreground-muted">
              This restaurant hasn&apos;t added any menu items yet.
            </p>
          </div>
        ) : (
          <div className="space-y-10 pb-12">
            {/* Uncategorized items */}
            {itemsByCategory.has(null) && (
              <CustomerMenuSection
                title="Menu Items"
                items={itemsByCategory.get(null)!}
                restaurantId={restaurant.id}
                restaurantName={restaurant.name}
              />
            )}

            {/* Categorized items */}
            {foodCategories?.map((cat) => {
              const items = itemsByCategory.get(cat.id);
              if (!items || items.length === 0) return null;
              return (
                <CustomerMenuSection
                  key={cat.id}
                  title={cat.name}
                  items={items}
                  restaurantId={restaurant.id}
                  restaurantName={restaurant.name}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
