import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createSupabaseClient, createSupabaseAdmin } from "../_shared/supabase.ts";
import { createStripeClient } from "../_shared/stripe.ts";
import { handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";

interface CreatePaymentIntentRequest {
  merchantId: string;
  packageId: string;
  vehicleId?: string;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  pickupDate: string; // YYYY-MM-DD
  pickupSlot: string; // "08:00:00-10:00:00"
  driverNote?: string;
}

const PLATFORM_FEE_PHP = 50;

serve(async (req: Request) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  try {
    // Get user from auth header
    const supabase = createSupabaseClient(req);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    // Parse request body
    const body: CreatePaymentIntentRequest = await req.json();
    const {
      merchantId,
      packageId,
      vehicleId,
      pickupAddress,
      pickupLat,
      pickupLng,
      pickupDate,
      pickupSlot,
      driverNote,
    } = body;

    // Validate required fields
    if (!merchantId || !packageId || !pickupAddress || !pickupLat || !pickupLng || !pickupDate || !pickupSlot) {
      return errorResponse("Missing required fields");
    }

    const admin = createSupabaseAdmin();

    // Check slot availability
    const { data: slots, error: slotsError } = await admin.rpc("get_available_slots", {
      p_merchant_id: merchantId,
      p_date: pickupDate,
    });

    if (slotsError) {
      console.error("Error checking slots:", slotsError);
      return errorResponse("Failed to check slot availability");
    }

    const targetSlot = slots?.find((s: { slot_label: string }) => s.slot_label === pickupSlot);
    if (!targetSlot || !targetSlot.available) {
      return errorResponse("Selected time slot is no longer available");
    }

    // Get package details
    const { data: packageData, error: packageError } = await admin
      .from("packages")
      .select("price, pickup_fee, merchant_id")
      .eq("id", packageId)
      .eq("is_active", true)
      .single();

    if (packageError || !packageData) {
      return errorResponse("Package not found or inactive");
    }

    if (packageData.merchant_id !== merchantId) {
      return errorResponse("Package does not belong to this merchant");
    }

    // Calculate total
    const packagePrice = Number(packageData.price);
    const pickupFee = Number(packageData.pickup_fee);
    const totalAmount = packagePrice + pickupFee + PLATFORM_FEE_PHP;

    // Create Stripe PaymentIntent
    const stripe = createStripeClient();
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Convert to centavos
      currency: "php",
      metadata: {
        merchantId,
        packageId,
        customerId: user.id,
        pickupDate,
        pickupSlot,
      },
    });

    // Create booking with pending status
    const { data: booking, error: bookingError } = await admin
      .from("bookings")
      .insert({
        customer_id: user.id,
        merchant_id: merchantId,
        package_id: packageId,
        vehicle_id: vehicleId || null,
        status: "pending",
        pickup_address: pickupAddress,
        pickup_lat: pickupLat,
        pickup_lng: pickupLng,
        pickup_date: pickupDate,
        pickup_slot: pickupSlot,
        driver_note: driverNote || null,
        package_price: packagePrice,
        pickup_fee: pickupFee,
        platform_fee: PLATFORM_FEE_PHP,
        total_amount: totalAmount,
        stripe_payment_intent_id: paymentIntent.id,
      })
      .select("id")
      .single();

    if (bookingError) {
      console.error("Error creating booking:", bookingError);
      // Cancel the PaymentIntent since booking failed
      await stripe.paymentIntents.cancel(paymentIntent.id);
      return errorResponse("Failed to create booking");
    }

    return jsonResponse({
      bookingId: booking.id,
      clientSecret: paymentIntent.client_secret,
      totalAmount,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return errorResponse("Internal server error", 500);
  }
});
