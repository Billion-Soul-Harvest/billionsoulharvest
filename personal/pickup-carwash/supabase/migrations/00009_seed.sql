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
