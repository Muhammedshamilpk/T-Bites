"use client";

import { useActionState, useState } from "react";
import {
  createFoodItemAction,
  updateFoodItemAction,
} from "@/actions/food.actions";
import type { FoodFormState } from "@/actions/food.actions";
import type { FoodCategory, FoodItem } from "@/types/domain.types";
import {
  X,
  Loader2,
  Plus,
  Edit2,
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
  Trash2,
} from "lucide-react";

interface Props {
  restaurantId: string;
  categories: FoodCategory[];
  foodItem?: (FoodItem & { food_images?: Array<{ storage_path: string }> }) | null;
  onClose: () => void;
}

export function FoodItemModal({
  restaurantId,
  categories,
  foodItem,
  onClose,
}: Props) {
  const isEditing = !!foodItem;
  const actionFn = isEditing
    ? updateFoodItemAction.bind(null, foodItem.id)
    : createFoodItemAction.bind(null, restaurantId);

  const [state, action, pending] = useActionState<FoodFormState, FormData>(
    actionFn,
    undefined
  );

  const [isVeg, setIsVeg] = useState(foodItem ? foodItem.is_veg : true);
  const [isAvailable, setIsAvailable] = useState(
    foodItem ? foodItem.is_available : true
  );

  const initialImageUrl = foodItem?.food_images?.[0]?.storage_path || "";
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const [mode, setMode] = useState<"upload" | "url">("upload");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file (JPEG, PNG, WebP)");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      alert("Image size should be less than 8MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImageUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-background rounded-3xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-surface">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            {isEditing ? (
              <>
                <Edit2 className="w-5 h-5 text-primary" /> Edit Menu Item
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 text-primary" /> Add New Item
              </>
            )}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-foreground-muted hover:text-foreground hover:bg-background transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form action={action} className="p-6 space-y-4 overflow-y-auto flex-1">
          {state?.message && (
            <div
              className={`p-3.5 rounded-xl text-sm border font-medium ${
                state.success
                  ? "bg-success/10 border-success/20 text-success"
                  : "bg-error/10 border-error/20 text-error"
              }`}
            >
              {state.message}
            </div>
          )}

          {/* Hidden Image Input passed to Server Action */}
          <input type="hidden" name="image_url" value={imageUrl} />

          {/* Item Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-semibold text-foreground mb-1.5"
            >
              Item Name *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              defaultValue={foodItem?.name || ""}
              placeholder="e.g. Paneer Butter Masala"
              className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-foreground placeholder:text-foreground-muted/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm font-medium"
            />
            {state?.errors?.name && (
              <p className="mt-1 text-xs text-error">{state.errors.name[0]}</p>
            )}
          </div>

          {/* Image Picker Section (Gallery / File Upload or Web Link) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-primary" /> Food Item Image
              </label>
              <div className="flex items-center gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => setMode("upload")}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    mode === "upload"
                      ? "bg-primary text-white font-bold"
                      : "text-foreground-muted hover:text-foreground"
                  }`}
                >
                  Gallery / Device
                </button>
                <button
                  type="button"
                  onClick={() => setMode("url")}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    mode === "url"
                      ? "bg-primary text-white font-bold"
                      : "text-foreground-muted hover:text-foreground"
                  }`}
                >
                  Image URL
                </button>
              </div>
            </div>

            {imageUrl ? (
              <div className="relative rounded-2xl border border-border overflow-hidden bg-surface group p-2 flex items-center gap-3">
                <img
                  src={imageUrl}
                  alt="Food Item Preview"
                  className="w-16 h-16 object-cover rounded-xl border border-border shrink-0"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-foreground">Food Photo Selected</p>
                  <p className="text-[11px] text-foreground-muted truncate">
                    Ready to save with menu item
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="p-2 rounded-xl bg-error/10 text-error hover:bg-error hover:text-white transition-all shrink-0"
                  title="Remove image"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : mode === "upload" ? (
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border hover:border-primary/50 bg-surface/50 hover:bg-surface rounded-2xl cursor-pointer transition-all text-center group">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-foreground">
                  Upload Image from Gallery or File Manager
                </span>
                <span className="text-[11px] text-foreground-muted mt-1">
                  Supports JPEG, PNG, WebP files from phone or desktop
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative">
                <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface text-foreground placeholder:text-foreground-muted/40 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm font-medium"
                />
              </div>
            )}
          </div>

          {/* Category & Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="food_category_id"
                className="block text-sm font-semibold text-foreground mb-1.5"
              >
                Category
              </label>
              <select
                id="food_category_id"
                name="food_category_id"
                defaultValue={foodItem?.food_category_id || ""}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm font-medium"
              >
                <option value="">Uncategorized</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="price"
                className="block text-sm font-semibold text-foreground mb-1.5"
              >
                Price (₹) *
              </label>
              <input
                id="price"
                name="price"
                type="number"
                step="0.01"
                required
                defaultValue={foodItem?.price || ""}
                placeholder="240.00"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-foreground placeholder:text-foreground-muted/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm font-medium"
              />
              {state?.errors?.price && (
                <p className="mt-1 text-xs text-error">{state.errors.price[0]}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-semibold text-foreground mb-1.5"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={foodItem?.description || ""}
              placeholder="Fresh cottage cheese cooked in creamy tomato gravy..."
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-foreground placeholder:text-foreground-muted/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm font-medium resize-none"
            />
          </div>

          {/* Type & Stock Status Controls */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            {/* Veg / Non-Veg Toggle */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-foreground-muted mb-2">
                Type
              </label>
              <input type="hidden" name="is_veg" value={String(isVeg)} />
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-surface rounded-xl border border-border">
                <button
                  type="button"
                  onClick={() => setIsVeg(true)}
                  className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                    isVeg
                      ? "bg-success/15 text-success border border-success/30 shadow-2xs"
                      : "text-foreground-muted hover:text-foreground"
                  }`}
                >
                  🟢 Veg
                </button>
                <button
                  type="button"
                  onClick={() => setIsVeg(false)}
                  className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                    !isVeg
                      ? "bg-error/15 text-error border border-error/30 shadow-2xs"
                      : "text-foreground-muted hover:text-foreground"
                  }`}
                >
                  🔴 Non-Veg
                </button>
              </div>
            </div>

            {/* Stock Status Toggle */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-foreground-muted mb-2">
                Stock Status
              </label>
              <input
                type="hidden"
                name="is_available"
                value={String(isAvailable)}
              />
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-surface rounded-xl border border-border">
                <button
                  type="button"
                  onClick={() => setIsAvailable(true)}
                  className={`py-2 rounded-lg text-xs font-bold transition-all ${
                    isAvailable
                      ? "bg-primary/10 text-primary border border-primary/20 shadow-2xs"
                      : "text-foreground-muted hover:text-foreground"
                  }`}
                >
                  Available
                </button>
                <button
                  type="button"
                  onClick={() => setIsAvailable(false)}
                  className={`py-2 rounded-lg text-xs font-bold transition-all ${
                    !isAvailable
                      ? "bg-foreground-muted/10 text-foreground-muted border border-border"
                      : "text-foreground-muted hover:text-foreground"
                  }`}
                >
                  Out of Stock
                </button>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-border flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-border text-foreground-muted text-sm font-bold hover:bg-surface transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-bold shadow-md shadow-primary/25 hover:bg-primary-dark disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {pending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Create Item"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
