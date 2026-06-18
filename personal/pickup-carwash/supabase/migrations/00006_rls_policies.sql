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
