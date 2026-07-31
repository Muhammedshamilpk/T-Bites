"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Check, ShoppingCart, Star } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { FoodItemDetailModal } from "./food-item-detail-modal";

interface FoodItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  is_veg: boolean;
  is_available: boolean;
  preparation_time_minutes?: number | null;
  food_images?: Array<{ storage_path: string; is_primary?: boolean }>;
  category_name?: string | null;
}

interface Props {
  title: string;
  items: FoodItem[];
  restaurantId: string;
  restaurantName: string;
}

export function CustomerMenuSection({ title, items, restaurantId, restaurantName }: Props) {
  const { items: cartItems, addItem, getTotalPrice } = useCartStore();
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});

  const totalCartCount = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalPrice = getTotalPrice();

  const handleAddToCart = (e: React.MouseEvent, item: FoodItem) => {
    e.stopPropagation();
    addItem({
      food_item_id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      restaurant_id: restaurantId,
      restaurant_name: restaurantName,
      image_url: item.food_images?.[0]?.storage_path,
      is_veg: item.is_veg,
    });

    setAddedItemIds((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedItemIds((prev) => ({ ...prev, [item.id]: false }));
    }, 1500);
  };

  return (
    <div id={title.toLowerCase().replace(/\s+/g, "-")} className="space-y-6 pt-4">
      {/* Category Section Title */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-[#251912]">{title}</h2>
        <span className="text-xs font-bold text-[#584235]">{items.length} items</span>
      </div>

      {/* Menu Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => {
          const isAdded = addedItemIds[item.id];
          const imgUrl = item.food_images?.[0]?.storage_path;

          return (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="group bg-white rounded-3xl p-4 ambient-glow hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer border border-neutral-100 shadow-sm"
            >
              {/* Image & Badges */}
              <div className="relative w-full h-52 rounded-2xl overflow-hidden mb-4 bg-neutral-100">
                {imgUrl ? (
                  <img
                    src={imgUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl bg-orange-50 text-orange-400">
                    🍲
                  </div>
                )}

                <div className="absolute top-3 left-3 bg-[#ff7a00] text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md">
                  POPULAR
                </div>

                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md p-1.5 rounded-full flex items-center justify-center">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      item.is_veg ? "bg-emerald-600" : "bg-red-600"
                    }`}
                  />
                </div>
              </div>

              {/* Item Info */}
              <div className="flex-grow space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="text-base font-black text-[#251912] group-hover:text-[#994700] transition-colors">
                    {item.name}
                  </h3>
                  <span className="text-base font-black text-[#994700]">
                    ₹{item.price}
                  </span>
                </div>

                {item.description && (
                  <p className="text-xs text-[#584235] line-clamp-2 font-medium opacity-80">
                    {item.description}
                  </p>
                )}
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={(e) => handleAddToCart(e, item)}
                className={`mt-4 w-full py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98] ${
                  isAdded
                    ? "bg-emerald-600 text-white"
                    : "bg-[#251912] text-white hover:bg-[#994700]"
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4 animate-bounce" /> ADDED
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" /> ADD TO ORDER
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Floating Glassmorphic Cart Bar */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-xl z-50 transition-all duration-500 animate-in fade-in slide-in-from-bottom-6">
          <div className="bg-white/80 backdrop-blur-2xl rounded-full p-4 ambient-glow flex items-center justify-between border border-white/40 shadow-2xl">
            <div className="flex items-center gap-4 pl-4">
              <div className="bg-[#994700] text-white w-10 h-10 rounded-full flex items-center justify-center font-black text-sm">
                {totalCartCount}
              </div>
              <div>
                <p className="text-xs font-black text-[#251912]">
                  {totalCartCount} {totalCartCount > 1 ? "Items" : "Item"} Added
                </p>
                <p className="text-xs font-extrabold text-[#994700]">
                  ₹{totalPrice.toFixed(2)}
                </p>
              </div>
            </div>

            <Link
              href="/cart"
              className="bg-[#251912] text-white px-8 py-3 rounded-full font-black text-xs flex items-center gap-2 hover:bg-[#994700] transition-colors shadow-md"
            >
              VIEW CART <ShoppingCart className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Food Item Detail Modal */}
      {selectedItem && (
        <FoodItemDetailModal
          item={{
            ...selectedItem,
            food_images: (selectedItem.food_images || []).map((img) => ({
              storage_path: img.storage_path,
              is_primary: img.is_primary ?? false,
            })),
          }}
          restaurantId={restaurantId}
          restaurantName={restaurantName}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
