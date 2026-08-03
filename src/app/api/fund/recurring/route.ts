import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/shared/utils/supabase/server";
import { getStripe } from "@/features/fund/utils/stripe";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
      .from("fund_recurring_subscriptions")
      .select("*, campaign:fund_campaigns(id, title, slug)")
      .eq("donor_id", user.id)
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { subscription_id } = await request.json();

    const { data: sub } = await supabase
      .from("fund_recurring_subscriptions")
      .select("*")
      .eq("id", subscription_id)
      .eq("donor_id", user.id)
      .single();

    if (!sub) return NextResponse.json({ error: "Subscription not found" }, { status: 404 });

    // Cancel in Stripe
    if (sub.stripe_subscription_id) {
      const stripe = getStripe();
      await stripe.subscriptions.cancel(sub.stripe_subscription_id);
    }

    await supabase
      .from("fund_recurring_subscriptions")
      .update({ status: "cancelled" })
      .eq("id", subscription_id);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
