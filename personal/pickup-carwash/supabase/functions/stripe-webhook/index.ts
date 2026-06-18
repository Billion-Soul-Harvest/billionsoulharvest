import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createSupabaseAdmin } from "../_shared/supabase.ts";
import { createStripeClient, getStripeWebhookSecret } from "../_shared/stripe.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const stripe = createStripeClient();
  const webhookSecret = getStripeWebhookSecret();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  let event;
  try {
    const body = await req.text();
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new Response(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`, { status: 400 });
  }

  const admin = createSupabaseAdmin();

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        console.log("Payment succeeded:", paymentIntent.id);

        // Update booking status to confirmed
        const { error } = await admin
          .from("bookings")
          .update({
            status: "confirmed",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_payment_intent_id", paymentIntent.id)
          .eq("status", "pending");

        if (error) {
          console.error("Error updating booking:", error);
          return new Response("Failed to update booking", { status: 500 });
        }

        console.log("Booking confirmed for payment intent:", paymentIntent.id);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        console.log("Payment failed:", paymentIntent.id);

        // Update booking status to cancelled
        const { error } = await admin
          .from("bookings")
          .update({
            status: "cancelled",
            cancelled_by: "system",
            cancelled_at: new Date().toISOString(),
            cancellation_reason: "Payment failed",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_payment_intent_id", paymentIntent.id)
          .eq("status", "pending");

        if (error) {
          console.error("Error updating booking:", error);
          return new Response("Failed to update booking", { status: 500 });
        }

        console.log("Booking cancelled due to payment failure:", paymentIntent.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response("Webhook processing failed", { status: 500 });
  }
});
