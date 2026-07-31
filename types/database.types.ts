/**
 * Database types — auto-generated placeholder.
 *
 * In production, regenerate this file using:
 *   npx supabase gen types typescript --project-id <your-project-id> > types/database.types.ts
 *
 * This placeholder provides the basic structure so the app compiles
 * before a Supabase project is connected.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ── Enum Types ──────────────────────────────────────────────
export type UserRole = "customer" | "restaurant_owner" | "admin";
export type RestaurantStatus = "open" | "closed" | "holiday";
export type ApprovalStatus = "pending" | "approved" | "suspended" | "rejected";
export type OrderStatus =
  | "placed"
  | "accepted"
  | "rejected"
  | "preparing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";
export type PaymentMethod = "cod";
export type NotificationType =
  | "new_order"
  | "order_status_change"
  | "restaurant_approved"
  | "restaurant_suspended"
  | "system";
export type DiscountType = "flat" | "percentage";

// ── Database Interface ──────────────────────────────────────
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          phone: string | null;
          role: UserRole;
          avatar_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          phone?: string | null;
          role?: UserRole;
          avatar_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          phone?: string | null;
          role?: UserRole;
          avatar_url?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      restaurants: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          description: string | null;
          logo_url: string | null;
          banner_url: string | null;
          address_line: string;
          city: string;
          pincode: string;
          phone: string;
          status: RestaurantStatus;
          approval_status: ApprovalStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          description?: string | null;
          logo_url?: string | null;
          banner_url?: string | null;
          address_line: string;
          city: string;
          pincode: string;
          phone: string;
          status?: RestaurantStatus;
          approval_status?: ApprovalStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          owner_id?: string;
          name?: string;
          description?: string | null;
          logo_url?: string | null;
          banner_url?: string | null;
          address_line?: string;
          city?: string;
          pincode?: string;
          phone?: string;
          status?: RestaurantStatus;
          approval_status?: ApprovalStatus;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "restaurants_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      restaurant_hours: {
        Row: {
          id: string;
          restaurant_id: string;
          day_of_week: number;
          open_time: string | null;
          close_time: string | null;
          is_closed: boolean;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          day_of_week: number;
          open_time?: string | null;
          close_time?: string | null;
          is_closed?: boolean;
        };
        Update: {
          restaurant_id?: string;
          day_of_week?: number;
          open_time?: string | null;
          close_time?: string | null;
          is_closed?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "restaurant_hours_restaurant_id_fkey";
            columns: ["restaurant_id"];
            isOneToOne: false;
            referencedRelation: "restaurants";
            referencedColumns: ["id"];
          },
        ];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          created_at?: string;
        };
        Update: {
          name?: string;
          slug?: string;
        };
        Relationships: [];
      };
      restaurant_categories: {
        Row: {
          restaurant_id: string;
          category_id: string;
        };
        Insert: {
          restaurant_id: string;
          category_id: string;
        };
        Update: {
          restaurant_id?: string;
          category_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "restaurant_categories_restaurant_id_fkey";
            columns: ["restaurant_id"];
            isOneToOne: false;
            referencedRelation: "restaurants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "restaurant_categories_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      food_categories: {
        Row: {
          id: string;
          restaurant_id: string;
          name: string;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          name: string;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          name?: string;
          display_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "food_categories_restaurant_id_fkey";
            columns: ["restaurant_id"];
            isOneToOne: false;
            referencedRelation: "restaurants";
            referencedColumns: ["id"];
          },
        ];
      };
      food_items: {
        Row: {
          id: string;
          restaurant_id: string;
          food_category_id: string | null;
          name: string;
          description: string | null;
          price: number;
          is_veg: boolean;
          is_available: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          food_category_id?: string | null;
          name: string;
          description?: string | null;
          price: number;
          is_veg?: boolean;
          is_available?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          food_category_id?: string | null;
          name?: string;
          description?: string | null;
          price?: number;
          is_veg?: boolean;
          is_available?: boolean;
          display_order?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "food_items_restaurant_id_fkey";
            columns: ["restaurant_id"];
            isOneToOne: false;
            referencedRelation: "restaurants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "food_items_food_category_id_fkey";
            columns: ["food_category_id"];
            isOneToOne: false;
            referencedRelation: "food_categories";
            referencedColumns: ["id"];
          },
        ];
      };
      food_images: {
        Row: {
          id: string;
          food_item_id: string;
          storage_path: string;
          is_primary: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          food_item_id: string;
          storage_path: string;
          is_primary?: boolean;
          created_at?: string;
        };
        Update: {
          storage_path?: string;
          is_primary?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "food_images_food_item_id_fkey";
            columns: ["food_item_id"];
            isOneToOne: false;
            referencedRelation: "food_items";
            referencedColumns: ["id"];
          },
        ];
      };
      addresses: {
        Row: {
          id: string;
          customer_id: string;
          label: string;
          line1: string;
          line2: string | null;
          city: string;
          pincode: string;
          landmark: string | null;
          is_default: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          label: string;
          line1: string;
          line2?: string | null;
          city: string;
          pincode: string;
          landmark?: string | null;
          is_default?: boolean;
          created_at?: string;
        };
        Update: {
          label?: string;
          line1?: string;
          line2?: string | null;
          city?: string;
          pincode?: string;
          landmark?: string | null;
          is_default?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "addresses_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      carts: {
        Row: {
          id: string;
          customer_id: string;
          restaurant_id: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          restaurant_id?: string | null;
          updated_at?: string;
        };
        Update: {
          restaurant_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "carts_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "carts_restaurant_id_fkey";
            columns: ["restaurant_id"];
            isOneToOne: false;
            referencedRelation: "restaurants";
            referencedColumns: ["id"];
          },
        ];
      };
      cart_items: {
        Row: {
          id: string;
          cart_id: string;
          food_item_id: string;
          quantity: number;
          unit_price_snapshot: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          cart_id: string;
          food_item_id: string;
          quantity: number;
          unit_price_snapshot: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          quantity?: number;
          unit_price_snapshot?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey";
            columns: ["cart_id"];
            isOneToOne: false;
            referencedRelation: "carts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cart_items_food_item_id_fkey";
            columns: ["food_item_id"];
            isOneToOne: false;
            referencedRelation: "food_items";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          id: string;
          customer_id: string;
          restaurant_id: string;
          delivery_address_id: string;
          status: OrderStatus;
          payment_method: PaymentMethod;
          subtotal: number;
          total: number;
          customer_note: string | null;
          rejection_reason: string | null;
          placed_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          restaurant_id: string;
          delivery_address_id: string;
          status?: OrderStatus;
          payment_method?: PaymentMethod;
          subtotal: number;
          total: number;
          customer_note?: string | null;
          rejection_reason?: string | null;
          placed_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: OrderStatus;
          rejection_reason?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_restaurant_id_fkey";
            columns: ["restaurant_id"];
            isOneToOne: false;
            referencedRelation: "restaurants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_delivery_address_id_fkey";
            columns: ["delivery_address_id"];
            isOneToOne: false;
            referencedRelation: "addresses";
            referencedColumns: ["id"];
          },
        ];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          food_item_id: string | null;
          food_name_snapshot: string;
          unit_price_snapshot: number;
          quantity: number;
          line_total: number;
        };
        Insert: {
          id?: string;
          order_id: string;
          food_item_id?: string | null;
          food_name_snapshot: string;
          unit_price_snapshot: number;
          quantity: number;
          line_total: number;
        };
        Update: {
          id?: never;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_food_item_id_fkey";
            columns: ["food_item_id"];
            isOneToOne: false;
            referencedRelation: "food_items";
            referencedColumns: ["id"];
          },
        ];
      };
      order_status_history: {
        Row: {
          id: string;
          order_id: string;
          status: OrderStatus;
          changed_by: string;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          status: OrderStatus;
          changed_by: string;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: never;
        };
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_status_history_changed_by_fkey";
            columns: ["changed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          id: string;
          recipient_id: string;
          type: NotificationType;
          title: string;
          body: string;
          related_order_id: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          recipient_id: string;
          type: NotificationType;
          title: string;
          body: string;
          related_order_id?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          is_read?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_recipient_id_fkey";
            columns: ["recipient_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_related_order_id_fkey";
            columns: ["related_order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      audit_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          action: string;
          entity_type: string;
          entity_id: string;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: never;
        };
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      settings: {
        Row: {
          key: string;
          value: Json;
          updated_by: string;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: Json;
          updated_by: string;
          updated_at?: string;
        };
        Update: {
          value?: Json;
          updated_by?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "settings_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      reviews: {
        Row: {
          id: string;
          order_id: string;
          customer_id: string;
          restaurant_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          customer_id: string;
          restaurant_id: string;
          rating: number;
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          rating?: number;
          comment?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "reviews_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: true;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_restaurant_id_fkey";
            columns: ["restaurant_id"];
            isOneToOne: false;
            referencedRelation: "restaurants";
            referencedColumns: ["id"];
          },
        ];
      };
      coupons: {
        Row: {
          id: string;
          restaurant_id: string | null;
          code: string;
          discount_type: DiscountType;
          discount_value: number;
          valid_from: string;
          valid_to: string;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          restaurant_id?: string | null;
          code: string;
          discount_type: DiscountType;
          discount_value: number;
          valid_from: string;
          valid_to: string;
          is_active?: boolean;
        };
        Update: {
          code?: string;
          discount_type?: DiscountType;
          discount_value?: number;
          valid_from?: string;
          valid_to?: string;
          is_active?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "coupons_restaurant_id_fkey";
            columns: ["restaurant_id"];
            isOneToOne: false;
            referencedRelation: "restaurants";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      user_role: UserRole;
      restaurant_status: RestaurantStatus;
      approval_status: ApprovalStatus;
      order_status: OrderStatus;
      payment_method: PaymentMethod;
      notification_type: NotificationType;
      discount_type: DiscountType;
    };
    CompositeTypes: Record<string, never>;
  };
}
