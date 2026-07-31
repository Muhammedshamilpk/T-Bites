# Customer Role Guide — T-Bites Platform

The **Customer Role** (`role: 'customer'`) enables end-users to discover local restaurants, browse food menus, customize items, manage shopping carts, submit Cash on Delivery (COD) orders, and track order progress in real-time.

---

## 🔑 Key Features & Responsibilities

### 1. Restaurant Discovery & Catalog Browsing
- **URL Route:** `/` and `/restaurants`
- **Capabilities:**
  - Browse approved local restaurants with cover images, addresses, and status badges.
  - Search restaurants by name, cuisine, or category.
  - Filter restaurants by category pills (e.g., North Indian, Pizza, Chinese, Street Food).

### 2. Interactive Food Menu
- **URL Route:** `/restaurants/[id]`
- **Capabilities:**
  - View food items grouped by category with Veg/Non-Veg indicators (🟢 / 🔴).
  - View food item photos, prices, descriptions, and real-time stock availability.
  - Add items to persistent cart with quantity controls.

### 3. Persistent Cart & Order Checkout
- **URL Route:** `/checkout`
- **Capabilities:**
  - Review selected item list, unit prices, delivery fee calculations, and subtotal.
  - Select existing delivery address or add a new delivery address modal.
  - Include special customer instructions/notes for the restaurant kitchen.
  - Confirm Cash on Delivery (COD) placement.

### 4. Real-time Order Tracker & History
- **URL Route:** `/orders` and `/orders/[id]`
- **Capabilities:**
  - Live timeline tracking order progress (`PLACED` ➔ `ACCEPTED` ➔ `PREPARING` ➔ `OUT_FOR_DELIVERY` ➔ `DELIVERED`).
  - Automatic Supabase Realtime channel subscription for instant status updates without page refreshing.
  - View past order history and invoice breakdowns.

---

## 🔒 Security & Route Permissions

| Route | Permission | Behavior |
| :--- | :--- | :--- |
| `/` & `/restaurants` | Public | Open to guests and authenticated customers. |
| `/checkout` | Authenticated | Redirects to `/login` if unauthenticated. |
| `/orders/[id]` | Owner Only | RLS policies ensure customers can only view their own orders. |
| `/dashboard` | Restricted | Automatically redirected to `/` by proxy middleware. |
| `/admin` | Restricted | Automatically redirected to `/` by proxy middleware. |

---

## 🗄️ Database Tables Used by Customer Role
- `profiles` (`role = 'customer'`)
- `restaurants` (Read-only for approved status)
- `food_items` & `food_images` (Read-only)
- `addresses` (CRUD for personal addresses)
- `carts` & `cart_items` (Owner CRUD)
- `orders` & `order_items` (Insert & Read-own)
