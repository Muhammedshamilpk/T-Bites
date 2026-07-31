-- ============================================================
-- T-Bites MVP — Seed Data (Development Only)
-- ============================================================
-- NOTE: Run this AFTER migrations. This seeds sample data for
-- local development. Do NOT run this against production.
--
-- Admin user must be created manually via Supabase Auth dashboard
-- or via the signup flow, then promoted to admin:
--
--   UPDATE profiles SET role = 'admin' WHERE id = '<admin-user-uuid>';
-- ============================================================


-- ── Global Categories ───────────────────────────────────────

INSERT INTO categories (name, slug) VALUES
  ('North Indian',  'north-indian'),
  ('South Indian',  'south-indian'),
  ('Chinese',       'chinese'),
  ('Biryani',       'biryani'),
  ('Pizza',         'pizza'),
  ('Burgers',       'burgers'),
  ('Bakery',        'bakery'),
  ('Beverages',     'beverages'),
  ('Desserts',      'desserts'),
  ('Street Food',   'street-food'),
  ('Healthy',       'healthy'),
  ('Thali',         'thali')
ON CONFLICT (name) DO NOTHING;


-- ── Default Platform Settings ───────────────────────────────
-- These will be inserted once an admin user exists.
-- For now, leave the settings table empty and seed after first admin login.
