import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createSupabaseAdmin } from "../_shared/supabase.ts";
import { corsHeaders } from "../_shared/cors.ts";
import {
  sendPushNotification,
  sendSms,
  NOTIFICATION_TEMPLATES,
} from "../_shared/notifications.ts";

interface BookingRecord {
  id: string;
  customer_id: string;
  merchant_id: string;
  status: string;
  pickup_date: string;
}

interface WebhookPayload {
  type: "UPDATE";
  table: "bookings";
  record: BookingRecord;
  old_record: BookingRecord;
}

// Statuses that trigger notifications
const NOTIFY_STATUSES = ["confirmed", "picked_up", "in_progress", "completed", "cancelled"];

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const payload: WebhookPayload = await req.json();

    // Validate webhook payload
    if (payload.type !== "UPDATE" || payload.table !== "bookings") {
      console.log("Ignoring non-booking update webhook");
      return new Response("OK", { status: 200 });
    }

    const { record: booking, old_record: oldBooking } = payload;

    // Check if status changed
    if (booking.status === oldBooking.status) {
      console.log("Status unchanged, skipping notification");
      return new Response("OK", { status: 200 });
    }

    // Check if new status should trigger notification
    if (!NOTIFY_STATUSES.includes(booking.status)) {
      console.log(`Status ${booking.status} does not trigger notification`);
      return new Response("OK", { status: 200 });
    }

    const admin = createSupabaseAdmin();

    // Get customer details
    const { data: customer, error: customerError } = await admin
      .from("customers")
      .select("expo_push_token, phone, full_name")
      .eq("id", booking.customer_id)
      .single();

    if (customerError || !customer) {
      console.error("Customer not found:", customerError);
      return new Response("Customer not found", { status: 404 });
    }

    // Get merchant name
    const { data: merchant, error: merchantError } = await admin
      .from("merchants")
      .select("name")
      .eq("id", booking.merchant_id)
      .single();

    if (merchantError || !merchant) {
      console.error("Merchant not found:", merchantError);
      return new Response("Merchant not found", { status: 404 });
    }

    // Get notification template
    const template = NOTIFICATION_TEMPLATES[booking.status as keyof typeof NOTIFICATION_TEMPLATES];
    if (!template) {
      console.log(`No template for status: ${booking.status}`);
      return new Response("OK", { status: 200 });
    }

    const title = template.title;
    let body: string;
    if (booking.status === "picked_up") {
      body = (template.body as () => string)();
    } else if (booking.status === "in_progress" || booking.status === "completed" || booking.status === "cancelled") {
      body = (template.body as (merchantName: string) => string)(merchant.name);
    } else {
      body = (template.body as (merchantName: string, date: string) => string)(merchant.name, booking.pickup_date);
    }
    const data = { bookingId: booking.id };

    // Send push notification
    if (customer.expo_push_token) {
      await sendPushNotification(customer.expo_push_token, title, body, data);
      console.log("Push notification sent");
    }

    // Send SMS for critical statuses
    const SMS_STATUSES = ["confirmed", "picked_up", "completed", "cancelled"];
    if (SMS_STATUSES.includes(booking.status) && customer.phone) {
      await sendSms(customer.phone, `PickupWash: ${body}`);
      console.log("SMS sent");
    }

    // Store notification in database
    const { error: notifError } = await admin.from("notifications").insert({
      customer_id: booking.customer_id,
      type: `booking_${booking.status}`,
      title,
      body,
      data,
      is_read: false,
    });

    if (notifError) {
      console.error("Error storing notification:", notifError);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response("Internal server error", { status: 500 });
  }
});
