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
