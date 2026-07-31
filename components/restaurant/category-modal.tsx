"use client";

import { useActionState } from "react";
import {
  createFoodCategoryAction,
  updateFoodCategoryAction,
} from "@/actions/food.actions";
import type { FoodFormState } from "@/actions/food.actions";
import type { FoodCategory } from "@/types/domain.types";
import { X, Loader2, FolderPlus, Edit2 } from "lucide-react";

interface Props {
  restaurantId: string;
  category?: FoodCategory | null;
  onClose: () => void;
}

export function CategoryModal({ restaurantId, category, onClose }: Props) {
  const isEditing = !!category;
  const actionFn = isEditing
    ? updateFoodCategoryAction.bind(null, category.id)
    : createFoodCategoryAction.bind(null, restaurantId);

  const [state, action, pending] = useActionState<FoodFormState, FormData>(
    actionFn,
    undefined
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-background rounded-2xl border border-border shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border bg-surface">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            {isEditing ? (
              <>
                <Edit2 className="w-5 h-5 text-primary" /> Edit Category
              </>
            ) : (
              <>
                <FolderPlus className="w-5 h-5 text-primary" /> Add Food Category
              </>
            )}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-foreground-muted hover:text-foreground hover:bg-background transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form action={action} className="p-6 space-y-4">
          {state?.message && (
            <div
              className={`p-3.5 rounded-xl text-sm border ${
                state.success
                  ? "bg-success/10 border-success/20 text-success"
                  : "bg-error/10 border-error/20 text-error"
              }`}
            >
              {state.message}
            </div>
          )}

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Category Name *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              defaultValue={category?.name || ""}
              placeholder="e.g. Starters, Main Course, Desserts"
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
            />
            {state?.errors?.name && (
              <p className="mt-1 text-xs text-error">{state.errors.name[0]}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="display_order"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Display Order
            </label>
            <input
              id="display_order"
              name="display_order"
              type="number"
              defaultValue={category?.display_order || 0}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-border text-foreground-muted text-sm font-semibold hover:bg-surface transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold shadow-md shadow-primary/25 hover:bg-primary-dark disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {pending && <Loader2 className="w-4 h-4 animate-spin" />}
              {pending ? "Saving..." : isEditing ? "Save" : "Add Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
