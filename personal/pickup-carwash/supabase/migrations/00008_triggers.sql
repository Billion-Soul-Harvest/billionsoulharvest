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
