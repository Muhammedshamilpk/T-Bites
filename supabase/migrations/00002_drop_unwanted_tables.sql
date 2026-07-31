-- ============================================================
-- T-Bites Pure Architecture Migration:
-- Supabase = AUTHENTICATION ONLY (auth.users + profiles)
-- Sanity CMS = ALL CONTENT & DATA STORAGE
-- ============================================================

-- Drop unwanted data tables safely
DROP TABLE IF EXISTS order_status_history CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS carts CASCADE;
DROP TABLE IF EXISTS food_images CASCADE;
DROP TABLE IF EXISTS food_items CASCADE;
DROP TABLE IF EXISTS food_categories CASCADE;
DROP TABLE IF EXISTS restaurant_categories CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS restaurant_hours CASCADE;
DROP TABLE IF EXISTS addresses CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS restaurants CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;

-- Cleanup unused enum types
DROP TYPE IF EXISTS restaurant_status CASCADE;
DROP TYPE IF EXISTS approval_status CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS payment_method CASCADE;
DROP TYPE IF EXISTS notification_type CASCADE;
DROP TYPE IF EXISTS discount_type CASCADE;

-- Kept in Supabase:
-- 1. auth.users (Supabase Auth)
-- 2. public.profiles (Linked to auth.users for user name, role, phone)
