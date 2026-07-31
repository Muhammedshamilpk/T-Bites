import { create } from "zustand";

export interface LocalCartItem {
  food_item_id: string;
  name: string;
  price: number;
  quantity: number;
  restaurant_id: string;
  restaurant_name: string;
  image_url?: string;
  is_veg: boolean;
}

interface CartStoreState {
  items: LocalCartItem[];
  restaurantId: string | null;
  restaurantName: string | null;

  addItem: (item: LocalCartItem) => void;
  removeItem: (foodItemId: string) => void;
  updateQuantity: (foodItemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalCount: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStoreState>((set, get) => ({
  items: [],
  restaurantId: null,
  restaurantName: null,

  addItem: (newItem) =>
    set((state) => {
      // If adding item from a different restaurant, reset cart for single-restaurant scoping
      if (state.restaurantId && state.restaurantId !== newItem.restaurant_id) {
        return {
          items: [newItem],
          restaurantId: newItem.restaurant_id,
          restaurantName: newItem.restaurant_name,
        };
      }

      const existingIndex = state.items.findIndex(
        (i) => i.food_item_id === newItem.food_item_id
      );

      if (existingIndex > -1) {
        const updatedItems = [...state.items];
        updatedItems[existingIndex].quantity += newItem.quantity;
        return {
          items: updatedItems,
          restaurantId: newItem.restaurant_id,
          restaurantName: newItem.restaurant_name,
        };
      }

      return {
        items: [...state.items, newItem],
        restaurantId: newItem.restaurant_id,
        restaurantName: newItem.restaurant_name,
      };
    }),

  removeItem: (foodItemId) =>
    set((state) => {
      const updated = state.items.filter((i) => i.food_item_id !== foodItemId);
      return {
        items: updated,
        restaurantId: updated.length > 0 ? state.restaurantId : null,
        restaurantName: updated.length > 0 ? state.restaurantName : null,
      };
    }),

  updateQuantity: (foodItemId, quantity) =>
    set((state) => {
      if (quantity <= 0) {
        const updated = state.items.filter((i) => i.food_item_id !== foodItemId);
        return {
          items: updated,
          restaurantId: updated.length > 0 ? state.restaurantId : null,
          restaurantName: updated.length > 0 ? state.restaurantName : null,
        };
      }

      const updated = state.items.map((i) =>
        i.food_item_id === foodItemId ? { ...i, quantity } : i
      );
      return { items: updated };
    }),

  clearCart: () => set({ items: [], restaurantId: null, restaurantName: null }),

  getTotalCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

  getTotalPrice: () =>
    get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
}));
