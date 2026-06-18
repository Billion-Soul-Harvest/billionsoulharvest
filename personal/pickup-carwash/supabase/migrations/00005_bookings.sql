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
