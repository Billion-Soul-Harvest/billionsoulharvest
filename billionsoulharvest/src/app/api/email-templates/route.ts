import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/shared/utils/supabase/server";
import { getServiceSupabase } from "@/features/email/send-campaign";

export async function GET(request: NextRequest) {
  try {
    const authSupabase = await createServerClient();
    const { data: { user } } = await authSupabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getServiceSupabase();
    const url = new URL(request.url);
    const search = url.searchParams.get("search") ?? "";
    const status = url.searchParams.get("status") ?? "all";

    // Fetch templates with stats
    let query = supabase.from("email_template_stats").select("*");

    if (search) {
      query = query.or(`name.ilike.%${search}%,subject.ilike.%${search}%`);
    }

    const { data: templates, error } = await query.order("updated_at", { ascending: false });

    if (error) {
      console.error("Email templates fetch error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Filter by status client-side since it's a computed field
    let filtered = templates ?? [];
    if (status === "draft") {
      filtered = filtered.filter((t) => t.send_count === 0);
    } else if (status === "sent") {
      filtered = filtered.filter((t) => t.send_count > 0);
    }

    // Also fetch one-off campaigns (no template_id) as "Untitled" entries
    let oneOffQuery = supabase
      .from("campaigns")
      .select("*")
      .is("template_id", null)
      .in("status", ["sent", "sending"]);

    if (search) {
      oneOffQuery = oneOffQuery.or(`name.ilike.%${search}%,subject.ilike.%${search}%`);
    }

    const { data: oneOffs } = await oneOffQuery.order("completed_at", { ascending: false });

    const oneOffEntries = (oneOffs ?? []).map((c) => ({
      id: `campaign:${c.id}`,
      name: c.name || "Untitled send",
      subject: c.subject || "",
      body_html: c.body_html || "",
      preview_text: c.preview_text,
      created_by: c.created_by,
      created_at: c.created_at,
      updated_at: c.updated_at,
      total_sends: c.total_recipients,
      total_delivered: c.delivered_count,
      total_opened: c.opened_count,
      total_clicked: c.clicked_count,
      total_bounced: c.bounced_count,
      last_sent_at: c.completed_at,
      send_count: 1,
    }));

    // If showing drafts only, skip one-offs (they're always "sent")
    const combined = status === "draft" ? filtered : [...filtered, ...oneOffEntries];

    return NextResponse.json(combined);
  } catch (error) {
    console.error("Email templates GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authSupabase = await createServerClient();
    const { data: { user } } = await authSupabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getServiceSupabase();
    const body = await request.json();

    const { data, error } = await supabase
      .from("campaign_templates")
      .insert({
        name: body.name || "Untitled email",
        subject: body.subject || "",
        body_html: body.body_html || "",
        preview_text: body.preview_text || null,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Email templates POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
