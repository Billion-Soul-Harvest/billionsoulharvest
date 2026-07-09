import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Webhook } from "svix";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

interface ResendWebhookPayload {
  type: string;
  data: {
    email_id: string;
    to: string[];
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();

    // Verify webhook signature if secret is set
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
    if (webhookSecret) {
      const svixId = request.headers.get("svix-id");
      const svixTimestamp = request.headers.get("svix-timestamp");
      const svixSignature = request.headers.get("svix-signature");

      if (!svixId || !svixTimestamp || !svixSignature) {
        return NextResponse.json({ error: "Missing webhook headers" }, { status: 400 });
      }

      const wh = new Webhook(webhookSecret);
      try {
        wh.verify(body, {
          "svix-id": svixId,
          "svix-timestamp": svixTimestamp,
          "svix-signature": svixSignature,
        });
      } catch {
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
    }

    const payload = JSON.parse(body) as ResendWebhookPayload;
    const { type, data } = payload;
    const resendId = data.email_id;

    if (!resendId) {
      return NextResponse.json({ error: "No email_id" }, { status: 400 });
    }

    const supabase = getSupabase();

    // Find the campaign_send by resend_id
    const { data: send } = await supabase
      .from("campaign_sends")
      .select("id, campaign_id, contact_id, status")
      .eq("resend_id", resendId)
      .single();

    if (!send) {
      // Not a campaign email, ignore
      return NextResponse.json({ received: true });
    }

    const now = new Date().toISOString();

    // Map event type to status update
    switch (type) {
      case "email.delivered": {
        await supabase
          .from("campaign_sends")
          .update({ status: "delivered" })
          .eq("id", send.id);
        const { data: dc } = await supabase
          .from("campaigns")
          .select("delivered_count")
          .eq("id", send.campaign_id)
          .single();
        if (dc) {
          await supabase
            .from("campaigns")
            .update({ delivered_count: (dc.delivered_count ?? 0) + 1 })
            .eq("id", send.campaign_id);
        }
        break;
      }
      case "email.opened": {
        await supabase
          .from("campaign_sends")
          .update({ status: "opened", opened_at: now })
          .eq("id", send.id);
        const { data: c } = await supabase
          .from("campaigns")
          .select("opened_count")
          .eq("id", send.campaign_id)
          .single();
        if (c) {
          await supabase
            .from("campaigns")
            .update({ opened_count: c.opened_count + 1 })
            .eq("id", send.campaign_id);
        }
        break;
      }
      case "email.clicked": {
        await supabase
          .from("campaign_sends")
          .update({ status: "clicked", clicked_at: now })
          .eq("id", send.id);
        const { data: c } = await supabase
          .from("campaigns")
          .select("clicked_count")
          .eq("id", send.campaign_id)
          .single();
        if (c) {
          await supabase
            .from("campaigns")
            .update({ clicked_count: c.clicked_count + 1 })
            .eq("id", send.campaign_id);
        }
        break;
      }
      case "email.bounced": {
        await supabase
          .from("campaign_sends")
          .update({ status: "bounced", bounced_at: now })
          .eq("id", send.id);
        const { data: c } = await supabase
          .from("campaigns")
          .select("bounced_count")
          .eq("id", send.campaign_id)
          .single();
        if (c) {
          await supabase
            .from("campaigns")
            .update({ bounced_count: c.bounced_count + 1 })
            .eq("id", send.campaign_id);
        }
        // Mark contact email as bounced
        await supabase
          .from("contacts")
          .update({ email_status: "bounced" })
          .eq("id", send.contact_id);
        break;
      }
      case "email.complained": {
        await supabase
          .from("campaign_sends")
          .update({ status: "complained" })
          .eq("id", send.id);
        const { data: c } = await supabase
          .from("campaigns")
          .select("complained_count")
          .eq("id", send.campaign_id)
          .single();
        if (c) {
          await supabase
            .from("campaigns")
            .update({ complained_count: c.complained_count + 1 })
            .eq("id", send.campaign_id);
        }
        // Unsubscribe contact on complaint
        await supabase
          .from("contacts")
          .update({
            email_unsubscribed: true,
            email_unsubscribed_at: now,
          })
          .eq("id", send.contact_id);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
