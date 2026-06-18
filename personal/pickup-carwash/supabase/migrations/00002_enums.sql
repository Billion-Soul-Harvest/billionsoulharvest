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
