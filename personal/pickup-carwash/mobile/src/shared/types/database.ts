export type BookingStatus =
  | "pending"
  | "confirmed"
  | "picked_up"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface Merchant {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  logo_url: string | null;
  address: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  email: string | null;
  rating_avg: number | null;
  review_count: number;
  default_slot_capacity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NearbyMerchant extends Merchant {
  distance_km: number;
  starting_price: number | null;
}

export interface Package {
  id: string;
  merchant_id: string;
  name: string;
  description: string | null;
  price: number;
  pickup_fee: number;
  duration_mins: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Customer {
  id: string;
  full_name: string | null;
  phone: string | null;
  phone_verified: boolean;
  avatar_url: string | null;
  expo_push_token: string | null;
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: string;
  customer_id: string;
  make: string;
  model: string;
  color: string;
  plate_number: string | null;
  is_default: boolean;
  created_at: string;
}

export interface Booking {
  id: string;
  customer_id: string;
  merchant_id: string;
  package_id: string;
  vehicle_id: string | null;
  status: BookingStatus;
  pickup_address: string;
  pickup_lat: number;
  pickup_lng: number;
  pickup_date: string;
  pickup_slot: string;
  driver_note: string | null;
  package_price: number;
  pickup_fee: number;
  platform_fee: number;
  total_amount: number;
  stripe_payment_intent_id: string | null;
  cancelled_by: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookingWithRelations extends Booking {
  merchant: Pick<Merchant, "name" | "logo_url">;
  package: Pick<Package, "name">;
}

export interface Review {
  id: string;
  booking_id: string;
  customer_id: string;
  merchant_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface AvailableSlot {
  slot_start: string;
  slot_end: string;
  slot_label: string;
  available: boolean;
  remaining: number;
}

export interface Database {
  public: {
    Tables: {
      merchants: { Row: Merchant };
      packages: { Row: Package };
      customers: { Row: Customer };
      vehicles: { Row: Vehicle };
      bookings: { Row: Booking };
      reviews: { Row: Review };
    };
    Functions: {
      get_nearby_merchants: {
        Args: { user_lat: number; user_lng: number; radius_km: number };
        Returns: NearbyMerchant[];
      };
      get_available_slots: {
        Args: { p_merchant_id: string; p_date: string };
        Returns: AvailableSlot[];
      };
    };
  };
}
