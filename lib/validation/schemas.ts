import { z } from "zod";

// ── Restaurant Schemas ──────────────────────────────────────

export const createRestaurantSchema = z.object({
  name: z
    .string()
    .min(2, "Restaurant name must be at least 2 characters")
    .max(100, "Restaurant name is too long"),
  description: z.string().max(500, "Description is too long").optional(),
  address_line: z.string().min(5, "Please enter a valid address"),
  city: z.string().min(2, "Please enter the city"),
  pincode: z
    .string()
    .regex(/^\d{6}$/, "Please enter a valid 6-digit pincode"),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit phone number"),
});

export const updateRestaurantSchema = createRestaurantSchema.partial();

export type CreateRestaurantInput = z.infer<typeof createRestaurantSchema>;
export type UpdateRestaurantInput = z.infer<typeof updateRestaurantSchema>;

// ── Food Category Schemas ───────────────────────────────────

export const foodCategorySchema = z.object({
  name: z
    .string()
    .min(2, "Category name must be at least 2 characters")
    .max(50, "Category name is too long"),
  display_order: z.number().int().min(0).default(0),
});

export type FoodCategoryInput = z.infer<typeof foodCategorySchema>;

// ── Food Item Schemas ───────────────────────────────────────

export const foodItemSchema = z.object({
  name: z
    .string()
    .min(2, "Item name must be at least 2 characters")
    .max(100, "Item name is too long"),
  description: z.string().max(500, "Description is too long").optional(),
  price: z
    .number()
    .positive("Price must be greater than 0")
    .max(99999, "Price is too high"),
  food_category_id: z.string().uuid("Invalid category").optional().nullable(),
  is_veg: z.boolean().default(true),
  is_available: z.boolean().default(true),
  display_order: z.number().int().min(0).default(0),
});

export type FoodItemInput = z.infer<typeof foodItemSchema>;

// ── Address Schema ──────────────────────────────────────────

export const addressSchema = z.object({
  label: z
    .string()
    .min(1, "Please add a label (e.g., Home, Work)")
    .max(30, "Label is too long"),
  line1: z.string().min(5, "Please enter your address"),
  line2: z.string().max(200).optional(),
  city: z.string().min(2, "Please enter the city"),
  pincode: z
    .string()
    .regex(/^\d{6}$/, "Please enter a valid 6-digit pincode"),
  landmark: z.string().max(100).optional(),
  is_default: z.boolean().default(false),
});

export type AddressInput = z.infer<typeof addressSchema>;

// ── Checkout Schema ─────────────────────────────────────────

export const checkoutSchema = z.object({
  delivery_address_id: z.string().uuid("Please select a delivery address"),
  customer_note: z.string().max(300, "Note is too long").optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

// ── Order Status Update ─────────────────────────────────────

export const rejectOrderSchema = z.object({
  order_id: z.string().uuid(),
  rejection_reason: z
    .string()
    .min(5, "Please provide a reason for rejection")
    .max(300, "Reason is too long"),
});

export type RejectOrderInput = z.infer<typeof rejectOrderSchema>;

// ── Global Category (Admin) ─────────────────────────────────

export const globalCategorySchema = z.object({
  name: z
    .string()
    .min(2, "Category name must be at least 2 characters")
    .max(50, "Category name is too long"),
  slug: z
    .string()
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase with hyphens only"
    ),
});

export type GlobalCategoryInput = z.infer<typeof globalCategorySchema>;
