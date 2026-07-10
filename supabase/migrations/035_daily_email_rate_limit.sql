-- Daily email rate limiting table and helper functions
-- Tracks emails sent per UTC date to enforce Hostinger SMTP 1,000/day limit

CREATE TABLE IF NOT EXISTS daily_email_counts (
  date DATE PRIMARY KEY DEFAULT CURRENT_DATE,
  sent_count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Atomic upsert: increment today's count, return new total
CREATE OR REPLACE FUNCTION increment_daily_email_count(count_to_add INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  new_count INTEGER;
BEGIN
  INSERT INTO daily_email_counts (date, sent_count, updated_at)
  VALUES (CURRENT_DATE, count_to_add, NOW())
  ON CONFLICT (date) DO UPDATE
    SET sent_count = daily_email_counts.sent_count + count_to_add,
        updated_at = NOW()
  RETURNING sent_count INTO new_count;
  RETURN new_count;
END;
$$;

-- Returns remaining quota for today
CREATE OR REPLACE FUNCTION get_daily_email_remaining(daily_limit INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  current_count INTEGER;
BEGIN
  SELECT COALESCE(sent_count, 0) INTO current_count
  FROM daily_email_counts
  WHERE date = CURRENT_DATE;

  IF NOT FOUND THEN
    RETURN daily_limit;
  END IF;

  RETURN GREATEST(daily_limit - current_count, 0);
END;
$$;
