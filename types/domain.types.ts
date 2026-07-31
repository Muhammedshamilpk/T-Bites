/**
 * Domain types — derived from database types for use throughout the app.
 * These provide a clean API surface so components don't depend on raw DB shape.
 */

import type {
  Database,
  UserRole,
  RestaurantStatus,
  ApprovalStatus,
  OrderStatus,
  PaymentMethod,
  NotificationType,
} from "./database.types";

// ── Re-export enums for convenience ─────────────────────────
export type {
  UserRole,
  RestaurantStatus,
  ApprovalStatus,
  OrderStatus,
  PaymentMethod,
  NotificationType,
};

// ── Table Row Types ─────────────────────────────────────────
type Tables = Database["public"]["Tables"];

export type Profile = Tables["profiles"]["Row"];
export type Restaurant = Tables["restaurants"]["Row"];
export type RestaurantHours = Tables["restaurant_hours"]["Row"];
export type Category = Tables["categories"]["Row"];
export type FoodCategory = Tables["food_categories"]["Row"];
export type FoodItem = Tables["food_items"]["Row"];
export type FoodImage = Tables["food_images"]["Row"];
export type Address = Tables["addresses"]["Row"];
export type Cart = Tables["carts"]["Row"];
export type CartItem = Tables["cart_items"]["Row"];
export type Order = Tables["orders"]["Row"];
export type OrderItem = Tables["order_items"]["Row"];
export type OrderStatusHistory = Tables["order_status_history"]["Row"];
export type Notification = Tables["notifications"]["Row"];
export type AuditLog = Tables["audit_logs"]["Row"];
export type Setting = Tables["settings"]["Row"];

// ── Insert Types ────────────────────────────────────────────
export type ProfileInsert = Tables["profiles"]["Insert"];
export type RestaurantInsert = Tables["restaurants"]["Insert"];
export type FoodItemInsert = Tables["food_items"]["Insert"];
export type AddressInsert = Tables["addresses"]["Insert"];
export type OrderInsert = Tables["orders"]["Insert"];
export type OrderItemInsert = Tables["order_items"]["Insert"];

// ── Composite / Enriched Types ──────────────────────────────
export type RestaurantWithHours = Restaurant & {
  restaurant_hours: RestaurantHours[];
};

export type RestaurantWithCategories = Restaurant & {
  categories: Category[];
};

export type FoodItemWithImages = FoodItem & {
  food_images: FoodImage[];
};

export type CartItemWithFood = CartItem & {
  food_item: FoodItem & { food_images: FoodImage[] };
};

export type CartWithItems = Cart & {
  cart_items: CartItemWithFood[];
  restaurant: Restaurant | null;
};

export type OrderWithItems = Order & {
  order_items: OrderItem[];
  restaurant: Pick<Restaurant, "id" | "name" | "logo_url" | "phone">;
  delivery_address: Address;
};

export type OrderWithTimeline = OrderWithItems & {
  status_history: OrderStatusHistory[];
};

// ── Server Action Result Pattern ────────────────────────────
export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };
