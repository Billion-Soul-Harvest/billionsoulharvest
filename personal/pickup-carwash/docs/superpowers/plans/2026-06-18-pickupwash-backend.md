# PickupWash Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Supabase backend for PickupWash — database schema, RLS policies, database functions, Edge Functions for payments/notifications, and seed data.

**Architecture:** Supabase (Postgres) with direct client access via RLS. Edge Functions handle Stripe payments, webhook processing, and notifications. No custom REST layer.

**Tech Stack:** Supabase, PostgreSQL, Deno (Edge Functions), Stripe API, Expo Push API, Twilio API

## Global Constraints

- Supabase CLI v1.200+ required
- PostgreSQL 15+ (Supabase default)
- Deno runtime for Edge Functions
- All monetary values in PHP (₱) stored as decimal
- Platform fee fixed at ₱50 for MVP
- 2-hour time slots
- Default slot capacity: 3 jobs per slot
- Geographic scope: Metro Manila only

---

## File Structure

```
pickup-carwash/
├── supabase/
│   ├── config.toml                    # Supabase project config
│   ├── migrations/
│   │   ├── 00001_extensions.sql       # Enable extensions
│   │   ├── 00002_enums.sql            # booking_status enum
│   │   ├── 00003_merchants.sql        # merchants, merchant_hours, packages, slot_overrides
│   │   ├── 00004_customers.sql        # customers, vehicles
│   │   ├── 00005_bookings.sql         # bookings, reviews, notifications
│   │   ├── 00006_rls_policies.sql     # All RLS policies
│   │   ├── 00007_functions.sql        # get_nearby_merchants, get_available_slots
│   │   ├── 00008_triggers.sql         # update_merchant_rating, customer creation
│   │   └── 00009_seed.sql             # Test merchants, customer, bookings
│   └── functions/
│       ├── _shared/
│       │   ├── supabase.ts            # Supabase client helper
│       │   ├── stripe.ts              # Stripe client helper
│       │   ├── cors.ts                # CORS headers
│       │   └── notifications.ts       # Expo Push + Twilio helpers
│       ├── create-payment-intent/
│       │   └── index.ts               # POST: create booking + Stripe PaymentIntent
│       ├── stripe-webhook/
│       │   └── index.ts               # POST: handle Stripe webhooks
│       ├── cancel-booking/
│       │   └── index.ts               # POST: cancel booking + refund
│       └── send-notification/
│           └── index.ts               # Called by DB webhook on status change
├── .env.local                         # Local dev environment variables
└── package.json                       # Scripts for local dev
```

---

### Task 1: Project Initialization

**Files:**
- Create: `supabase/config.toml`
- Create: `package.json`
- Create: `.env.local`
- Create: `.gitignore`

**Interfaces:**
- Produces: Supabase project structure, npm scripts for `supabase start`, `supabase db reset`

- [ ] **Step 1: Initialize Supabase project**

```bash
cd /Users/bertwinromero/Documents/personal/pickup-carwash
supabase init
```

Expected: Creates `supabase/` directory with `config.toml`

- [ ] **Step 2: Create package.json with dev scripts**

```json
{
  "name": "pickup-carwash-backend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "db:start": "supabase start",
    "db:stop": "supabase stop",
    "db:reset": "supabase db reset",
    "db:migrate": "supabase migration up",
    "db:new": "supabase migration new",
    "functions:serve": "supabase functions serve --env-file .env.local",
    "functions:deploy": "supabase functions deploy"
  },
  "devDependencies": {
    "supabase": "^1.200.0"
  }
}
```

- [ ] **Step 3: Create .env.local for local development**

```bash
# Supabase (populated by `supabase start`)
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe (test keys)
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here

# Twilio
TWILIO_ACCOUNT_SID=AC_your_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890

# Platform config
PLATFORM_FEE_PHP=50
```

- [ ] **Step 4: Create .gitignore**

```
# Dependencies
node_modules/

# Environment
.env
.env.local
.env.*.local

# Supabase
supabase/.branches/
supabase/.temp/

# IDE
.idea/
.vscode/
*.swp

# OS
.DS_Store
```

- [ ] **Step 5: Install dependencies and start Supabase**

```bash
npm install
npm run db:start
```

Expected: Supabase local stack starts, outputs ANON_KEY and SERVICE_ROLE_KEY

- [ ] **Step 6: Commit**

```bash
git add package.json .env.local .gitignore supabase/config.toml
git commit -m "chore: initialize Supabase project structure"
```

---

### Task 2: Database Extensions and Enums

**Files:**
- Create: `supabase/migrations/00001_extensions.sql`
- Create: `supabase/migrations/00002_enums.sql`

**Interfaces:**
- Produces: `booking_status` enum type available for use in later migrations

- [ ] **Step 1: Create extensions migration**

Create file `supabase/migrations/00001_extensions.sql`:

```sql
-- Enable PostGIS for future geo optimization (optional but recommended)
-- CREATE EXTENSION IF NOT EXISTS postgis;

-- Enable pgcrypto for UUID generation (usually enabled by default)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enable pg_trgm for text search (optional, for merchant name search)
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

- [ ] **Step 2: Create enums migration**

Create file `supabase/migrations/00002_enums.sql`:

```sql
-- Booking status enum
CREATE TYPE booking_status AS ENUM (
  'pending',      -- Created, awaiting payment
  'confirmed',    -- Paid, awaiting pickup
  'picked_up',    -- Driver has the car
  'in_progress',  -- Wash in progress
  'completed',    -- Car returned
  'cancelled'     -- Cancelled by customer, merchant, or system
);

COMMENT ON TYPE booking_status IS 'Status progression for car wash bookings';
```

- [ ] **Step 3: Run migrations to verify syntax**

```bash
npm run db:reset
```

Expected: Migrations apply successfully, no errors

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/00001_extensions.sql supabase/migrations/00002_enums.sql
git commit -m "feat(db): add extensions and booking_status enum"
```

---

### Task 3: Merchant Tables

**Files:**
- Create: `supabase/migrations/00003_merchants.sql`

**Interfaces:**
- Produces: Tables `merchants`, `merchant_hours`, `packages`, `slot_overrides` with all columns per spec

- [ ] **Step 1: Create merchants migration**

Create file `supabase/migrations/00003_merchants.sql`:

```sql
-- Merchants table
CREATE TABLE merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  cover_image_url TEXT,
  logo_url TEXT,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  phone TEXT,
  email TEXT,
  rating_avg DECIMAL(2, 1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  default_slot_capacity INTEGER DEFAULT 3,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for geo queries (Haversine formula)
CREATE INDEX idx_merchants_location ON merchants (latitude, longitude);

-- Index for slug lookups
CREATE INDEX idx_merchants_slug ON merchants (slug);

-- Index for active merchants
CREATE INDEX idx_merchants_active ON merchants (is_active) WHERE is_active = true;

COMMENT ON TABLE merchants IS 'Car wash businesses offering pickup services';
COMMENT ON COLUMN merchants.slug IS 'URL-friendly unique identifier';
COMMENT ON COLUMN merchants.default_slot_capacity IS 'Max jobs per 2-hour slot, default 3';

-- Merchant operating hours
CREATE TABLE merchant_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  is_closed BOOLEAN DEFAULT false,
  UNIQUE (merchant_id, day_of_week)
);

CREATE INDEX idx_merchant_hours_merchant ON merchant_hours (merchant_id);

COMMENT ON TABLE merchant_hours IS 'Operating hours per day of week (0=Sunday, 6=Saturday)';

-- Packages (wash services offered)
CREATE TABLE packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  pickup_fee DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (pickup_fee >= 0),
  duration_mins INTEGER NOT NULL DEFAULT 60,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_packages_merchant ON packages (merchant_id);
CREATE INDEX idx_packages_active ON packages (merchant_id, is_active) WHERE is_active = true;

COMMENT ON TABLE packages IS 'Wash packages/services offered by merchants';
COMMENT ON COLUMN packages.price IS 'Package price in PHP';
COMMENT ON COLUMN packages.pickup_fee IS 'Additional fee for pickup service in PHP';

-- Slot overrides (merchant blocks or modifies specific slots)
CREATE TABLE slot_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  slot_start TIME NOT NULL,
  slot_end TIME NOT NULL,
  is_blocked BOOLEAN DEFAULT false,
  max_capacity INTEGER CHECK (max_capacity >= 0),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (merchant_id, date, slot_start)
);

CREATE INDEX idx_slot_overrides_lookup ON slot_overrides (merchant_id, date);

COMMENT ON TABLE slot_overrides IS 'Merchant overrides for specific time slots';
COMMENT ON COLUMN slot_overrides.is_blocked IS 'If true, slot is unavailable';
COMMENT ON COLUMN slot_overrides.max_capacity IS 'Override capacity, NULL uses merchant default';
```

- [ ] **Step 2: Run migration**

```bash
npm run db:reset
```

Expected: All tables created successfully

- [ ] **Step 3: Verify tables exist**

```bash
supabase db inspect
```

Expected: Shows merchants, merchant_hours, packages, slot_overrides tables

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/00003_merchants.sql
git commit -m "feat(db): add merchants, merchant_hours, packages, slot_overrides tables"
```

---

### Task 4: Customer Tables

**Files:**
- Create: `supabase/migrations/00004_customers.sql`

**Interfaces:**
- Produces: Tables `customers`, `vehicles` linked to auth.users

- [ ] **Step 1: Create customers migration**

Create file `supabase/migrations/00004_customers.sql`:

```sql
-- Customers table (extends auth.users)
CREATE TABLE customers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  phone_verified BOOLEAN DEFAULT false,
  avatar_url TEXT,
  expo_push_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_customers_phone ON customers (phone) WHERE phone IS NOT NULL;

COMMENT ON TABLE customers IS 'Customer profiles extending auth.users';
COMMENT ON COLUMN customers.expo_push_token IS 'Expo push notification token';

-- Vehicles
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  color TEXT,
  plate_number TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vehicles_customer ON vehicles (customer_id);

COMMENT ON TABLE vehicles IS 'Customer vehicles for identification during pickup';

-- Function to create customer profile on auth.users insert
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.customers (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

-- Trigger to auto-create customer on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

COMMENT ON FUNCTION handle_new_user IS 'Auto-creates customer profile when user signs up';
```

- [ ] **Step 2: Run migration**

```bash
npm run db:reset
```

Expected: Tables created, trigger attached to auth.users

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/00004_customers.sql
git commit -m "feat(db): add customers and vehicles tables with auth trigger"
```

---

### Task 5: Booking Tables

**Files:**
- Create: `supabase/migrations/00005_bookings.sql`

**Interfaces:**
- Produces: Tables `bookings`, `reviews`, `notifications` with all columns per spec

- [ ] **Step 1: Create bookings migration**

Create file `supabase/migrations/00005_bookings.sql`:

```sql
-- Bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE RESTRICT,
  package_id UUID NOT NULL REFERENCES packages(id) ON DELETE RESTRICT,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  status booking_status NOT NULL DEFAULT 'pending',
  pickup_address TEXT NOT NULL,
  pickup_lat DECIMAL(10, 7) NOT NULL,
  pickup_lng DECIMAL(10, 7) NOT NULL,
  pickup_date DATE NOT NULL,
  pickup_slot TEXT NOT NULL,
  driver_note TEXT,
  package_price DECIMAL(10, 2) NOT NULL,
  pickup_fee DECIMAL(10, 2) NOT NULL,
  platform_fee DECIMAL(10, 2) NOT NULL DEFAULT 50,
  total_amount DECIMAL(10, 2) NOT NULL,
  stripe_payment_intent_id TEXT,
  cancelled_by TEXT CHECK (cancelled_by IN ('customer', 'merchant', 'system')),
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for slot availability queries
CREATE INDEX idx_bookings_slot_availability ON bookings (merchant_id, pickup_date, status);

-- Index for customer booking history
CREATE INDEX idx_bookings_customer ON bookings (customer_id, created_at DESC);

-- Index for Stripe payment intent lookups
CREATE INDEX idx_bookings_stripe ON bookings (stripe_payment_intent_id) WHERE stripe_payment_intent_id IS NOT NULL;

COMMENT ON TABLE bookings IS 'Car wash pickup bookings';
COMMENT ON COLUMN bookings.pickup_slot IS 'Time slot string, e.g., "08:00:00-10:00:00"';
COMMENT ON COLUMN bookings.platform_fee IS 'PickupWash platform fee, fixed at 50 PHP for MVP';

-- Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reviews_merchant ON reviews (merchant_id, created_at DESC);
CREATE INDEX idx_reviews_customer ON reviews (customer_id);

COMMENT ON TABLE reviews IS 'Customer reviews for completed bookings (one per booking)';

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_customer ON notifications (customer_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications (customer_id, is_read) WHERE is_read = false;

COMMENT ON TABLE notifications IS 'In-app notification history';
COMMENT ON COLUMN notifications.type IS 'Notification type: booking_confirmed, car_picked_up, etc.';
```

- [ ] **Step 2: Run migration**

```bash
npm run db:reset
```

Expected: All tables created successfully

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/00005_bookings.sql
git commit -m "feat(db): add bookings, reviews, notifications tables"
```

---

### Task 6: RLS Policies

**Files:**
- Create: `supabase/migrations/00006_rls_policies.sql`

**Interfaces:**
- Produces: RLS enabled on all tables with policies per spec

- [ ] **Step 1: Create RLS policies migration**

Create file `supabase/migrations/00006_rls_policies.sql`:

```sql
-- Enable RLS on all tables
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchant_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE slot_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- =====================
-- PUBLIC READ POLICIES
-- =====================

-- Merchants: public read for active merchants
CREATE POLICY "merchants_public_read" ON merchants
  FOR SELECT USING (is_active = true);

-- Packages: public read for active packages
CREATE POLICY "packages_public_read" ON packages
  FOR SELECT USING (is_active = true);

-- Merchant hours: public read
CREATE POLICY "merchant_hours_public_read" ON merchant_hours
  FOR SELECT USING (true);

-- Slot overrides: public read (needed to calculate availability)
CREATE POLICY "slot_overrides_public_read" ON slot_overrides
  FOR SELECT USING (true);

-- Reviews: public read
CREATE POLICY "reviews_public_read" ON reviews
  FOR SELECT USING (true);

-- =====================
-- CUSTOMER POLICIES
-- =====================

-- Customers: read/update own record only
CREATE POLICY "customers_select_own" ON customers
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "customers_update_own" ON customers
  FOR UPDATE USING (id = auth.uid());

-- Vehicles: full access to own vehicles
CREATE POLICY "vehicles_select_own" ON vehicles
  FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "vehicles_insert_own" ON vehicles
  FOR INSERT WITH CHECK (customer_id = auth.uid());

CREATE POLICY "vehicles_update_own" ON vehicles
  FOR UPDATE USING (customer_id = auth.uid());

CREATE POLICY "vehicles_delete_own" ON vehicles
  FOR DELETE USING (customer_id = auth.uid());

-- =====================
-- BOOKING POLICIES
-- =====================

-- Bookings: customers see their own
CREATE POLICY "bookings_select_own" ON bookings
  FOR SELECT USING (customer_id = auth.uid());

-- Bookings: customers can insert for themselves
CREATE POLICY "bookings_insert_own" ON bookings
  FOR INSERT WITH CHECK (customer_id = auth.uid());

-- Note: Status updates are done via Edge Functions using service_role key

-- =====================
-- REVIEW POLICIES
-- =====================

-- Reviews: customers can insert for their completed bookings
CREATE POLICY "reviews_insert_own" ON reviews
  FOR INSERT WITH CHECK (
    customer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = booking_id
      AND bookings.customer_id = auth.uid()
      AND bookings.status = 'completed'
    )
  );

-- Reviews: customers can update their own
CREATE POLICY "reviews_update_own" ON reviews
  FOR UPDATE USING (customer_id = auth.uid());

-- Reviews: customers can delete their own
CREATE POLICY "reviews_delete_own" ON reviews
  FOR DELETE USING (customer_id = auth.uid());

-- =====================
-- NOTIFICATION POLICIES
-- =====================

-- Notifications: full access to own
CREATE POLICY "notifications_select_own" ON notifications
  FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "notifications_update_own" ON notifications
  FOR UPDATE USING (customer_id = auth.uid());

-- Note: Insert is done via Edge Functions using service_role key
```

- [ ] **Step 2: Run migration**

```bash
npm run db:reset
```

Expected: RLS enabled on all tables, policies created

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/00006_rls_policies.sql
git commit -m "feat(db): add RLS policies for all tables"
```

---

### Task 7: Database Functions

**Files:**
- Create: `supabase/migrations/00007_functions.sql`

**Interfaces:**
- Produces: Functions `get_nearby_merchants(user_lat, user_lng, radius_km)` and `get_available_slots(p_merchant_id, p_date)`

- [ ] **Step 1: Create functions migration**

Create file `supabase/migrations/00007_functions.sql`:

```sql
-- =====================
-- GET NEARBY MERCHANTS
-- =====================

CREATE OR REPLACE FUNCTION get_nearby_merchants(
  user_lat DECIMAL,
  user_lng DECIMAL,
  radius_km DECIMAL DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  cover_image_url TEXT,
  logo_url TEXT,
  address TEXT,
  rating_avg DECIMAL,
  review_count INTEGER,
  distance_km DECIMAL,
  starting_price DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.name,
    m.slug,
    m.cover_image_url,
    m.logo_url,
    m.address,
    m.rating_avg,
    m.review_count,
    (
      6371 * acos(
        LEAST(1.0, GREATEST(-1.0,
          cos(radians(user_lat)) * cos(radians(m.latitude)) *
          cos(radians(m.longitude) - radians(user_lng)) +
          sin(radians(user_lat)) * sin(radians(m.latitude))
        ))
      )
    )::DECIMAL AS distance_km,
    (SELECT MIN(p.price) FROM packages p WHERE p.merchant_id = m.id AND p.is_active) AS starting_price
  FROM merchants m
  WHERE m.is_active = true
  AND (
    6371 * acos(
      LEAST(1.0, GREATEST(-1.0,
        cos(radians(user_lat)) * cos(radians(m.latitude)) *
        cos(radians(m.longitude) - radians(user_lng)) +
        sin(radians(user_lat)) * sin(radians(m.latitude))
      ))
    )
  ) <= radius_km
  ORDER BY distance_km;
END;
$$;

COMMENT ON FUNCTION get_nearby_merchants IS 'Returns active merchants within radius_km of given coordinates, sorted by distance';

-- =====================
-- GET AVAILABLE SLOTS
-- =====================

CREATE OR REPLACE FUNCTION get_available_slots(
  p_merchant_id UUID,
  p_date DATE
)
RETURNS TABLE (
  slot_start TIME,
  slot_end TIME,
  slot_label TEXT,
  available BOOLEAN,
  remaining INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_day_of_week INTEGER;
  v_open_time TIME;
  v_close_time TIME;
  v_slot_start TIME;
  v_slot_end TIME;
  v_default_capacity INTEGER;
  v_booked_count INTEGER;
  v_override_capacity INTEGER;
  v_is_blocked BOOLEAN;
  v_slot_label TEXT;
BEGIN
  -- Get day of week (0=Sunday)
  v_day_of_week := EXTRACT(DOW FROM p_date);

  -- Get operating hours for this day
  SELECT mh.open_time, mh.close_time INTO v_open_time, v_close_time
  FROM merchant_hours mh
  WHERE mh.merchant_id = p_merchant_id
    AND mh.day_of_week = v_day_of_week
    AND NOT mh.is_closed;

  -- If closed, return empty result
  IF v_open_time IS NULL THEN
    RETURN;
  END IF;

  -- Get default capacity from merchant
  SELECT m.default_slot_capacity INTO v_default_capacity
  FROM merchants m
  WHERE m.id = p_merchant_id;

  v_default_capacity := COALESCE(v_default_capacity, 3);

  -- Generate 2-hour slots
  v_slot_start := v_open_time;

  WHILE v_slot_start < v_close_time LOOP
    v_slot_end := v_slot_start + INTERVAL '2 hours';

    -- Cap at close time
    IF v_slot_end > v_close_time THEN
      v_slot_end := v_close_time;
    END IF;

    -- Create slot label (e.g., "08:00:00-10:00:00")
    v_slot_label := v_slot_start::TEXT || '-' || v_slot_end::TEXT;

    -- Check for override
    SELECT so.is_blocked, so.max_capacity INTO v_is_blocked, v_override_capacity
    FROM slot_overrides so
    WHERE so.merchant_id = p_merchant_id
      AND so.date = p_date
      AND so.slot_start = v_slot_start;

    -- If blocked, return slot as unavailable
    IF COALESCE(v_is_blocked, false) THEN
      slot_start := v_slot_start;
      slot_end := v_slot_end;
      slot_label := v_slot_label;
      available := false;
      remaining := 0;
      RETURN NEXT;
    ELSE
      -- Count existing non-cancelled bookings for this slot
      SELECT COUNT(*)::INTEGER INTO v_booked_count
      FROM bookings b
      WHERE b.merchant_id = p_merchant_id
        AND b.pickup_date = p_date
        AND b.pickup_slot = v_slot_label
        AND b.status != 'cancelled';

      slot_start := v_slot_start;
      slot_end := v_slot_end;
      slot_label := v_slot_label;
      remaining := COALESCE(v_override_capacity, v_default_capacity) - v_booked_count;
      available := remaining > 0;
      RETURN NEXT;
    END IF;

    v_slot_start := v_slot_end;
  END LOOP;
END;
$$;

COMMENT ON FUNCTION get_available_slots IS 'Returns 2-hour time slots for a merchant on a given date with availability';
```

- [ ] **Step 2: Run migration**

```bash
npm run db:reset
```

Expected: Functions created successfully

- [ ] **Step 3: Test get_nearby_merchants function**

```bash
supabase db query "SELECT * FROM get_nearby_merchants(14.5547, 121.0244, 20);"
```

Expected: Empty result (no merchants seeded yet), no errors

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/00007_functions.sql
git commit -m "feat(db): add get_nearby_merchants and get_available_slots functions"
```

---

### Task 8: Triggers

**Files:**
- Create: `supabase/migrations/00008_triggers.sql`

**Interfaces:**
- Produces: Trigger `trigger_update_merchant_rating` on reviews table, trigger for updated_at columns

- [ ] **Step 1: Create triggers migration**

Create file `supabase/migrations/00008_triggers.sql`:

```sql
-- =====================
-- UPDATE MERCHANT RATING TRIGGER
-- =====================

CREATE OR REPLACE FUNCTION update_merchant_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_merchant_id UUID;
BEGIN
  -- Get merchant_id from either NEW or OLD depending on operation
  IF TG_OP = 'DELETE' THEN
    v_merchant_id := OLD.merchant_id;
  ELSE
    v_merchant_id := NEW.merchant_id;
  END IF;

  UPDATE merchants
  SET
    rating_avg = COALESCE(
      (SELECT ROUND(AVG(r.rating)::NUMERIC, 1) FROM reviews r WHERE r.merchant_id = v_merchant_id),
      0
    ),
    review_count = (SELECT COUNT(*) FROM reviews r WHERE r.merchant_id = v_merchant_id),
    updated_at = NOW()
  WHERE id = v_merchant_id;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

CREATE TRIGGER trigger_update_merchant_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_merchant_rating();

COMMENT ON FUNCTION update_merchant_rating IS 'Recalculates merchant rating_avg and review_count on review changes';

-- =====================
-- UPDATED_AT TRIGGER
-- =====================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply to tables with updated_at column
CREATE TRIGGER trigger_merchants_updated_at
  BEFORE UPDATE ON merchants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

COMMENT ON FUNCTION update_updated_at IS 'Auto-updates updated_at timestamp on row update';
```

- [ ] **Step 2: Run migration**

```bash
npm run db:reset
```

Expected: Triggers created successfully

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/00008_triggers.sql
git commit -m "feat(db): add merchant rating and updated_at triggers"
```

---

### Task 9: Seed Data

**Files:**
- Create: `supabase/migrations/00009_seed.sql`

**Interfaces:**
- Produces: 5 test merchants with packages, hours, reviews; 1 test customer with vehicles and bookings

- [ ] **Step 1: Create seed migration**

Create file `supabase/migrations/00009_seed.sql`:

```sql
-- =====================
-- SEED MERCHANTS
-- =====================

-- SparkleWash BGC
INSERT INTO merchants (id, name, slug, description, address, latitude, longitude, phone, email, is_active, default_slot_capacity)
VALUES (
  'a1111111-1111-1111-1111-111111111111',
  'SparkleWash BGC',
  'sparklewash-bgc',
  'Premium car wash services in the heart of BGC. We use eco-friendly products and offer a 100% satisfaction guarantee.',
  '32nd Street, Bonifacio Global City, Taguig, Metro Manila',
  14.5547,
  121.0509,
  '+639171234001',
  'sparklewash@example.com',
  true,
  3
);

-- CleanRide Makati
INSERT INTO merchants (id, name, slug, description, address, latitude, longitude, phone, email, is_active, default_slot_capacity)
VALUES (
  'a2222222-2222-2222-2222-222222222222',
  'CleanRide Makati',
  'cleanride-makati',
  'Fast, reliable car wash in Makati CBD. Perfect for busy professionals who value their time.',
  'Ayala Avenue, Makati City, Metro Manila',
  14.5504,
  121.0244,
  '+639171234002',
  'cleanride@example.com',
  true,
  3
);

-- AutoSpa Ortigas
INSERT INTO merchants (id, name, slug, description, address, latitude, longitude, phone, email, is_active, default_slot_capacity)
VALUES (
  'a3333333-3333-3333-3333-333333333333',
  'AutoSpa Ortigas',
  'autospa-ortigas',
  'Full-service auto spa with detailing experts. Your car deserves the best care.',
  'Ortigas Center, Pasig City, Metro Manila',
  14.5873,
  121.0615,
  '+639171234003',
  'autospa@example.com',
  true,
  3
);

-- WashMasters QC
INSERT INTO merchants (id, name, slug, description, address, latitude, longitude, phone, email, is_active, default_slot_capacity)
VALUES (
  'a4444444-4444-4444-4444-444444444444',
  'WashMasters QC',
  'washmasters-qc',
  'Affordable quality car wash in Quezon City. Great value for money.',
  'Tomas Morato, Quezon City, Metro Manila',
  14.6274,
  121.0349,
  '+639171234004',
  'washmasters@example.com',
  true,
  3
);

-- DetailPro Pasig
INSERT INTO merchants (id, name, slug, description, address, latitude, longitude, phone, email, is_active, default_slot_capacity)
VALUES (
  'a5555555-5555-5555-5555-555555555555',
  'DetailPro Pasig',
  'detailpro-pasig',
  'Professional detailing services. From basic wash to full interior/exterior restoration.',
  'Kapitolyo, Pasig City, Metro Manila',
  14.5764,
  121.0611,
  '+639171234005',
  'detailpro@example.com',
  true,
  3
);

-- =====================
-- SEED MERCHANT HOURS (Mon-Sat 7AM-7PM, Closed Sunday)
-- =====================

-- For each merchant, add hours for Mon-Sat (day 1-6)
DO $$
DECLARE
  merchant_ids UUID[] := ARRAY[
    'a1111111-1111-1111-1111-111111111111',
    'a2222222-2222-2222-2222-222222222222',
    'a3333333-3333-3333-3333-333333333333',
    'a4444444-4444-4444-4444-444444444444',
    'a5555555-5555-5555-5555-555555555555'
  ];
  m_id UUID;
  d INTEGER;
BEGIN
  FOREACH m_id IN ARRAY merchant_ids LOOP
    -- Sunday (0) - closed
    INSERT INTO merchant_hours (merchant_id, day_of_week, open_time, close_time, is_closed)
    VALUES (m_id, 0, '07:00', '19:00', true);

    -- Monday-Saturday (1-6) - open
    FOR d IN 1..6 LOOP
      INSERT INTO merchant_hours (merchant_id, day_of_week, open_time, close_time, is_closed)
      VALUES (m_id, d, '07:00', '19:00', false);
    END LOOP;
  END LOOP;
END $$;

-- =====================
-- SEED PACKAGES
-- =====================

-- SparkleWash BGC packages
INSERT INTO packages (merchant_id, name, description, price, pickup_fee, duration_mins, sort_order) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'Basic Wash', 'Exterior wash, tire cleaning, window cleaning', 350, 100, 45, 1),
  ('a1111111-1111-1111-1111-111111111111', 'Standard Wash', 'Basic + interior vacuum, dashboard wipe', 550, 100, 60, 2),
  ('a1111111-1111-1111-1111-111111111111', 'Deluxe Wash', 'Standard + full interior cleaning, air freshener', 850, 100, 90, 3);

-- CleanRide Makati packages
INSERT INTO packages (merchant_id, name, description, price, pickup_fee, duration_mins, sort_order) VALUES
  ('a2222222-2222-2222-2222-222222222222', 'Express Wash', 'Quick exterior wash, 30-minute service', 300, 80, 30, 1),
  ('a2222222-2222-2222-2222-222222222222', 'Full Service', 'Complete interior and exterior cleaning', 600, 80, 75, 2),
  ('a2222222-2222-2222-2222-222222222222', 'Premium', 'Full service + wax coating, leather care', 900, 80, 120, 3);

-- AutoSpa Ortigas packages
INSERT INTO packages (merchant_id, name, description, price, pickup_fee, duration_mins, sort_order) VALUES
  ('a3333333-3333-3333-3333-333333333333', 'Quick Wash', 'Basic exterior cleaning', 280, 90, 30, 1),
  ('a3333333-3333-3333-3333-333333333333', 'Complete', 'Full interior and exterior with vacuum', 500, 90, 60, 2),
  ('a3333333-3333-3333-3333-333333333333', 'Executive', 'Premium detailing with hand wax', 750, 90, 90, 3);

-- WashMasters QC packages
INSERT INTO packages (merchant_id, name, description, price, pickup_fee, duration_mins, sort_order) VALUES
  ('a4444444-4444-4444-4444-444444444444', 'Budget Wash', 'Affordable exterior clean', 250, 70, 30, 1),
  ('a4444444-4444-4444-4444-444444444444', 'Regular', 'Standard full wash package', 450, 70, 60, 2),
  ('a4444444-4444-4444-4444-444444444444', 'VIP', 'Complete detail with polish', 700, 70, 90, 3);

-- DetailPro Pasig packages
INSERT INTO packages (merchant_id, name, description, price, pickup_fee, duration_mins, sort_order) VALUES
  ('a5555555-5555-5555-5555-555555555555', 'Exterior Only', 'Exterior wash and dry', 200, 100, 30, 1),
  ('a5555555-5555-5555-5555-555555555555', 'Interior + Exterior', 'Complete cleaning inside and out', 450, 100, 60, 2),
  ('a5555555-5555-5555-5555-555555555555', 'Full Detail', 'Professional detailing, clay bar, sealant', 1200, 100, 180, 3);

-- =====================
-- SEED TEST CUSTOMER
-- =====================

-- Note: The actual auth.users entry will be created via Supabase Auth API
-- For local testing, we insert directly (won't work in production without auth)

-- This creates a test customer assuming auth user exists
-- In production, customers are created via the handle_new_user trigger

-- For seed data testing, we'll create reviews using a placeholder customer
-- The actual test customer will be created when signing up via the app

-- =====================
-- SEED SAMPLE REVIEWS
-- =====================

-- Note: In production, reviews require a customer and completed booking
-- For seed data, we skip reviews until we have actual test customers
-- The merchant rating trigger will update ratings when reviews are added

-- Update merchants with initial rating of 0 (no reviews yet)
UPDATE merchants SET rating_avg = 0, review_count = 0;
```

- [ ] **Step 2: Run migration**

```bash
npm run db:reset
```

Expected: Seed data inserted successfully

- [ ] **Step 3: Verify seed data**

```bash
supabase db query "SELECT name, address, (SELECT COUNT(*) FROM packages p WHERE p.merchant_id = m.id) as package_count FROM merchants m;"
```

Expected: 5 merchants with 3 packages each

- [ ] **Step 4: Test get_nearby_merchants with seeded data**

```bash
supabase db query "SELECT name, distance_km, starting_price FROM get_nearby_merchants(14.5547, 121.0244, 20);"
```

Expected: List of merchants sorted by distance from BGC coordinates

- [ ] **Step 5: Test get_available_slots**

```bash
supabase db query "SELECT * FROM get_available_slots('a1111111-1111-1111-1111-111111111111', CURRENT_DATE + 1);"
```

Expected: 6 time slots (7-9, 9-11, 11-13, 13-15, 15-17, 17-19) if tomorrow is Mon-Sat; empty if Sunday

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/00009_seed.sql
git commit -m "feat(db): add seed data with 5 merchants and packages"
```

---

### Task 10: Edge Function Shared Utilities

**Files:**
- Create: `supabase/functions/_shared/supabase.ts`
- Create: `supabase/functions/_shared/stripe.ts`
- Create: `supabase/functions/_shared/cors.ts`
- Create: `supabase/functions/_shared/notifications.ts`

**Interfaces:**
- Produces:
  - `createSupabaseClient(req): SupabaseClient` - client with user context
  - `createSupabaseAdmin(): SupabaseClient` - service role client
  - `createStripeClient(): Stripe`
  - `corsHeaders: Headers` - CORS headers for responses
  - `sendPushNotification(token, title, body, data): Promise<void>`
  - `sendSms(phone, message): Promise<void>`

- [ ] **Step 1: Create Supabase client helper**

Create file `supabase/functions/_shared/supabase.ts`:

```typescript
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export function createSupabaseClient(req: Request): SupabaseClient {
  const authHeader = req.headers.get("Authorization");

  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    {
      global: {
        headers: { Authorization: authHeader ?? "" },
      },
    }
  );
}

export function createSupabaseAdmin(): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
```

- [ ] **Step 2: Create Stripe client helper**

Create file `supabase/functions/_shared/stripe.ts`:

```typescript
import Stripe from "https://esm.sh/stripe@14?target=deno";

export function createStripeClient(): Stripe {
  return new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
    apiVersion: "2023-10-16",
    httpClient: Stripe.createFetchHttpClient(),
  });
}

export function getStripeWebhookSecret(): string {
  return Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";
}
```

- [ ] **Step 3: Create CORS headers helper**

Create file `supabase/functions/_shared/cors.ts`:

```typescript
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

export function handleCors(req: Request): Response | null {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  return null;
}

export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ error: message }, status);
}
```

- [ ] **Step 4: Create notifications helper**

Create file `supabase/functions/_shared/notifications.ts`:

```typescript
interface PushNotificationPayload {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: string;
}

export async function sendPushNotification(
  expoPushToken: string,
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<void> {
  if (!expoPushToken) {
    console.log("No push token, skipping push notification");
    return;
  }

  const payload: PushNotificationPayload = {
    to: expoPushToken,
    title,
    body,
    data,
    sound: "default",
  };

  try {
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Expo push error:", errorText);
    }
  } catch (error) {
    console.error("Failed to send push notification:", error);
  }
}

export async function sendSms(phone: string, message: string): Promise<void> {
  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const fromNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

  if (!accountSid || !authToken || !fromNumber) {
    console.log("Twilio not configured, skipping SMS");
    return;
  }

  if (!phone) {
    console.log("No phone number, skipping SMS");
    return;
  }

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Authorization": `Basic ${btoa(`${accountSid}:${authToken}`)}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: phone,
          From: fromNumber,
          Body: message,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Twilio SMS error:", errorText);
    }
  } catch (error) {
    console.error("Failed to send SMS:", error);
  }
}

export const NOTIFICATION_TEMPLATES = {
  confirmed: {
    title: "Booking Confirmed",
    body: (merchantName: string, date: string) =>
      `Your booking at ${merchantName} on ${date} is confirmed.`,
  },
  picked_up: {
    title: "Car Picked Up",
    body: () => "Your car has been picked up. We'll return it fresh!",
  },
  in_progress: {
    title: "Wash In Progress",
    body: (merchantName: string) => `Your car is being washed at ${merchantName}.`,
  },
  completed: {
    title: "Car Returned",
    body: (merchantName: string) =>
      `Your car is back! Rate your experience with ${merchantName}.`,
  },
  cancelled: {
    title: "Booking Cancelled",
    body: (merchantName: string) =>
      `Your booking at ${merchantName} was cancelled. Refund on the way.`,
  },
} as const;
```

- [ ] **Step 5: Commit**

```bash
git add supabase/functions/_shared/
git commit -m "feat(functions): add shared utilities for Supabase, Stripe, CORS, notifications"
```

---

### Task 11: Create Payment Intent Edge Function

**Files:**
- Create: `supabase/functions/create-payment-intent/index.ts`

**Interfaces:**
- Consumes: `createSupabaseClient`, `createSupabaseAdmin`, `createStripeClient`, `corsHeaders`, `handleCors`, `jsonResponse`, `errorResponse`
- Produces: POST endpoint that creates booking + Stripe PaymentIntent, returns `{ bookingId, clientSecret, totalAmount }`

- [ ] **Step 1: Create the Edge Function**

Create file `supabase/functions/create-payment-intent/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createSupabaseClient, createSupabaseAdmin } from "../_shared/supabase.ts";
import { createStripeClient } from "../_shared/stripe.ts";
import { handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";

interface CreatePaymentIntentRequest {
  merchantId: string;
  packageId: string;
  vehicleId?: string;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  pickupDate: string; // YYYY-MM-DD
  pickupSlot: string; // "08:00:00-10:00:00"
  driverNote?: string;
}

const PLATFORM_FEE_PHP = 50;

serve(async (req: Request) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  try {
    // Get user from auth header
    const supabase = createSupabaseClient(req);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    // Parse request body
    const body: CreatePaymentIntentRequest = await req.json();
    const {
      merchantId,
      packageId,
      vehicleId,
      pickupAddress,
      pickupLat,
      pickupLng,
      pickupDate,
      pickupSlot,
      driverNote,
    } = body;

    // Validate required fields
    if (!merchantId || !packageId || !pickupAddress || !pickupLat || !pickupLng || !pickupDate || !pickupSlot) {
      return errorResponse("Missing required fields");
    }

    const admin = createSupabaseAdmin();

    // Check slot availability
    const { data: slots, error: slotsError } = await admin.rpc("get_available_slots", {
      p_merchant_id: merchantId,
      p_date: pickupDate,
    });

    if (slotsError) {
      console.error("Error checking slots:", slotsError);
      return errorResponse("Failed to check slot availability");
    }

    const targetSlot = slots?.find((s: { slot_label: string }) => s.slot_label === pickupSlot);
    if (!targetSlot || !targetSlot.available) {
      return errorResponse("Selected time slot is no longer available");
    }

    // Get package details
    const { data: packageData, error: packageError } = await admin
      .from("packages")
      .select("price, pickup_fee, merchant_id")
      .eq("id", packageId)
      .eq("is_active", true)
      .single();

    if (packageError || !packageData) {
      return errorResponse("Package not found or inactive");
    }

    if (packageData.merchant_id !== merchantId) {
      return errorResponse("Package does not belong to this merchant");
    }

    // Calculate total
    const packagePrice = Number(packageData.price);
    const pickupFee = Number(packageData.pickup_fee);
    const totalAmount = packagePrice + pickupFee + PLATFORM_FEE_PHP;

    // Create Stripe PaymentIntent
    const stripe = createStripeClient();
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Convert to centavos
      currency: "php",
      metadata: {
        merchantId,
        packageId,
        customerId: user.id,
        pickupDate,
        pickupSlot,
      },
    });

    // Create booking with pending status
    const { data: booking, error: bookingError } = await admin
      .from("bookings")
      .insert({
        customer_id: user.id,
        merchant_id: merchantId,
        package_id: packageId,
        vehicle_id: vehicleId || null,
        status: "pending",
        pickup_address: pickupAddress,
        pickup_lat: pickupLat,
        pickup_lng: pickupLng,
        pickup_date: pickupDate,
        pickup_slot: pickupSlot,
        driver_note: driverNote || null,
        package_price: packagePrice,
        pickup_fee: pickupFee,
        platform_fee: PLATFORM_FEE_PHP,
        total_amount: totalAmount,
        stripe_payment_intent_id: paymentIntent.id,
      })
      .select("id")
      .single();

    if (bookingError) {
      console.error("Error creating booking:", bookingError);
      // Cancel the PaymentIntent since booking failed
      await stripe.paymentIntents.cancel(paymentIntent.id);
      return errorResponse("Failed to create booking");
    }

    return jsonResponse({
      bookingId: booking.id,
      clientSecret: paymentIntent.client_secret,
      totalAmount,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return errorResponse("Internal server error", 500);
  }
});
```

- [ ] **Step 2: Commit**

```bash
git add supabase/functions/create-payment-intent/
git commit -m "feat(functions): add create-payment-intent Edge Function"
```

---

### Task 12: Stripe Webhook Edge Function

**Files:**
- Create: `supabase/functions/stripe-webhook/index.ts`

**Interfaces:**
- Consumes: `createSupabaseAdmin`, `createStripeClient`, `getStripeWebhookSecret`, `corsHeaders`
- Produces: POST endpoint that handles `payment_intent.succeeded` and `payment_intent.payment_failed` events

- [ ] **Step 1: Create the Edge Function**

Create file `supabase/functions/stripe-webhook/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createSupabaseAdmin } from "../_shared/supabase.ts";
import { createStripeClient, getStripeWebhookSecret } from "../_shared/stripe.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const stripe = createStripeClient();
  const webhookSecret = getStripeWebhookSecret();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  let event;
  try {
    const body = await req.text();
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new Response(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`, { status: 400 });
  }

  const admin = createSupabaseAdmin();

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        console.log("Payment succeeded:", paymentIntent.id);

        // Update booking status to confirmed
        const { error } = await admin
          .from("bookings")
          .update({
            status: "confirmed",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_payment_intent_id", paymentIntent.id)
          .eq("status", "pending");

        if (error) {
          console.error("Error updating booking:", error);
          return new Response("Failed to update booking", { status: 500 });
        }

        console.log("Booking confirmed for payment intent:", paymentIntent.id);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        console.log("Payment failed:", paymentIntent.id);

        // Update booking status to cancelled
        const { error } = await admin
          .from("bookings")
          .update({
            status: "cancelled",
            cancelled_by: "system",
            cancelled_at: new Date().toISOString(),
            cancellation_reason: "Payment failed",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_payment_intent_id", paymentIntent.id)
          .eq("status", "pending");

        if (error) {
          console.error("Error updating booking:", error);
          return new Response("Failed to update booking", { status: 500 });
        }

        console.log("Booking cancelled due to payment failure:", paymentIntent.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response("Webhook processing failed", { status: 500 });
  }
});
```

- [ ] **Step 2: Commit**

```bash
git add supabase/functions/stripe-webhook/
git commit -m "feat(functions): add stripe-webhook Edge Function"
```

---

### Task 13: Cancel Booking Edge Function

**Files:**
- Create: `supabase/functions/cancel-booking/index.ts`

**Interfaces:**
- Consumes: `createSupabaseClient`, `createSupabaseAdmin`, `createStripeClient`, `handleCors`, `jsonResponse`, `errorResponse`
- Produces: POST endpoint that cancels booking, processes Stripe refund, returns `{ success: true }`

- [ ] **Step 1: Create the Edge Function**

Create file `supabase/functions/cancel-booking/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createSupabaseClient, createSupabaseAdmin } from "../_shared/supabase.ts";
import { createStripeClient } from "../_shared/stripe.ts";
import { handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";

interface CancelBookingRequest {
  bookingId: string;
  cancelledBy: "customer" | "merchant";
  reason?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  try {
    // Get user from auth header
    const supabase = createSupabaseClient(req);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    // Parse request body
    const body: CancelBookingRequest = await req.json();
    const { bookingId, cancelledBy, reason } = body;

    if (!bookingId || !cancelledBy) {
      return errorResponse("Missing required fields");
    }

    const admin = createSupabaseAdmin();

    // Get booking details
    const { data: booking, error: bookingError } = await admin
      .from("bookings")
      .select(`
        id,
        customer_id,
        merchant_id,
        status,
        pickup_date,
        pickup_slot,
        stripe_payment_intent_id,
        total_amount
      `)
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      return errorResponse("Booking not found");
    }

    // Verify ownership for customer cancellation
    if (cancelledBy === "customer" && booking.customer_id !== user.id) {
      return errorResponse("Not authorized to cancel this booking", 403);
    }

    // Check if booking can be cancelled
    if (booking.status !== "confirmed") {
      return errorResponse(`Cannot cancel booking with status: ${booking.status}`);
    }

    // For customer cancellation, check 2-hour window
    if (cancelledBy === "customer") {
      const [slotStartStr] = booking.pickup_slot.split("-");
      const pickupDateTime = new Date(`${booking.pickup_date}T${slotStartStr}`);
      const now = new Date();
      const hoursUntilPickup = (pickupDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (hoursUntilPickup < 2) {
        return errorResponse("Cannot cancel within 2 hours of pickup time");
      }
    }

    // Process Stripe refund
    if (booking.stripe_payment_intent_id) {
      const stripe = createStripeClient();
      try {
        await stripe.refunds.create({
          payment_intent: booking.stripe_payment_intent_id,
        });
        console.log("Refund processed for:", booking.stripe_payment_intent_id);
      } catch (refundError) {
        console.error("Refund failed:", refundError);
        return errorResponse("Failed to process refund");
      }
    }

    // Update booking status
    const { error: updateError } = await admin
      .from("bookings")
      .update({
        status: "cancelled",
        cancelled_by: cancelledBy,
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId);

    if (updateError) {
      console.error("Error updating booking:", updateError);
      return errorResponse("Failed to cancel booking");
    }

    return jsonResponse({ success: true });
  } catch (error) {
    console.error("Unexpected error:", error);
    return errorResponse("Internal server error", 500);
  }
});
```

- [ ] **Step 2: Commit**

```bash
git add supabase/functions/cancel-booking/
git commit -m "feat(functions): add cancel-booking Edge Function with Stripe refund"
```

---

### Task 14: Send Notification Edge Function

**Files:**
- Create: `supabase/functions/send-notification/index.ts`

**Interfaces:**
- Consumes: `createSupabaseAdmin`, `sendPushNotification`, `sendSms`, `NOTIFICATION_TEMPLATES`, `corsHeaders`
- Produces: POST endpoint triggered by DB webhook on booking status change

- [ ] **Step 1: Create the Edge Function**

Create file `supabase/functions/send-notification/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createSupabaseAdmin } from "../_shared/supabase.ts";
import { corsHeaders } from "../_shared/cors.ts";
import {
  sendPushNotification,
  sendSms,
  NOTIFICATION_TEMPLATES,
} from "../_shared/notifications.ts";

interface BookingRecord {
  id: string;
  customer_id: string;
  merchant_id: string;
  status: string;
  pickup_date: string;
}

interface WebhookPayload {
  type: "UPDATE";
  table: "bookings";
  record: BookingRecord;
  old_record: BookingRecord;
}

// Statuses that trigger notifications
const NOTIFY_STATUSES = ["confirmed", "picked_up", "in_progress", "completed", "cancelled"];

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const payload: WebhookPayload = await req.json();

    // Validate webhook payload
    if (payload.type !== "UPDATE" || payload.table !== "bookings") {
      console.log("Ignoring non-booking update webhook");
      return new Response("OK", { status: 200 });
    }

    const { record: booking, old_record: oldBooking } = payload;

    // Check if status changed
    if (booking.status === oldBooking.status) {
      console.log("Status unchanged, skipping notification");
      return new Response("OK", { status: 200 });
    }

    // Check if new status should trigger notification
    if (!NOTIFY_STATUSES.includes(booking.status)) {
      console.log(`Status ${booking.status} does not trigger notification`);
      return new Response("OK", { status: 200 });
    }

    const admin = createSupabaseAdmin();

    // Get customer details
    const { data: customer, error: customerError } = await admin
      .from("customers")
      .select("expo_push_token, phone, full_name")
      .eq("id", booking.customer_id)
      .single();

    if (customerError || !customer) {
      console.error("Customer not found:", customerError);
      return new Response("Customer not found", { status: 404 });
    }

    // Get merchant name
    const { data: merchant, error: merchantError } = await admin
      .from("merchants")
      .select("name")
      .eq("id", booking.merchant_id)
      .single();

    if (merchantError || !merchant) {
      console.error("Merchant not found:", merchantError);
      return new Response("Merchant not found", { status: 404 });
    }

    // Get notification template
    const template = NOTIFICATION_TEMPLATES[booking.status as keyof typeof NOTIFICATION_TEMPLATES];
    if (!template) {
      console.log(`No template for status: ${booking.status}`);
      return new Response("OK", { status: 200 });
    }

    const title = template.title;
    const body = template.body(merchant.name, booking.pickup_date);
    const data = { bookingId: booking.id };

    // Send push notification
    if (customer.expo_push_token) {
      await sendPushNotification(customer.expo_push_token, title, body, data);
      console.log("Push notification sent");
    }

    // Send SMS for critical statuses
    const SMS_STATUSES = ["confirmed", "picked_up", "completed", "cancelled"];
    if (SMS_STATUSES.includes(booking.status) && customer.phone) {
      await sendSms(customer.phone, `PickupWash: ${body}`);
      console.log("SMS sent");
    }

    // Store notification in database
    const { error: notifError } = await admin.from("notifications").insert({
      customer_id: booking.customer_id,
      type: `booking_${booking.status}`,
      title,
      body,
      data,
      is_read: false,
    });

    if (notifError) {
      console.error("Error storing notification:", notifError);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response("Internal server error", { status: 500 });
  }
});
```

- [ ] **Step 2: Commit**

```bash
git add supabase/functions/send-notification/
git commit -m "feat(functions): add send-notification Edge Function for booking status changes"
```

---

### Task 15: Database Webhook for Notifications

**Files:**
- Create: `supabase/migrations/00010_notification_webhook.sql`

**Interfaces:**
- Produces: Database webhook that calls send-notification Edge Function on booking status updates

- [ ] **Step 1: Create webhook migration**

Create file `supabase/migrations/00010_notification_webhook.sql`:

```sql
-- Note: Database webhooks are configured via Supabase Dashboard or CLI
-- This file documents the webhook configuration for reference

/*
Webhook Configuration:
- Name: booking_status_notification
- Table: bookings
- Events: UPDATE
- URL: ${SUPABASE_URL}/functions/v1/send-notification
- Headers:
  - Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}
  - Content-Type: application/json

The webhook payload format:
{
  "type": "UPDATE",
  "table": "bookings",
  "record": { ... new row ... },
  "old_record": { ... old row ... }
}

To configure via Supabase CLI:
supabase secrets set WEBHOOK_SECRET=your_secret

Or configure manually in Supabase Dashboard:
Database > Webhooks > Create Webhook
*/

-- Enable realtime for bookings table (for mobile app subscriptions)
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;

COMMENT ON TABLE bookings IS 'Realtime enabled for mobile app status updates';
```

- [ ] **Step 2: Run migration**

```bash
npm run db:reset
```

Expected: Migration applies, realtime enabled for bookings

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/00010_notification_webhook.sql
git commit -m "feat(db): enable realtime for bookings and document webhook config"
```

---

### Task 16: Test and Verify Complete Setup

**Files:**
- None (verification only)

**Interfaces:**
- Verifies all migrations, functions, and integrations work together

- [ ] **Step 1: Reset database and verify all migrations**

```bash
npm run db:reset
```

Expected: All 10 migrations apply without errors

- [ ] **Step 2: Verify tables exist**

```bash
supabase db query "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;"
```

Expected output:
```
bookings
customers
merchant_hours
merchants
notifications
packages
reviews
slot_overrides
vehicles
```

- [ ] **Step 3: Verify functions exist**

```bash
supabase db query "SELECT proname FROM pg_proc WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public') AND proname LIKE 'get_%';"
```

Expected output:
```
get_available_slots
get_nearby_merchants
```

- [ ] **Step 4: Verify RLS is enabled**

```bash
supabase db query "SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true;"
```

Expected: All 9 tables listed with rowsecurity = true

- [ ] **Step 5: Test get_nearby_merchants function**

```bash
supabase db query "SELECT name, ROUND(distance_km::numeric, 2) as distance_km, starting_price FROM get_nearby_merchants(14.5547, 121.0244, 20);"
```

Expected: 5 merchants with distances and starting prices

- [ ] **Step 6: Test get_available_slots function**

```bash
supabase db query "SELECT slot_label, available, remaining FROM get_available_slots('a1111111-1111-1111-1111-111111111111', CURRENT_DATE + 1);"
```

Expected: 6 slots if tomorrow is Mon-Sat, empty if Sunday

- [ ] **Step 7: Start Edge Functions locally**

```bash
npm run functions:serve
```

Expected: Functions server starts, listening on port 54321

- [ ] **Step 8: Final commit**

```bash
git add -A
git commit -m "chore: complete backend implementation - all migrations and Edge Functions ready"
```

---

## Summary

This plan implements the complete PickupWash backend:

| Component | Status |
|-----------|--------|
| Database schema (9 tables) | Tasks 2-5 |
| RLS policies | Task 6 |
| Database functions | Task 7 |
| Triggers | Task 8 |
| Seed data | Task 9 |
| Shared utilities | Task 10 |
| create-payment-intent | Task 11 |
| stripe-webhook | Task 12 |
| cancel-booking | Task 13 |
| send-notification | Task 14 |
| Webhook config | Task 15 |
| Verification | Task 16 |

**Next Steps after completion:**
1. Configure Stripe webhook in Stripe Dashboard pointing to `/functions/v1/stripe-webhook`
2. Configure database webhook in Supabase Dashboard for notifications
3. Deploy to Supabase cloud with `supabase link` and `supabase db push`
4. Proceed to Sub-project 2: Mobile App
