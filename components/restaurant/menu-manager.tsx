"use client";

import { useState, useTransition } from "react";
import type { FoodCategory, FoodItem } from "@/types/domain.types";
import {
  toggleFoodAvailabilityAction,
  deleteFoodItemAction,
  deleteFoodCategoryAction,
} from "@/actions/food.actions";
import { FoodItemModal } from "@/components/restaurant/food-item-modal";
import { CategoryModal } from "@/components/restaurant/category-modal";
import {
  Plus,
  FolderPlus,
  Edit2,
  Trash2,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Props {
  restaurantId: string;
  categories: FoodCategory[];
  items: (FoodItem & { food_images?: Array<{ storage_path: string }> })[];
}

export function MenuManager({ restaurantId, categories, items }: Props) {
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<
    (FoodItem & { food_images?: Array<{ storage_path: string }> }) | null
  >(null);
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<FoodCategory | null>(null);

  const [isPending, startTransition] = useTransition();

  const filteredItems = selectedCatId
    ? items.filter((i) => i.food_category_id === selectedCatId)
    : items;

  const handleToggleAvailability = (foodItemId: string, currentVal: boolean) => {
    startTransition(async () => {
      const res = await toggleFoodAvailabilityAction(foodItemId, !currentVal);
      if (res.success) {
        toast.success(`Item availability set to ${!currentVal ? 'Available' : 'Unavailable'}`);
      } else {
        toast.error(res.error || "Failed to update availability");
      }
    });
  };

  const handleDeleteItem = (foodItemId: string) => {
    if (!confirm("Are you sure you want to delete this food item?")) return;
    startTransition(async () => {
      const res = await deleteFoodItemAction(foodItemId);
      if (res.success) {
        toast.success("Food item deleted successfully");
      } else {
        toast.error(res.error || "Failed to delete item");
      }
    });
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (
      !confirm(
        "Delete this category? Food items in this category will become uncategorized."
      )
    )
      return;
    startTransition(async () => {
      const res = await deleteFoodCategoryAction(categoryId);
      if (res.success) {
        toast.success("Category deleted successfully");
      } else {
        toast.error(res.error || "Failed to delete category");
      }
    });
  };

  return (
    <div>
      {/* Header controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Menu</h1>
          <p className="text-foreground-muted text-sm mt-1">
            Manage your food categories and menu items
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setEditingCat(null);
              setCatModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl border border-border bg-surface text-foreground font-semibold text-sm hover:bg-background transition-all flex items-center gap-2"
          >
            <FolderPlus className="w-4 h-4 text-primary" />
            Add Category
          </button>
          <button
            onClick={() => {
              setEditingItem(null);
              setItemModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm shadow-md shadow-primary/20 hover:bg-primary-dark transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>
      </div>

      {/* Categories Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
        <button
          onClick={() => setSelectedCatId(null)}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            selectedCatId === null
              ? "bg-primary text-white shadow-sm"
              : "bg-surface border border-border text-foreground-muted hover:border-primary hover:text-primary"
          }`}
        >
          All ({items.length})
        </button>

        {categories.map((cat) => {
          const count = items.filter(
            (i) => i.food_category_id === cat.id
          ).length;
          const isSelected = selectedCatId === cat.id;

          return (
            <div key={cat.id} className="relative group shrink-0 flex items-center">
              <button
                onClick={() => setSelectedCatId(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  isSelected
                    ? "bg-primary text-white shadow-sm"
                    : "bg-surface border border-border text-foreground-muted hover:border-primary hover:text-primary"
                }`}
              >
                {cat.name} ({count})
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteCategory(cat.id);
                }}
                className="ml-1 opacity-0 group-hover:opacity-100 p-1 text-foreground-muted hover:text-error transition-opacity"
                title="Delete category"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Items list */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-border bg-background">
          <div className="text-5xl mb-3">🍳</div>
          <h2 className="text-lg font-semibold text-foreground mb-1">
            No items found
          </h2>
          <p className="text-foreground-muted text-sm mb-4">
            {selectedCatId
              ? "No items in this category yet."
              : "Click 'Add Item' to start building your menu"}
          </p>
          <button
            onClick={() => {
              setEditingItem(null);
              setItemModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm shadow-md shadow-primary/20 hover:bg-primary-dark transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Item Now
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filteredItems.map((item) => {
            const photoUrl = item.food_images?.[0]?.storage_path;
            return (
              <div
                key={item.id}
                className="p-4 rounded-2xl border border-border bg-background hover:border-primary/30 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-3.5 mb-3">
                    {/* Food Photo Thumbnail */}
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-2xl border border-border shrink-0 shadow-2xs"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-surface border border-border flex items-center justify-center text-2xl shrink-0">
                        🍔
                      </div>
                    )}

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span
                            className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center text-[8px] font-bold shrink-0 ${
                              item.is_veg
                                ? "border-success text-success"
                                : "border-error text-error"
                            }`}
                          >
                            ●
                          </span>
                          <h3 className="font-bold text-foreground text-base truncate">
                            {item.name}
                          </h3>
                        </div>
                        <span className="font-extrabold text-foreground text-base shrink-0">
                          ₹{item.price}
                        </span>
                      </div>

                      {item.description ? (
                        <p className="text-xs text-foreground-muted line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      ) : (
                        <p className="text-xs text-foreground-muted/50 italic">
                          No description provided
                        </p>
                      )}
                    </div>
                  </div>
                </div>

              {/* Controls */}
              <div className="flex items-center justify-between pt-3 border-t border-border mt-3">
                {/* Stock availability toggle */}
                <button
                  disabled={isPending}
                  onClick={() =>
                    handleToggleAvailability(item.id, item.is_available)
                  }
                  className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    item.is_available
                      ? "bg-success/10 text-success hover:bg-success/20"
                      : "bg-foreground-muted/10 text-foreground-muted hover:bg-foreground-muted/20"
                  }`}
                >
                  {item.is_available ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" /> In Stock
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5" /> Out of Stock
                    </>
                  )}
                </button>

                {/* Edit / Delete */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingItem(item);
                      setItemModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-foreground-muted hover:text-primary hover:bg-surface transition-colors"
                    title="Edit item"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1.5 rounded-lg text-foreground-muted hover:text-error hover:bg-error/5 transition-colors"
                    title="Delete item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Modals */}
      {itemModalOpen && (
        <FoodItemModal
          restaurantId={restaurantId}
          categories={categories}
          foodItem={editingItem}
          onClose={() => setItemModalOpen(false)}
        />
      )}

      {catModalOpen && (
        <CategoryModal
          restaurantId={restaurantId}
          category={editingCat}
          onClose={() => setCatModalOpen(false)}
        />
      )}
    </div>
  );
}
