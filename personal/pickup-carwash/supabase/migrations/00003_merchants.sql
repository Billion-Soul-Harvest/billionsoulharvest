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
