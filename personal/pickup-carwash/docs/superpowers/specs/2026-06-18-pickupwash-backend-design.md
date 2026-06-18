# PickupWash Backend & Data Layer — Design Spec

**Version:** 1.0
**Date:** 2026-06-18
**Sub-project:** 1 of 3 (Backend → Mobile App → Merchant Admin)

---

## 1. Overview

This spec defines the backend and data layer for PickupWash, a car wash pickup and delivery platform. The backend supports:

- Customer authentication and profile management
- Merchant discovery with geo-search
- Time slot availability and booking creation
- Payment processing via Stripe
- Real-time booking status updates
- Push and SMS notifications

---

## 2. Architectural Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Database | Supabase (Postgres) | Managed, realtime subscriptions, built-in auth |
| API approach | Supabase client direct + RLS | Simple, fewer moving parts than custom REST |
| Auth | Supabase Auth | Email/password + phone OTP via Twilio |
| Payments | Stripe Payment Sheet | Pre-built UI, handles 3DS, fastest to ship |
| Push notifications | Expo Push | Free tier, integrated with Expo |
| SMS | Twilio | Supabase Twilio integration for OTP, direct API for transactional |
| Slot management | Computed from hours + overrides | Flexible without pre-generating all slots |
| Geographic scope | Single metro area (Metro Manila) | Simplifies data model for MVP |

---

## 3. Database Schema

### 3.1 Core Tables

#### `merchants`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| name | text | Business name |
| slug | text | UNIQUE, URL-friendly |
| description | text | About section |
| cover_image_url | text | Hero image |
| logo_url | text | Square logo |
| address | text | Full address |
| latitude | decimal | For geo-search |
| longitude | decimal | For geo-search |
| phone | text | Contact phone |
| email | text | Contact email |
| rating_avg | decimal | Denormalized, updated by trigger |
| review_count | int | Denormalized |
| default_slot_capacity | int | Default: 3 jobs per slot |
| is_active | boolean | Listed in search |
| created_at | timestamptz | |
| updated_at | timestamptz | |

**Indexes:**
- GiST index on `(latitude, longitude)` for geo queries

---

#### `merchant_hours`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| merchant_id | uuid | FK → merchants |
| day_of_week | int | 0=Sunday, 6=Saturday |
| open_time | time | e.g., 08:00 |
| close_time | time | e.g., 19:00 |
| is_closed | boolean | True = day off |

---

#### `packages`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| merchant_id | uuid | FK → merchants |
| name | text | e.g., "Deluxe Wash" |
| description | text | What's included |
| price | decimal | Package price |
| pickup_fee | decimal | Additional pickup cost |
| duration_mins | int | Estimated job time |
| is_active | boolean | Available for booking |
| sort_order | int | Display order |
| created_at | timestamptz | |

---

#### `slot_overrides`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| merchant_id | uuid | FK → merchants |
| date | date | Specific date |
| slot_start | time | e.g., 08:00 |
| slot_end | time | e.g., 10:00 |
| is_blocked | boolean | True = unavailable |
| max_capacity | int | Null = use default |
| reason | text | Optional note |
| created_at | timestamptz | |

---

#### `customers`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK, same as auth.users.id |
| full_name | text | |
| phone | text | |
| phone_verified | boolean | |
| avatar_url | text | |
| expo_push_token | text | For push notifications |
| created_at | timestamptz | |
| updated_at | timestamptz | |

---

#### `vehicles`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| customer_id | uuid | FK → customers |
| make | text | e.g., "Toyota" |
| model | text | e.g., "Vios" |
| color | text | e.g., "White" |
| plate_number | text | Optional |
| is_default | boolean | Primary vehicle |
| created_at | timestamptz | |

---

#### `bookings`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| customer_id | uuid | FK → customers |
| merchant_id | uuid | FK → merchants |
| package_id | uuid | FK → packages |
| vehicle_id | uuid | FK → vehicles, nullable |
| status | enum | pending, confirmed, picked_up, in_progress, completed, cancelled |
| pickup_address | text | Full address |
| pickup_lat | decimal | |
| pickup_lng | decimal | |
| pickup_date | date | |
| pickup_slot | text | e.g., "08:00-10:00" |
| driver_note | text | Instructions for driver |
| package_price | decimal | Snapshot at booking |
| pickup_fee | decimal | Snapshot at booking |
| platform_fee | decimal | Our fee (fixed ₱50 for MVP) |
| total_amount | decimal | Sum of above |
| stripe_payment_intent_id | text | |
| cancelled_by | text | customer, merchant, system |
| cancelled_at | timestamptz | |
| cancellation_reason | text | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

**Indexes:**
- `(merchant_id, pickup_date, status)` for slot availability queries
- `(customer_id, created_at DESC)` for customer booking history

---

#### `reviews`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| booking_id | uuid | FK → bookings, UNIQUE |
| customer_id | uuid | FK → customers |
| merchant_id | uuid | FK → merchants |
| rating | int | 1-5 |
| comment | text | |
| created_at | timestamptz | |

---

#### `notifications`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| customer_id | uuid | FK → customers |
| type | text | e.g., booking_confirmed |
| title | text | |
| body | text | |
| data | jsonb | e.g., { booking_id: "..." } |
| is_read | boolean | |
| created_at | timestamptz | |

---

### 3.2 Booking Status Enum

```sql
CREATE TYPE booking_status AS ENUM (
  'pending',      -- Created, awaiting payment
  'confirmed',    -- Paid, awaiting pickup
  'picked_up',    -- Driver has the car
  'in_progress',  -- Wash in progress
  'completed',    -- Car returned
  'cancelled'     -- Cancelled by customer, merchant, or system
);
```

---

## 4. Row-Level Security (RLS)

### 4.1 Customers

```sql
-- Users can only read/update their own record
CREATE POLICY "customers_select_own" ON customers
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "customers_update_own" ON customers
  FOR UPDATE USING (id = auth.uid());
```

### 4.2 Vehicles

```sql
-- Full access to own vehicles only
CREATE POLICY "vehicles_all_own" ON vehicles
  FOR ALL USING (customer_id = auth.uid());
```

### 4.3 Bookings

```sql
-- Customers see their own bookings
CREATE POLICY "bookings_select_customer" ON bookings
  FOR SELECT USING (customer_id = auth.uid());

-- Customers can insert bookings for themselves
CREATE POLICY "bookings_insert_customer" ON bookings
  FOR INSERT WITH CHECK (customer_id = auth.uid());

-- Status updates via Edge Functions (service role)
```

### 4.4 Public Read Tables

```sql
-- Merchants, packages, merchant_hours: public read
CREATE POLICY "merchants_public_read" ON merchants
  FOR SELECT USING (is_active = true);

CREATE POLICY "packages_public_read" ON packages
  FOR SELECT USING (is_active = true);

CREATE POLICY "merchant_hours_public_read" ON merchant_hours
  FOR SELECT USING (true);
```

### 4.5 Reviews

```sql
-- Public read
CREATE POLICY "reviews_public_read" ON reviews
  FOR SELECT USING (true);

-- Customer can insert for their completed booking
CREATE POLICY "reviews_insert_own" ON reviews
  FOR INSERT WITH CHECK (
    customer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM bookings
      WHERE id = booking_id
      AND customer_id = auth.uid()
      AND status = 'completed'
    )
  );
```

### 4.6 Notifications

```sql
-- Only own notifications
CREATE POLICY "notifications_own" ON notifications
  FOR ALL USING (customer_id = auth.uid());
```

---

## 5. Database Functions

### 5.1 get_nearby_merchants

```sql
CREATE OR REPLACE FUNCTION get_nearby_merchants(
  user_lat decimal,
  user_lng decimal,
  radius_km decimal DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  cover_image_url text,
  logo_url text,
  address text,
  rating_avg decimal,
  review_count int,
  distance_km decimal,
  starting_price decimal
)
LANGUAGE plpgsql
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
        cos(radians(user_lat)) * cos(radians(m.latitude)) *
        cos(radians(m.longitude) - radians(user_lng)) +
        sin(radians(user_lat)) * sin(radians(m.latitude))
      )
    ) AS distance_km,
    (SELECT MIN(price) FROM packages WHERE merchant_id = m.id AND is_active) AS starting_price
  FROM merchants m
  WHERE m.is_active = true
  AND (
    6371 * acos(
      cos(radians(user_lat)) * cos(radians(m.latitude)) *
      cos(radians(m.longitude) - radians(user_lng)) +
      sin(radians(user_lat)) * sin(radians(m.latitude))
    )
  ) <= radius_km
  ORDER BY distance_km;
END;
$$;
```

### 5.2 get_available_slots

```sql
CREATE OR REPLACE FUNCTION get_available_slots(
  p_merchant_id uuid,
  p_date date
)
RETURNS TABLE (
  slot_start time,
  slot_end time,
  available boolean,
  remaining int
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_day_of_week int;
  v_open_time time;
  v_close_time time;
  v_slot_start time;
  v_slot_end time;
  v_default_capacity int;
  v_booked_count int;
  v_override_capacity int;
  v_is_blocked boolean;
BEGIN
  -- Get day of week (0=Sunday)
  v_day_of_week := EXTRACT(DOW FROM p_date);

  -- Get operating hours
  SELECT open_time, close_time INTO v_open_time, v_close_time
  FROM merchant_hours
  WHERE merchant_id = p_merchant_id AND day_of_week = v_day_of_week AND NOT is_closed;

  -- If closed, return empty
  IF v_open_time IS NULL THEN
    RETURN;
  END IF;

  -- Get default capacity
  SELECT default_slot_capacity INTO v_default_capacity
  FROM merchants WHERE id = p_merchant_id;

  v_default_capacity := COALESCE(v_default_capacity, 3);

  -- Generate 2-hour slots
  v_slot_start := v_open_time;
  WHILE v_slot_start < v_close_time LOOP
    v_slot_end := v_slot_start + interval '2 hours';
    IF v_slot_end > v_close_time THEN
      v_slot_end := v_close_time;
    END IF;

    -- Check for override
    SELECT so.is_blocked, so.max_capacity INTO v_is_blocked, v_override_capacity
    FROM slot_overrides so
    WHERE so.merchant_id = p_merchant_id
      AND so.date = p_date
      AND so.slot_start = v_slot_start;

    -- If blocked, skip
    IF COALESCE(v_is_blocked, false) THEN
      slot_start := v_slot_start;
      slot_end := v_slot_end;
      available := false;
      remaining := 0;
      RETURN NEXT;
    ELSE
      -- Count existing bookings
      SELECT COUNT(*) INTO v_booked_count
      FROM bookings b
      WHERE b.merchant_id = p_merchant_id
        AND b.pickup_date = p_date
        AND b.pickup_slot = v_slot_start::text || '-' || v_slot_end::text
        AND b.status NOT IN ('cancelled');

      slot_start := v_slot_start;
      slot_end := v_slot_end;
      remaining := COALESCE(v_override_capacity, v_default_capacity) - v_booked_count;
      available := remaining > 0;
      RETURN NEXT;
    END IF;

    v_slot_start := v_slot_end;
  END LOOP;
END;
$$;
```

### 5.3 update_merchant_rating (Trigger)

```sql
CREATE OR REPLACE FUNCTION update_merchant_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE merchants
  SET
    rating_avg = (
      SELECT ROUND(AVG(rating)::numeric, 1)
      FROM reviews WHERE merchant_id = NEW.merchant_id
    ),
    review_count = (
      SELECT COUNT(*) FROM reviews WHERE merchant_id = NEW.merchant_id
    ),
    updated_at = NOW()
  WHERE id = NEW.merchant_id;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_merchant_rating
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_merchant_rating();
```

---

## 6. Edge Functions

### 6.1 create-payment-intent

**Endpoint:** `POST /functions/v1/create-payment-intent`

**Request:**
```typescript
{
  merchantId: string;
  packageId: string;
  vehicleId?: string;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  pickupDate: string;  // YYYY-MM-DD
  pickupSlot: string;  // "08:00-10:00"
  driverNote?: string;
}
```

**Logic:**
1. Verify slot is still available (call `get_available_slots`)
2. Get package details for pricing
3. Calculate total: package_price + pickup_fee + platform_fee (fixed ₱50 for MVP)
4. Create Stripe PaymentIntent
5. Insert booking with `status = 'pending'`
6. Return `{ bookingId, clientSecret }`

**Response:**
```typescript
{
  bookingId: string;
  clientSecret: string;
  totalAmount: number;
}
```

---

### 6.2 stripe-webhook

**Endpoint:** `POST /functions/v1/stripe-webhook`

**Events handled:**
- `payment_intent.succeeded`: Update booking `status → confirmed`, trigger notification
- `payment_intent.payment_failed`: Update booking `status → cancelled`

**Verification:** Stripe signature verification using webhook secret

---

### 6.3 cancel-booking

**Endpoint:** `POST /functions/v1/cancel-booking`

**Request:**
```typescript
{
  bookingId: string;
  cancelledBy: 'customer' | 'merchant';
  reason?: string;
}
```

**Logic:**
1. Verify booking exists and is cancellable:
   - Status must be `confirmed`
   - If customer: pickup time must be >2 hours away
2. Process Stripe refund
3. Update booking: `status → cancelled`, set `cancelled_by`, `cancelled_at`, `cancellation_reason`
4. Trigger notification

---

### 6.4 send-notification

**Trigger:** Database webhook on `bookings` UPDATE (status change)

**Logic:**
1. Determine notification type from new status
2. Get customer's expo_push_token and phone
3. Send Expo push notification
4. Send Twilio SMS for critical events (confirmed, picked_up, completed, cancelled)
5. Insert into `notifications` table

**Notification templates:**

| Status | Title | Body |
|--------|-------|------|
| confirmed | Booking Confirmed | Your booking at {merchant} on {date} is confirmed. |
| picked_up | Car Picked Up | Your car has been picked up. We'll return it fresh! |
| in_progress | Wash In Progress | Your car is being washed at {merchant}. |
| completed | Car Returned | Your car is back! Rate your experience with {merchant}. |
| cancelled | Booking Cancelled | Your booking at {merchant} was cancelled. Refund on the way. |

---

## 7. Authentication Flow

### 7.1 Sign Up

1. Customer enters email, password, full name
2. Call `supabase.auth.signUp({ email, password, options: { data: { full_name } } })`
3. Trigger creates row in `customers` table
4. User is logged in

### 7.2 Phone Verification

1. After signup, prompt for phone number
2. Call `supabase.auth.signInWithOtp({ phone })`
3. Supabase sends OTP via Twilio
4. User enters OTP
5. Call `supabase.auth.verifyOtp({ phone, token, type: 'sms' })`
6. Update `customers.phone = phone, phone_verified = true`

### 7.3 Login

1. Customer enters email, password
2. Call `supabase.auth.signInWithPassword({ email, password })`
3. JWT stored, user session active

### 7.4 Password Reset

1. Customer enters email
2. Call `supabase.auth.resetPasswordForEmail(email)`
3. Email sent with reset link
4. User clicks link, enters new password

---

## 8. Realtime Subscriptions

### Booking Status Updates

Mobile app subscribes to booking changes:

```typescript
supabase
  .channel('booking-status')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'bookings',
    filter: `id=eq.${bookingId}`
  }, (payload) => {
    const newStatus = payload.new.status;
    // Update UI
  })
  .subscribe()
```

Used on:
- Booking detail screen (live status tracker)
- Home screen (active booking card)

---

## 9. Seed Data

### Test Merchants (5)

| Name | Location | Packages |
|------|----------|----------|
| SparkleWash BGC | Bonifacio Global City | Basic (₱350), Standard (₱550), Deluxe (₱850) |
| CleanRide Makati | Makati CBD | Express (₱300), Full Service (₱600), Premium (₱900) |
| AutoSpa Ortigas | Ortigas Center | Quick Wash (₱280), Complete (₱500), Executive (₱750) |
| WashMasters QC | Quezon City | Budget (₱250), Regular (₱450), VIP (₱700) |
| DetailPro Pasig | Pasig City | Exterior (₱200), Interior+Exterior (₱450), Full Detail (₱1,200) |

Each merchant has:
- Operating hours: 7:00 AM - 7:00 PM, Mon-Sat (closed Sunday)
- Default slot capacity: 3
- 5-10 sample reviews with ratings 3-5

### Test Customer

- Email: `test@pickupwash.com`
- Password: `testpass123`
- Phone: `+639171234567` (verified)
- 2 vehicles: Toyota Vios (White), Honda City (Black)
- 3 past bookings (1 completed with review, 1 completed no review, 1 cancelled)

---

## 10. Environment Variables

### Supabase Project

```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### Stripe

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Twilio (for transactional SMS beyond Supabase Auth)

```
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...
```

---

## 11. Migration Order

1. Enable PostGIS extension (for future geo optimization)
2. Create `booking_status` enum
3. Create tables: `merchants`, `merchant_hours`, `packages`, `slot_overrides`
4. Create tables: `customers`, `vehicles`
5. Create tables: `bookings`, `reviews`, `notifications`
6. Create RLS policies
7. Create functions: `get_nearby_merchants`, `get_available_slots`
8. Create triggers: `update_merchant_rating`, customer creation
9. Seed data

---

## 12. Success Criteria

| Metric | Target |
|--------|--------|
| Slot availability query | < 100ms |
| Booking creation (including Stripe) | < 3s |
| Realtime status update propagation | < 500ms |
| RLS policy coverage | 100% of tables |

---

## 13. Out of Scope (Deferred to Future Sub-projects)

- Merchant admin dashboard (Sub-project 3)
- Merchant authentication and RLS
- Driver assignment and tracking
- In-app messaging
- Wallet / stored credits
- Referral program
- Apple Pay / Google Pay

---

*End of Backend & Data Layer Design Spec v1.0*
