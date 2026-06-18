import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createSupabaseClient, createSupabaseAdmin } from "../_shared/supabase.ts";
import { createStripeClient } from "../_shared/stripe.ts";
import { handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";

interface CancelBookingRequest {
  bookingId: string;
  cancelledBy: "customer" | "merchant";
  reason?: string;
}

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
    const body: CancelBookingRequest = await req.json();
    const { bookingId, cancelledBy, reason } = body;

    if (!bookingId || !cancelledBy) {
      return errorResponse("Missing required fields");
    }

    const admin = createSupabaseAdmin();

    // Get booking details
    const { data: booking, error: bookingError } = await admin
      .from("bookings")
      .select(`
        id,
        customer_id,
        merchant_id,
        status,
        pickup_date,
        pickup_slot,
        stripe_payment_intent_id,
        total_amount
      `)
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      return errorResponse("Booking not found");
    }

    // Verify ownership for customer cancellation
    if (cancelledBy === "customer" && booking.customer_id !== user.id) {
      return errorResponse("Not authorized to cancel this booking", 403);
    }

    // Check if booking can be cancelled
    if (booking.status !== "confirmed") {
      return errorResponse(`Cannot cancel booking with status: ${booking.status}`);
    }

    // For customer cancellation, check 2-hour window
    if (cancelledBy === "customer") {
      const [slotStartStr] = booking.pickup_slot.split("-");
      const pickupDateTime = new Date(`${booking.pickup_date}T${slotStartStr}`);
      const now = new Date();
      const hoursUntilPickup = (pickupDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (hoursUntilPickup < 2) {
        return errorResponse("Cannot cancel within 2 hours of pickup time");
      }
    }

    // Process Stripe refund
    if (booking.stripe_payment_intent_id) {
      const stripe = createStripeClient();
      try {
        await stripe.refunds.create({
          payment_intent: booking.stripe_payment_intent_id,
        });
        console.log("Refund processed for:", booking.stripe_payment_intent_id);
      } catch (refundError) {
        console.error("Refund failed:", refundError);
        return errorResponse("Failed to process refund");
      }
    }

    // Update booking status
    const { error: updateError } = await admin
      .from("bookings")
      .update({
        status: "cancelled",
        cancelled_by: cancelledBy,
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId);

    if (updateError) {
      console.error("Error updating booking:", updateError);
      return errorResponse("Failed to cancel booking");
    }

    return jsonResponse({ success: true });
  } catch (error) {
    console.error("Unexpected error:", error);
    return errorResponse("Internal server error", 500);
  }
});
