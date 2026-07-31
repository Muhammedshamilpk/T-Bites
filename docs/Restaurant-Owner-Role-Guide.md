# Restaurant Owner Role Guide — T-Bites Platform

The **Restaurant Owner Role** (`role: 'restaurant_owner'`) provides store owners with a dedicated Kitchen Control Dashboard to manage live incoming orders, update stock availability, construct food menus, and configure restaurant profile settings.

---

## 🔑 Key Features & Responsibilities

### 1. Live Kitchen Orders Board
- **URL Route:** `/dashboard` and `/dashboard/orders`
- **Capabilities:**
  - View live incoming order cards with customer details, delivery address, and ordered item lists.
  - Advance order status through workflow buttons:
    - **Placed:** `Accept Order` or `Decline Order` (with reason prompt)
    - **Accepted:** `Start Preparing`
    - **Preparing:** `Out for Delivery`
    - **Out for Delivery:** `Mark Delivered`
  - Real-time updates via Supabase Realtime order streams.

### 2. Menu & Category Management
- **URL Route:** `/dashboard/menu`
- **Capabilities:**
  - Create, edit, and delete food categories (e.g., Starters, Main Course, Beverages).
  - Add and update food items with item name, price, description, Veg/Non-Veg toggle, and **Food Image URL** with live preview.
  - Instant **In Stock / Out of Stock** (`is_available`) toggle to prevent customers from ordering unavailable items.

### 3. Restaurant Profile & Store Settings
- **URL Route:** `/dashboard/settings`
- **Capabilities:**
  - Update restaurant name, phone number, address line, city, and pincode.
  - Update store logo URL and banner cover photo URL.
  - Toggle store operational status (**Open**, **Closed**, **Holiday**).

---

## 🔒 Security & Route Permissions

| Route | Permission | Behavior |
| :--- | :--- | :--- |
| `/dashboard` | Restaurant Owner Only | Accessible only by authenticated store owners. |
| `/dashboard/orders` | Store Owner Only | Row Level Security (RLS) restricts orders to owned `restaurant_id`. |
| `/dashboard/menu` | Store Owner Only | Category and item CRUD restricted to owned store. |
| `/admin` | Restricted | Automatically redirected to `/` by proxy middleware. |

---

## 🗄️ Database Tables Used by Restaurant Owner Role
- `profiles` (`role = 'restaurant_owner'`)
- `restaurants` (Owner update & status management)
- `food_categories` (Owner CRUD)
- `food_items` & `food_images` (Owner CRUD)
- `orders` & `order_status_history` (Status update permissions)
