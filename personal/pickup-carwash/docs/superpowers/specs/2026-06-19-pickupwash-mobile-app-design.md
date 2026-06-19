# PickupWash Mobile App — Design Spec

**Version:** 1.0
**Date:** 2026-06-19
**Sub-project:** 2 of 3 (Backend → Mobile App → Merchant Admin)

---

## 1. Overview

This spec defines the customer-facing mobile app for PickupWash, a car wash pickup and delivery platform. The app allows customers to:

- Discover nearby car wash merchants
- Browse packages and reviews
- Book pickup slots and pay via Stripe
- Track booking status in real-time
- Receive push notifications
- Manage profile and vehicles

---

## 2. Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Expo SDK 52 (managed workflow) |
| Language | TypeScript |
| Navigation | Expo Router (file-based routing) |
| Styling | NativeWind v4 (Tailwind for React Native) |
| State (local) | Zustand |
| State (server) | TanStack Query (React Query) |
| Backend | Supabase (@supabase/supabase-js) |
| Payments | Stripe (@stripe/stripe-react-native) |
| Maps | react-native-maps + expo-location |
| Notifications | expo-notifications |
| Forms | react-hook-form + zod |

---

## 3. Project Structure

```
app/                          # Expo Router screens
  (tabs)/                     # Tab navigator group
    index.tsx                 # Home tab
    search.tsx                # Search/discover tab
    bookings.tsx              # My bookings tab
    profile.tsx               # Profile tab
  (auth)/                     # Auth flow (not in tabs)
    login.tsx
    register.tsx
    verify-phone.tsx
  merchant/[id].tsx           # Merchant detail
  booking/
    [merchantId]/new.tsx      # New booking flow
    [id]/index.tsx            # Booking detail/tracking
  _layout.tsx                 # Root layout

src/
  features/
    auth/                     # Authentication feature
      components/
      hooks/
      store.ts
      types.ts
    merchants/                # Merchant discovery feature
      components/
      hooks/
      types.ts
    booking/                  # Booking feature
      components/
      hooks/
      store.ts
      types.ts
    profile/                  # Profile feature
      components/
      hooks/
      types.ts
  shared/
    components/               # Reusable UI components
    hooks/                    # Shared hooks
    lib/                      # Utilities (supabase client, etc.)
    types/                    # Shared types
```

---

## 4. Navigation & Screens

### 4.1 Tab Structure

| Tab | Icon | Purpose |
|-----|------|---------|
| Home | Home | Dashboard with active booking, quick actions, nearby preview |
| Search | Search | Map + list of merchants with filters |
| Bookings | Calendar | All bookings (upcoming, past, cancelled) |
| Profile | User | Account, vehicles, settings |

### 4.2 Screen Inventory (12 screens)

| Screen | Route | Description |
|--------|-------|-------------|
| Login | `(auth)/login` | Email/password login |
| Register | `(auth)/register` | Create account |
| Verify Phone | `(auth)/verify-phone` | OTP verification |
| Home | `(tabs)/index` | Dashboard with active booking card |
| Search | `(tabs)/search` | Map + merchant list with filters |
| Merchant Detail | `merchant/[id]` | Info, packages, reviews |
| New Booking | `booking/[merchantId]/new` | Multi-step booking flow |
| Booking Confirmation | (modal) | Success screen after payment |
| Bookings List | `(tabs)/bookings` | All user bookings |
| Booking Detail | `booking/[id]` | Status tracker, cancel, review |
| Profile | `(tabs)/profile` | Account hub |
| My Vehicles | `profile/vehicles` | Vehicle list + add/edit |

### 4.3 Navigation Flow

```
Auth Flow (unauthenticated):
  Login → Register → Verify Phone → Home

Main Flow (authenticated):
  Home
    └→ Merchant Detail
         └→ New Booking (package → slot → address → payment)
              └→ Booking Confirmation

  Search
    └→ Merchant Detail → New Booking

  Bookings
    └→ Booking Detail (status, cancel, review)

  Profile
    └→ Edit Profile
    └→ My Vehicles → Add/Edit Vehicle
    └→ Notification Settings
```

---

## 5. Features

### 5.1 Auth Feature

**Location:** `src/features/auth/`

**Screens:**
- Login - email/password form
- Register - email, password, full name
- VerifyPhone - OTP input after registration

**Store (`useAuthStore`):**
```typescript
{
  user: User | null,
  session: Session | null,
  isLoading: boolean,
  setSession: (session: Session | null) => void,
  clear: () => void,
}
```

**Hooks:**
- `useAuth()` - login, register, logout, verifyOtp, resetPassword

**Supabase Integration:**
- `supabase.auth.signUp({ email, password, options: { data: { full_name } } })`
- `supabase.auth.signInWithPassword({ email, password })`
- `supabase.auth.signInWithOtp({ phone })` - sends OTP
- `supabase.auth.verifyOtp({ phone, token, type: 'sms' })`

**Post-Auth:**
- Store Expo push token to `customers.expo_push_token`

---

### 5.2 Merchants Feature

**Location:** `src/features/merchants/`

**Screens:**
- Search - map view + scrollable list, filter sheet
- MerchantDetail - hero image, info, packages, reviews

**Queries:**
- `useNearbyMerchants(lat, lng, radius)` - calls `rpc('get_nearby_merchants')`
- `useMerchant(id)` - single merchant detail
- `useMerchantPackages(merchantId)` - packages list
- `useMerchantReviews(merchantId)` - reviews with pagination

**Components:**
- `MerchantCard` - preview card for list
- `MerchantMap` - map with merchant markers
- `PackageCard` - package with price, description
- `ReviewCard` - rating, comment, customer name
- `RatingStars` - star display component
- `FilterSheet` - bottom sheet for distance/rating/price filters

---

### 5.3 Booking Feature

**Location:** `src/features/booking/`

**Screens:**
- NewBooking - multi-step: package → date/slot → address → payment
- BookingConfirmation - success modal after payment
- BookingsList - list grouped by status
- BookingDetail - status tracker, actions (cancel, review)

**Store (`useBookingStore`):**
```typescript
{
  merchantId: string | null,
  packageId: string | null,
  vehicleId: string | null,
  pickupDate: string | null,      // YYYY-MM-DD
  pickupSlot: string | null,      // "08:00-10:00"
  pickupAddress: string | null,
  pickupCoords: { lat: number, lng: number } | null,
  driverNote: string,
  setStep: (field: string, value: any) => void,
  reset: () => void,
}
```

**Queries:**
- `useAvailableSlots(merchantId, date)` - calls `rpc('get_available_slots')`
- `useMyBookings()` - all customer bookings
- `useBooking(id)` - single booking detail

**Mutations:**
- `useCreateBooking()` - calls `create-payment-intent` Edge Function, handles Stripe Payment Sheet

**Realtime:**
- Subscribe to `bookings` table changes for status updates
- Update query cache on realtime event

**Components:**
- `DatePicker` - calendar date selection
- `SlotPicker` - available time slots grid
- `AddressPicker` - location input with map preview
- `BookingCard` - booking preview for list
- `StatusTracker` - visual progress indicator
- `StepIndicator` - booking flow progress
- `ReviewForm` - rating + comment input

---

### 5.4 Profile Feature

**Location:** `src/features/profile/`

**Screens:**
- Profile - account hub with settings rows
- EditProfile - name, phone, avatar
- MyVehicles - vehicle list
- AddVehicle / EditVehicle - vehicle form

**Queries:**
- `useProfile()` - customer data
- `useVehicles()` - customer vehicles

**Mutations:**
- `useUpdateProfile()` - update name, avatar
- `useAddVehicle()` - create vehicle
- `useUpdateVehicle()` - edit vehicle
- `useDeleteVehicle()` - remove vehicle

**Components:**
- `ProfileHeader` - avatar, name, email
- `VehicleCard` - make, model, color, plate
- `VehicleForm` - add/edit form
- `SettingsRow` - navigation row with icon

---

## 6. State Management

### 6.1 Zustand Stores (Local State)

**useAuthStore** - Authentication state
```typescript
interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  setSession: (session: Session | null) => void;
  clear: () => void;
}
```

**useBookingStore** - Booking creation flow
```typescript
interface BookingState {
  merchantId: string | null;
  packageId: string | null;
  vehicleId: string | null;
  pickupDate: string | null;
  pickupSlot: string | null;
  pickupAddress: string | null;
  pickupCoords: { lat: number; lng: number } | null;
  driverNote: string;
  setStep: (field: keyof BookingState, value: any) => void;
  reset: () => void;
}
```

**useLocationStore** - User location
```typescript
interface LocationState {
  coords: { lat: number; lng: number } | null;
  address: string | null;
  permission: 'granted' | 'denied' | 'undetermined';
  setLocation: (coords: { lat: number; lng: number }, address: string) => void;
}
```

### 6.2 React Query (Server State)

**Query Keys:**
```typescript
export const queryKeys = {
  merchants: {
    nearby: (lat: number, lng: number, radius: number) =>
      ['merchants', 'nearby', { lat, lng, radius }] as const,
    detail: (id: string) => ['merchants', id] as const,
    packages: (id: string) => ['merchants', id, 'packages'] as const,
    reviews: (id: string) => ['merchants', id, 'reviews'] as const,
    slots: (id: string, date: string) => ['merchants', id, 'slots', date] as const,
  },
  bookings: {
    all: () => ['bookings'] as const,
    detail: (id: string) => ['bookings', id] as const,
  },
  profile: () => ['profile'] as const,
  vehicles: () => ['vehicles'] as const,
};
```

### 6.3 Realtime Subscriptions

```typescript
// In BookingDetail screen
useEffect(() => {
  const channel = supabase
    .channel(`booking-${bookingId}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'bookings',
      filter: `id=eq.${bookingId}`
    }, (payload) => {
      queryClient.setQueryData(
        queryKeys.bookings.detail(bookingId),
        payload.new
      );
    })
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}, [bookingId]);
```

---

## 7. Shared UI Components

### 7.1 Core Components

| Component | Props | Purpose |
|-----------|-------|---------|
| `Button` | variant, size, loading, disabled | Primary, secondary, outline, destructive |
| `Input` | label, error, leftIcon, rightIcon | Text input with validation |
| `Card` | padding, shadow | Container component |
| `Avatar` | src, fallback, size | User/merchant image |
| `Badge` | variant, label | Status indicators |
| `Modal` | visible, onClose | Bottom sheet modal |
| `Skeleton` | width, height, rounded | Loading placeholder |
| `EmptyState` | icon, title, description, action | Empty list state |
| `ErrorState` | message, onRetry | Error with retry |

### 7.2 Design Tokens

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
        },
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444',
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
      },
    },
  },
};
```

### 7.3 Booking Status Styling

| Status | Color | Badge Text |
|--------|-------|------------|
| pending | neutral-500 | Awaiting Payment |
| confirmed | primary-500 | Confirmed |
| picked_up | warning | Car Picked Up |
| in_progress | warning | Washing |
| completed | success | Completed |
| cancelled | error | Cancelled |

---

## 8. Error Handling & Loading States

### 8.1 Loading States

| Context | Implementation |
|---------|----------------|
| App startup | Splash screen while checking session |
| Screen data | Skeleton components matching layout |
| Button actions | Disabled + spinner inside button |
| List refresh | Pull-to-refresh control |
| Pagination | Spinner at list bottom |

### 8.2 Error Handling

| Error Type | Handling |
|------------|----------|
| Network error | Toast notification + retry button |
| Auth expired (401) | Clear session, redirect to login |
| Not found (404) | "Not found" screen with back button |
| Payment failed | Stay on screen, show error, allow retry |
| Slot unavailable | Modal alert, redirect to slot picker |
| Location denied | Prompt for permission, fallback to manual entry |

### 8.3 Edge Cases

| Scenario | Handling |
|----------|----------|
| No nearby merchants | Empty state with "expand radius" suggestion |
| No available slots | Empty state with "try another date" |
| Offline | Block mutations, show "You're offline" toast |
| Push notification tap | Deep link to relevant booking |
| App backgrounded mid-payment | Resume payment flow on foreground |
| Session expired mid-booking | Save draft locally, restore after re-login |

### 8.4 Form Validation (Zod)

```typescript
// Register form
const registerSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'At least 8 characters'),
  fullName: z.string().min(2, 'Name required'),
});

// Vehicle form
const vehicleSchema = z.object({
  make: z.string().min(1, 'Make required'),
  model: z.string().min(1, 'Model required'),
  color: z.string().min(1, 'Color required'),
  plateNumber: z.string().optional(),
});

// Booking address
const addressSchema = z.object({
  address: z.string().min(10, 'Enter full address'),
  lat: z.number(),
  lng: z.number(),
});
```

---

## 9. Backend Integration

### 9.1 Supabase Client Setup

```typescript
// src/shared/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
```

### 9.2 Edge Function Calls

| Function | Purpose | Request |
|----------|---------|---------|
| `create-payment-intent` | Create booking + Stripe intent | `{ merchantId, packageId, vehicleId?, pickupAddress, pickupLat, pickupLng, pickupDate, pickupSlot, driverNote? }` |
| `cancel-booking` | Cancel with refund | `{ bookingId, cancelledBy: 'customer', reason? }` |

### 9.3 Database Queries

```typescript
// Nearby merchants
const { data } = await supabase.rpc('get_nearby_merchants', {
  user_lat: lat,
  user_lng: lng,
  radius_km: 10,
});

// Available slots
const { data } = await supabase.rpc('get_available_slots', {
  p_merchant_id: merchantId,
  p_date: date,
});

// Customer bookings
const { data } = await supabase
  .from('bookings')
  .select('*, merchant:merchants(name, logo_url), package:packages(name)')
  .eq('customer_id', userId)
  .order('created_at', { ascending: false });
```

---

## 10. Environment Variables

```bash
# .env
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...  # for Android
```

---

## 11. Success Criteria

| Metric | Target |
|--------|--------|
| App launch to home | < 2s (warm start) |
| Merchant list load | < 1s |
| Booking flow completion | < 60s (happy path) |
| Crash-free rate | > 99% |
| App store rating | > 4.0 |

---

## 12. Out of Scope (MVP)

- Social login (Google, Apple)
- In-app chat with merchant
- Saved addresses
- Favorites/wishlist
- Promo codes
- Referral program
- Dark mode
- Localization (English only)

---

*End of Mobile App Design Spec v1.0*
