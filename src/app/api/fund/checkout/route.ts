import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/shared/utils/supabase/server";
import { getStripe } from "@/features/fund/utils/stripe";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const {
      campaign_id,
      amount_cents,
      donor_name,
      donor_email,
      is_anonymous,
      is_recurring,
      interval,
      message,
    } = await request.json();

    if (!campaign_id || !amount_cents || amount_cents < 100) {
      return NextResponse.json({ error: "campaign_id and amount_cents (min 100) required" }, { status: 400 });
    }

    // Verify campaign exists and is active
    const { data: campaign } = await supabase
      .from("fund_campaigns")
      .select("id, title, slug, status")
      .eq("id", campaign_id)
      .single();

    if (!campaign || campaign.status !== "active") {
      return NextResponse.json({ error: "Campaign not found or not active" }, { status: 404 });
    }

    // Create pending donation record
    const { data: donation, error: donationError } = await supabase
      .from("fund_donations")
      .insert({
        campaign_id,
        donor_id: user?.id || null,
        donor_name: is_anonymous ? "Anonymous" : (donor_name || user?.email?.split("@")[0] || "Anonymous"),
        donor_email: donor_email || user?.email || null,
        amount_cents,
        is_anonymous: is_anonymous || false,
        is_recurring: is_recurring || false,
        message: message || null,
        status: "pending",
      })
      .select()
      .single();

    if (donationError) return NextResponse.json({ error: donationError.message }, { status: 500 });

    const stripe = getStripe();
    const origin = request.headers.get("origin") || request.nextUrl.origin;

    if (is_recurring && user) {
      // Create a recurring subscription
      const price = await stripe.prices.create({
        unit_amount: amount_cents,
        currency: "usd",
        recurring: { interval: interval || "month" },
        product_data: { name: `Recurring donation: ${campaign.title}` },
      });

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [{ price: price.id, quantity: 1 }],
        success_url: `${origin}/fund/campaigns/${campaign.slug}?donated=true`,
        cancel_url: `${origin}/fund/campaigns/${campaign.slug}/donate`,
        customer_email: donor_email || user?.email || undefined,
        metadata: {
          donation_id: donation.id,
          campaign_id,
          is_recurring: "true",
        },
      });

      return NextResponse.json({ url: session.url });
    }

    // One-time payment
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: { name: `Donation to: ${campaign.title}` },
          unit_amount: amount_cents,
        },
        quantity: 1,
      }],
      success_url: `${origin}/fund/campaigns/${campaign.slug}?donated=true`,
      cancel_url: `${origin}/fund/campaigns/${campaign.slug}/donate`,
      customer_email: donor_email || user?.email || undefined,
      metadata: {
        donation_id: donation.id,
        campaign_id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
