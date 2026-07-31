-- ============================================================
-- T-Bites MVP — Initial Schema Migration (Idempotent)
-- Local Restaurant Ordering Platform
-- ============================================================

-- ── 1. Enum Types (Safe Create) ──────────────────────────────

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('customer', 'restaurant_owner', 'admin');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE restaurant_status AS ENUM ('open', 'closed', 'holiday');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'suspended', 'rejected');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM (
    'placed', 'accepted', 'rejected', 'preparing',
    'out_for_delivery', 'delivered', 'cancelled'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM ('cod');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE notification_type AS ENUM (
    'new_order', 'order_status_change',
    'restaurant_approved', 'restaurant_suspended', 'system'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE discount_type AS ENUM ('flat', 'percentage');
EXCEPTION WHEN duplicate_object THEN null; END $$;


-- ── 2. Core Tables ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   text        NOT NULL,
  phone       text        UNIQUE,
  role        user_role   NOT NULL DEFAULT 'customer',
  avatar_url  text,
  is_active   boolean     NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS restaurants (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        uuid        NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  name            text        NOT NULL,
  description     text,
  logo_url        text,
  banner_url      text,
  address_line    text        NOT NULL,
  city            text        NOT NULL,
  pincode         text        NOT NULL,
  phone           text        NOT NULL,
  status          restaurant_status NOT NULL DEFAULT 'closed',
  approval_status approval_status   NOT NULL DEFAULT 'pending',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS restaurant_hours (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid      NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  day_of_week   smallint  NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  open_time     time,
  close_time    time,
  is_closed     boolean   NOT NULL DEFAULT false,
  UNIQUE (restaurant_id, day_of_week)
);

CREATE TABLE IF NOT EXISTS categories (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL UNIQUE,
  slug       text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS restaurant_categories (
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  category_id   uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (restaurant_id, category_id)
);

CREATE TABLE IF NOT EXISTS food_categories (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid    NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name          text    NOT NULL,
  display_order int     NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS food_items (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id    uuid          NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  food_category_id uuid          REFERENCES food_categories(id) ON DELETE SET NULL,
  name             text          NOT NULL,
  description      text,
  price            numeric(10,2) NOT NULL CHECK (price > 0),
  is_veg           boolean       NOT NULL DEFAULT true,
  is_available     boolean       NOT NULL DEFAULT true,
  display_order    int           NOT NULL DEFAULT 0,
  created_at       timestamptz   NOT NULL DEFAULT now(),
  updated_at       timestamptz   NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS food_images (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  food_item_id uuid    NOT NULL REFERENCES food_items(id) ON DELETE CASCADE,
  storage_path text    NOT NULL,
  is_primary   boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS addresses (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid    NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label       text    NOT NULL,
  line1       text    NOT NULL,
  line2       text,
  city        text    NOT NULL,
  pincode     text    NOT NULL,
  landmark    text,
  is_default  boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);


-- ── 3. Cart Tables ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS carts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id   uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  restaurant_id uuid REFERENCES restaurants(id),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cart_items (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id             uuid          NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  food_item_id        uuid          NOT NULL REFERENCES food_items(id) ON DELETE CASCADE,
  quantity            int           NOT NULL CHECK (quantity > 0),
  unit_price_snapshot numeric(10,2) NOT NULL,
  created_at          timestamptz   NOT NULL DEFAULT now(),
  updated_at          timestamptz   NOT NULL DEFAULT now()
);


-- ── 4. Order Tables ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS orders (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id         uuid          NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  restaurant_id       uuid          NOT NULL REFERENCES restaurants(id) ON DELETE RESTRICT,
  delivery_address_id uuid          NOT NULL REFERENCES addresses(id) ON DELETE RESTRICT,
  status              order_status  NOT NULL DEFAULT 'placed',
  payment_method      payment_method NOT NULL DEFAULT 'cod',
  subtotal            numeric(10,2) NOT NULL,
  total               numeric(10,2) NOT NULL,
  customer_note       text,
  rejection_reason    text,
  placed_at           timestamptz   NOT NULL DEFAULT now(),
  updated_at          timestamptz   NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id            uuid          NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  food_item_id        uuid          REFERENCES food_items(id) ON DELETE SET NULL,
  food_name_snapshot  text          NOT NULL,
  unit_price_snapshot numeric(10,2) NOT NULL,
  quantity            int           NOT NULL CHECK (quantity > 0),
  line_total          numeric(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS order_status_history (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   uuid         NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status     order_status NOT NULL,
  changed_by uuid         NOT NULL REFERENCES profiles(id),
  note       text,
  created_at timestamptz  NOT NULL DEFAULT now()
);


-- ── 5. Notifications & Platform Tables ──────────────────────

CREATE TABLE IF NOT EXISTS notifications (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id     uuid              NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type             notification_type NOT NULL,
  title            text              NOT NULL,
  body             text              NOT NULL,
  related_order_id uuid              REFERENCES orders(id),
  is_read          boolean           NOT NULL DEFAULT false,
  created_at       timestamptz       NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    uuid REFERENCES profiles(id),
  action      text NOT NULL,
  entity_type text NOT NULL,
  entity_id   uuid NOT NULL,
  metadata    jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS settings (
  key        text PRIMARY KEY,
  value      jsonb       NOT NULL,
  updated_by uuid        NOT NULL REFERENCES profiles(id),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reviews (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      uuid     NOT NULL REFERENCES orders(id),
  customer_id   uuid     NOT NULL REFERENCES profiles(id),
  restaurant_id uuid     NOT NULL REFERENCES restaurants(id),
  rating        smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment       text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (order_id)
);

CREATE TABLE IF NOT EXISTS coupons (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id  uuid REFERENCES restaurants(id),
  code           text          NOT NULL UNIQUE,
  discount_type  discount_type NOT NULL,
  discount_value numeric(10,2) NOT NULL,
  valid_from     timestamptz   NOT NULL,
  valid_to       timestamptz   NOT NULL,
  is_active      boolean       NOT NULL DEFAULT true
);


-- ── 6. Indexes (Safe Create) ────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_restaurants_owner       ON restaurants(owner_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_approval    ON restaurants(approval_status);
CREATE INDEX IF NOT EXISTS idx_restaurants_city        ON restaurants(city);
CREATE INDEX IF NOT EXISTS idx_food_items_restaurant   ON food_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_food_items_category     ON food_items(food_category_id);
CREATE INDEX IF NOT EXISTS idx_food_items_available    ON food_items(restaurant_id, is_available);
CREATE INDEX IF NOT EXISTS idx_food_categories_rest    ON food_categories(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_addresses_customer      ON addresses(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer         ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant       ON orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status           ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_placed_at        ON orders(placed_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order       ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_history_order     ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id, is_read);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity       ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart         ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_food_images_item       ON food_images(food_item_id);


-- ── 7. Functions & Triggers (Safe Replace) ──────────────────

-- Auto-create profiles row on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  user_phone text;
  assigned_role public.user_role;
BEGIN
  user_phone := NULLIF(TRIM(NEW.raw_user_meta_data->>'phone'), '');

  BEGIN
    assigned_role := (NEW.raw_user_meta_data->>'role')::public.user_role;
  EXCEPTION WHEN OTHERS THEN
    assigned_role := 'customer'::public.user_role;
  END;

  IF assigned_role IS NULL THEN
    assigned_role := 'customer'::public.user_role;
  END IF;

  INSERT INTO public.profiles (id, full_name, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''), 'User'),
    user_phone,
    assigned_role
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = COALESCE(EXCLUDED.phone, profiles.phone),
    role = EXCLUDED.role;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- Enforce valid order status transitions
CREATE OR REPLACE FUNCTION enforce_order_status_transition()
RETURNS trigger AS $$
BEGIN
  IF OLD.status IN ('delivered', 'cancelled', 'rejected') THEN
    RAISE EXCEPTION 'Order is in a terminal state and cannot be updated';
  END IF;

  IF NOT (
    (OLD.status = 'placed'           AND NEW.status IN ('accepted', 'rejected'))
    OR (OLD.status = 'accepted'      AND NEW.status IN ('preparing', 'cancelled'))
    OR (OLD.status = 'preparing'     AND NEW.status IN ('out_for_delivery', 'cancelled'))
    OR (OLD.status = 'out_for_delivery' AND NEW.status = 'delivered')
  ) THEN
    RAISE EXCEPTION 'Invalid order status transition: % -> %', OLD.status, NEW.status;
  END IF;

  INSERT INTO order_status_history (order_id, status, changed_by)
  VALUES (NEW.id, NEW.status, auth.uid());

  NEW.updated_at := now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_order_status_transition ON orders;
CREATE TRIGGER trg_order_status_transition
  BEFORE UPDATE OF status ON orders
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION enforce_order_status_transition();


-- Auto-update updated_at on row changes (generic)
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_restaurants_updated_at ON restaurants;
CREATE TRIGGER trg_restaurants_updated_at
  BEFORE UPDATE ON restaurants FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_food_items_updated_at ON food_items;
CREATE TRIGGER trg_food_items_updated_at
  BEFORE UPDATE ON food_items FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_carts_updated_at ON carts;
CREATE TRIGGER trg_carts_updated_at
  BEFORE UPDATE ON carts FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_cart_items_updated_at ON cart_items;
CREATE TRIGGER trg_cart_items_updated_at
  BEFORE UPDATE ON cart_items FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();


-- ── 8. Schema Permissions ───────────────────────────────────

GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;

