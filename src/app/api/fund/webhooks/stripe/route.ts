import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/features/fund/utils/stripe";
import { createServiceClient } from "@/shared/utils/supabase/service";
import { sendEmail, getFromAddress } from "@/shared/utils/send-email";
import type Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createServiceClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const donationId = session.metadata?.donation_id;
        const campaignId = session.metadata?.campaign_id;
        const isRecurring = session.metadata?.is_recurring === "true";

        if (!donationId || !campaignId) break;

        // Update donation status
        const { data: donation } = await supabase
          .from("fund_donations")
          .update({
            status: "succeeded",
            stripe_payment_intent_id: session.payment_intent as string || session.subscription as string,
          })
          .eq("id", donationId)
          .select()
          .single();

        if (!donation) break;

        // Increment campaign raised_cents and donor_count
        const { data: campaign } = await supabase
          .from("fund_campaigns")
          .select("raised_cents, donor_count, goal_cents, title, creator_id")
          .eq("id", campaignId)
          .single();

        if (campaign) {
          const newRaised = campaign.raised_cents + donation.amount_cents;
          const newDonorCount = campaign.donor_count + 1;

          await supabase
            .from("fund_campaigns")
            .update({ raised_cents: newRaised, donor_count: newDonorCount })
            .eq("id", campaignId);

          // Apply matching rules
          await applyMatchingRules(supabase, donationId, campaignId, donation.amount_cents);

          // Check if goal reached
          if (newRaised >= campaign.goal_cents && campaign.raised_cents < campaign.goal_cents) {
            // Goal just reached — could send notification
            const { data: creator } = await supabase.auth.admin.getUserById(campaign.creator_id);
            if (creator?.user?.email) {
              await sendEmail({
                to: creator.user.email,
                subject: `Your campaign "${campaign.title}" reached its goal!`,
                html: `<h1>Congratulations!</h1><p>Your campaign "${campaign.title}" has reached its fundraising goal. Thank you for your dedication to the mission.</p>`,
                from: getFromAddress(),
              });
            }
          }

          // Send receipt to donor
          if (donation.donor_email) {
            await sendEmail({
              to: donation.donor_email,
              subject: `Donation receipt - ${campaign.title}`,
              html: `<h1>Thank you for your donation!</h1><p>You donated $${(donation.amount_cents / 100).toFixed(2)} to "${campaign.title}".</p><p>This email serves as your donation receipt.</p>`,
              from: getFromAddress(),
            });
          }
        }

        // Create recurring subscription record
        if (isRecurring && donation.donor_id && session.subscription) {
          await supabase.from("fund_recurring_subscriptions").insert({
            campaign_id: campaignId,
            donor_id: donation.donor_id,
            amount_cents: donation.amount_cents,
            interval: "month",
            stripe_subscription_id: session.subscription as string,
            status: "active",
          });
        }

        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as unknown as Record<string, unknown>;
        const subscriptionId = invoice.subscription as string | undefined;

        if (!subscriptionId) break;

        // Find recurring subscription
        const { data: sub } = await supabase
          .from("fund_recurring_subscriptions")
          .select("*")
          .eq("stripe_subscription_id", subscriptionId)
          .single();

        if (!sub) break;

        // Create new donation record for recurring payment
        await supabase.from("fund_donations").insert({
          campaign_id: sub.campaign_id,
          donor_id: sub.donor_id,
          amount_cents: sub.amount_cents,
          status: "succeeded",
          is_recurring: true,
          stripe_payment_intent_id: (invoice.payment_intent as string) || null,
          donor_name: "Recurring Donor",
        });

        // Update campaign totals
        const { data: c } = await supabase
          .from("fund_campaigns")
          .select("raised_cents, donor_count")
          .eq("id", sub.campaign_id)
          .single();
        if (c) {
          await supabase
            .from("fund_campaigns")
            .update({ raised_cents: c.raised_cents + sub.amount_cents })
            .eq("id", sub.campaign_id);
        }

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        await supabase
          .from("fund_recurring_subscriptions")
          .update({ status: "cancelled" })
          .eq("stripe_subscription_id", subscription.id);

        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId = charge.payment_intent as string;

        if (!paymentIntentId) break;

        const { data: donation } = await supabase
          .from("fund_donations")
          .select("*")
          .eq("stripe_payment_intent_id", paymentIntentId)
          .single();

        if (!donation) break;

        const refundedAmount = charge.amount_refunded;
        const newStatus = refundedAmount >= donation.amount_cents ? "refunded" : "partially_refunded";

        await supabase
          .from("fund_donations")
          .update({ status: newStatus })
          .eq("id", donation.id);

        // Adjust campaign totals
        const { data: campaign } = await supabase
          .from("fund_campaigns")
          .select("raised_cents")
          .eq("id", donation.campaign_id)
          .single();

        if (campaign) {
          await supabase
            .from("fund_campaigns")
            .update({ raised_cents: Math.max(0, campaign.raised_cents - refundedAmount) })
            .eq("id", donation.campaign_id);
        }

        break;
      }
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
  }

  return NextResponse.json({ received: true });
}

async function applyMatchingRules(
  supabase: ReturnType<typeof createServiceClient>,
  donationId: string,
  campaignId: string,
  amountCents: number
) {
  // Find applicable matching rules
  const now = new Date().toISOString();

  const { data: campaign } = await supabase
    .from("fund_campaigns")
    .select("category")
    .eq("id", campaignId)
    .single();

  if (!campaign) return;

  const { data: rules } = await supabase
    .from("fund_matching_rules")
    .select("*")
    .eq("is_active", true)
    .or(`campaign_id.eq.${campaignId},campaign_id.is.null`)
    .or(`category.eq.${campaign.category},category.is.null`)
    .lte("starts_at", now)
    .or(`ends_at.gte.${now},ends_at.is.null`);

  if (!rules || rules.length === 0) return;

  for (const rule of rules) {
    const remainingBudget = rule.total_budget_cents - rule.spent_cents;
    if (remainingBudget <= 0) continue;

    let matchAmount = Math.round(amountCents * rule.match_ratio);
    if (rule.max_match_cents) matchAmount = Math.min(matchAmount, rule.max_match_cents);
    matchAmount = Math.min(matchAmount, remainingBudget);

    if (matchAmount <= 0) continue;

    // Update donation with matched amount
    await supabase
      .from("fund_donations")
      .update({ matched_amount_cents: matchAmount })
      .eq("id", donationId);

    // Update rule spent amount
    await supabase
      .from("fund_matching_rules")
      .update({ spent_cents: rule.spent_cents + matchAmount })
      .eq("id", rule.id);

    // Add matched amount to campaign
    const { data: c } = await supabase
      .from("fund_campaigns")
      .select("raised_cents")
      .eq("id", campaignId)
      .single();

    if (c) {
      await supabase
        .from("fund_campaigns")
        .update({ raised_cents: c.raised_cents + matchAmount })
        .eq("id", campaignId);
    }

    break; // Apply only the first matching rule
  }
}
