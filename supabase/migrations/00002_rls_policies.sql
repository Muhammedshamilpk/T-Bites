-- ============================================================
-- T-Bites MVP — Row Level Security Policies (Idempotent)
-- ============================================================

-- Enable RLS on ALL tables
ALTER TABLE profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants           ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_hours      ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories            ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_categories       ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_items            ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_images           ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses             ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items            ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders                ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items           ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history  ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications         ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs            ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings              ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews               ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons               ENABLE ROW LEVEL SECURITY;


-- ── Helper: check if current user is admin ──────────────────

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;


-- ══════════════════════════════════════════════════════════════
-- PROFILES
-- ══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_admin_select" ON profiles;
CREATE POLICY "profiles_admin_select"
  ON profiles FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "profiles_admin_update" ON profiles;
CREATE POLICY "profiles_admin_update"
  ON profiles FOR UPDATE
  USING (public.is_admin());


-- ══════════════════════════════════════════════════════════════
-- RESTAURANTS
-- ══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "restaurants_public_read_approved" ON restaurants;
CREATE POLICY "restaurants_public_read_approved"
  ON restaurants FOR SELECT
  USING (approval_status = 'approved');

DROP POLICY IF EXISTS "restaurants_owner_read_own" ON restaurants;
CREATE POLICY "restaurants_owner_read_own"
  ON restaurants FOR SELECT
  USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "restaurants_owner_insert" ON restaurants;
CREATE POLICY "restaurants_owner_insert"
  ON restaurants FOR INSERT
  WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "restaurants_owner_update" ON restaurants;
CREATE POLICY "restaurants_owner_update"
  ON restaurants FOR UPDATE
  USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "restaurants_admin_select" ON restaurants;
CREATE POLICY "restaurants_admin_select"
  ON restaurants FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "restaurants_admin_update" ON restaurants;
CREATE POLICY "restaurants_admin_update"
  ON restaurants FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "restaurants_admin_delete" ON restaurants;
CREATE POLICY "restaurants_admin_delete"
  ON restaurants FOR DELETE
  USING (public.is_admin());


-- ══════════════════════════════════════════════════════════════
-- RESTAURANT_HOURS
-- ══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "restaurant_hours_public_read" ON restaurant_hours;
CREATE POLICY "restaurant_hours_public_read"
  ON restaurant_hours FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM restaurants r
      WHERE r.id = restaurant_hours.restaurant_id
        AND r.approval_status = 'approved'
    )
  );

DROP POLICY IF EXISTS "restaurant_hours_owner_read" ON restaurant_hours;
CREATE POLICY "restaurant_hours_owner_read"
  ON restaurant_hours FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM restaurants r
      WHERE r.id = restaurant_hours.restaurant_id
        AND r.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "restaurant_hours_owner_manage" ON restaurant_hours;
CREATE POLICY "restaurant_hours_owner_manage"
  ON restaurant_hours FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM restaurants r
      WHERE r.id = restaurant_hours.restaurant_id
        AND r.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "restaurant_hours_admin_select" ON restaurant_hours;
CREATE POLICY "restaurant_hours_admin_select"
  ON restaurant_hours FOR SELECT
  USING (public.is_admin());


-- ══════════════════════════════════════════════════════════════
-- CATEGORIES
-- ══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "categories_public_read" ON categories;
CREATE POLICY "categories_public_read"
  ON categories FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "categories_admin_manage" ON categories;
CREATE POLICY "categories_admin_manage"
  ON categories FOR ALL
  USING (public.is_admin());


-- ══════════════════════════════════════════════════════════════
-- RESTAURANT_CATEGORIES
-- ══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "restaurant_categories_public_read" ON restaurant_categories;
CREATE POLICY "restaurant_categories_public_read"
  ON restaurant_categories FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "restaurant_categories_owner_manage" ON restaurant_categories;
CREATE POLICY "restaurant_categories_owner_manage"
  ON restaurant_categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM restaurants r
      WHERE r.id = restaurant_categories.restaurant_id
        AND r.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "restaurant_categories_admin_manage" ON restaurant_categories;
CREATE POLICY "restaurant_categories_admin_manage"
  ON restaurant_categories FOR ALL
  USING (public.is_admin());


-- ══════════════════════════════════════════════════════════════
-- FOOD_CATEGORIES
-- ══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "food_categories_public_read" ON food_categories;
CREATE POLICY "food_categories_public_read"
  ON food_categories FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM restaurants r
      WHERE r.id = food_categories.restaurant_id
        AND r.approval_status = 'approved'
    )
  );

DROP POLICY IF EXISTS "food_categories_owner_manage" ON food_categories;
CREATE POLICY "food_categories_owner_manage"
  ON food_categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM restaurants r
      WHERE r.id = food_categories.restaurant_id
        AND r.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "food_categories_admin_select" ON food_categories;
CREATE POLICY "food_categories_admin_select"
  ON food_categories FOR SELECT
  USING (public.is_admin());


-- ══════════════════════════════════════════════════════════════
-- FOOD_ITEMS
-- ══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "food_items_public_read" ON food_items;
CREATE POLICY "food_items_public_read"
  ON food_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM restaurants r
      WHERE r.id = food_items.restaurant_id
        AND r.approval_status = 'approved'
    )
  );

DROP POLICY IF EXISTS "food_items_owner_manage" ON food_items;
CREATE POLICY "food_items_owner_manage"
  ON food_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM restaurants r
      WHERE r.id = food_items.restaurant_id
        AND r.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "food_items_admin_select" ON food_items;
CREATE POLICY "food_items_admin_select"
  ON food_items FOR SELECT
  USING (public.is_admin());


-- ══════════════════════════════════════════════════════════════
-- FOOD_IMAGES
-- ══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "food_images_public_read" ON food_images;
CREATE POLICY "food_images_public_read"
  ON food_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM food_items fi
      JOIN restaurants r ON r.id = fi.restaurant_id
      WHERE fi.id = food_images.food_item_id
        AND r.approval_status = 'approved'
    )
  );

DROP POLICY IF EXISTS "food_images_owner_manage" ON food_images;
CREATE POLICY "food_images_owner_manage"
  ON food_images FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM food_items fi
      JOIN restaurants r ON r.id = fi.restaurant_id
      WHERE fi.id = food_images.food_item_id
        AND r.owner_id = auth.uid()
    )
  );


-- ══════════════════════════════════════════════════════════════
-- ADDRESSES
-- ══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "addresses_customer_select" ON addresses;
CREATE POLICY "addresses_customer_select"
  ON addresses FOR SELECT
  USING (customer_id = auth.uid());

DROP POLICY IF EXISTS "addresses_customer_insert" ON addresses;
CREATE POLICY "addresses_customer_insert"
  ON addresses FOR INSERT
  WITH CHECK (customer_id = auth.uid());

DROP POLICY IF EXISTS "addresses_customer_update" ON addresses;
CREATE POLICY "addresses_customer_update"
  ON addresses FOR UPDATE
  USING (customer_id = auth.uid());

DROP POLICY IF EXISTS "addresses_customer_delete" ON addresses;
CREATE POLICY "addresses_customer_delete"
  ON addresses FOR DELETE
  USING (customer_id = auth.uid());


-- ══════════════════════════════════════════════════════════════
-- CARTS & CART_ITEMS
-- ══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "carts_customer_manage" ON carts;
CREATE POLICY "carts_customer_manage"
  ON carts FOR ALL
  USING (customer_id = auth.uid());

DROP POLICY IF EXISTS "cart_items_customer_manage" ON cart_items;
CREATE POLICY "cart_items_customer_manage"
  ON cart_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM carts c
      WHERE c.id = cart_items.cart_id
        AND c.customer_id = auth.uid()
    )
  );


-- ══════════════════════════════════════════════════════════════
-- ORDERS
-- ══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "orders_customer_select" ON orders;
CREATE POLICY "orders_customer_select"
  ON orders FOR SELECT
  USING (customer_id = auth.uid());

DROP POLICY IF EXISTS "orders_customer_insert" ON orders;
CREATE POLICY "orders_customer_insert"
  ON orders FOR INSERT
  WITH CHECK (customer_id = auth.uid());

DROP POLICY IF EXISTS "orders_owner_select" ON orders;
CREATE POLICY "orders_owner_select"
  ON orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM restaurants r
      WHERE r.id = orders.restaurant_id
        AND r.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "orders_owner_update" ON orders;
CREATE POLICY "orders_owner_update"
  ON orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM restaurants r
      WHERE r.id = orders.restaurant_id
        AND r.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "orders_admin_select" ON orders;
CREATE POLICY "orders_admin_select"
  ON orders FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "orders_admin_update" ON orders;
CREATE POLICY "orders_admin_update"
  ON orders FOR UPDATE
  USING (public.is_admin());


-- ══════════════════════════════════════════════════════════════
-- ORDER_ITEMS
-- ══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "order_items_customer_select" ON order_items;
CREATE POLICY "order_items_customer_select"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_items.order_id
        AND o.customer_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "order_items_customer_insert" ON order_items;
CREATE POLICY "order_items_customer_insert"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_items.order_id
        AND o.customer_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "order_items_owner_select" ON order_items;
CREATE POLICY "order_items_owner_select"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      JOIN restaurants r ON r.id = o.restaurant_id
      WHERE o.id = order_items.order_id
        AND r.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "order_items_admin_select" ON order_items;
CREATE POLICY "order_items_admin_select"
  ON order_items FOR SELECT
  USING (public.is_admin());


-- ══════════════════════════════════════════════════════════════
-- ORDER_STATUS_HISTORY
-- ══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "order_status_history_customer_select" ON order_status_history;
CREATE POLICY "order_status_history_customer_select"
  ON order_status_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_status_history.order_id
        AND o.customer_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "order_status_history_owner_select" ON order_status_history;
CREATE POLICY "order_status_history_owner_select"
  ON order_status_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      JOIN restaurants r ON r.id = o.restaurant_id
      WHERE o.id = order_status_history.order_id
        AND r.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "order_status_history_admin_select" ON order_status_history;
CREATE POLICY "order_status_history_admin_select"
  ON order_status_history FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "order_status_history_insert" ON order_status_history;
CREATE POLICY "order_status_history_insert"
  ON order_status_history FOR INSERT
  WITH CHECK (changed_by = auth.uid());


-- ══════════════════════════════════════════════════════════════
-- NOTIFICATIONS
-- ══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "notifications_user_select" ON notifications;
CREATE POLICY "notifications_user_select"
  ON notifications FOR SELECT
  USING (recipient_id = auth.uid());

DROP POLICY IF EXISTS "notifications_user_update" ON notifications;
CREATE POLICY "notifications_user_update"
  ON notifications FOR UPDATE
  USING (recipient_id = auth.uid());

DROP POLICY IF EXISTS "notifications_insert" ON notifications;
CREATE POLICY "notifications_insert"
  ON notifications FOR INSERT
  WITH CHECK (true);


-- ══════════════════════════════════════════════════════════════
-- AUDIT_LOGS
-- ══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "audit_logs_admin_select" ON audit_logs;
CREATE POLICY "audit_logs_admin_select"
  ON audit_logs FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "audit_logs_insert" ON audit_logs;
CREATE POLICY "audit_logs_insert"
  ON audit_logs FOR INSERT
  WITH CHECK (true);


-- ══════════════════════════════════════════════════════════════
-- SETTINGS
-- ══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "settings_public_read" ON settings;
CREATE POLICY "settings_public_read"
  ON settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "settings_admin_manage" ON settings;
CREATE POLICY "settings_admin_manage"
  ON settings FOR ALL
  USING (public.is_admin());


-- ══════════════════════════════════════════════════════════════
-- REVIEWS
-- ══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "reviews_public_read" ON reviews;
CREATE POLICY "reviews_public_read"
  ON reviews FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "reviews_customer_insert" ON reviews;
CREATE POLICY "reviews_customer_insert"
  ON reviews FOR INSERT
  WITH CHECK (customer_id = auth.uid());

DROP POLICY IF EXISTS "reviews_admin_select" ON reviews;
CREATE POLICY "reviews_admin_select"
  ON reviews FOR SELECT
  USING (public.is_admin());


-- ══════════════════════════════════════════════════════════════
-- COUPONS
-- ══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "coupons_public_read" ON coupons;
CREATE POLICY "coupons_public_read"
  ON coupons FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "coupons_admin_manage" ON coupons;
CREATE POLICY "coupons_admin_manage"
  ON coupons FOR ALL
  USING (public.is_admin());

DROP POLICY IF EXISTS "coupons_owner_manage" ON coupons;
CREATE POLICY "coupons_owner_manage"
  ON coupons FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM restaurants r
      WHERE r.id = coupons.restaurant_id
        AND r.owner_id = auth.uid()
    )
  );
