import { z } from "zod";

export const addressSchema = z.object({
  address: z.string().min(10, "Enter a complete address"),
  lat: z.number(),
  lng: z.number(),
});

export type AddressFormData = z.infer<typeof addressSchema>;

export interface CreateBookingRequest {
  merchantId: string;
  packageId: string;
  vehicleId?: string;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  pickupDate: string;
  pickupSlot: string;
  driverNote?: string;
}

export interface CreateBookingResponse {
  bookingId: string;
  clientSecret: string;
  totalAmount: number;
}
