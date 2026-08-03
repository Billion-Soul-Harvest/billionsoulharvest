import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/shared/utils/supabase/server";
import { generateUniqueSlug } from "@/features/fund/utils/slug";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = request.nextUrl;
    const category = searchParams.get("category");
    const search = searchParams.get("q");
    const sort = searchParams.get("sort") || "recent";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const featured = searchParams.get("featured");
    const status = searchParams.get("status");
    const all = searchParams.get("all");

    // Advanced filter params
    const dateFrom = searchParams.get("date_from");
    const dateTo = searchParams.get("date_to");
    const goalMin = searchParams.get("goal_min");
    const goalMax = searchParams.get("goal_max");
    const raisedMin = searchParams.get("raised_min");
    const raisedMax = searchParams.get("raised_max");
    const donorMin = searchParams.get("donor_min");
    const donorMax = searchParams.get("donor_max");

    let query = supabase
      .from("fund_campaigns")
      .select("*, creator:fund_profiles!fund_campaigns_creator_profile_fkey(*)", { count: "exact" });

    if (all !== "true") {
      if (status) {
        query = query.eq("status", status);
      } else {
        query = query.eq("status", "active");
      }
    } else if (status) {
      query = query.eq("status", status);
    }

    if (category) query = query.eq("category", category);
    if (featured === "true") query = query.eq("is_featured", true);
    if (featured === "false") query = query.eq("is_featured", false);
    if (search) query = query.ilike("title", `%${search}%`);

    // Date range filters
    if (dateFrom) query = query.gte("created_at", dateFrom);
    if (dateTo) query = query.lte("created_at", dateTo + "T23:59:59");

    // Amount range filters (values come in as cents)
    if (goalMin) query = query.gte("goal_cents", parseInt(goalMin));
    if (goalMax) query = query.lte("goal_cents", parseInt(goalMax));
    if (raisedMin) query = query.gte("raised_cents", parseInt(raisedMin));
    if (raisedMax) query = query.lte("raised_cents", parseInt(raisedMax));

    // Donor count range
    if (donorMin) query = query.gte("donor_count", parseInt(donorMin));
    if (donorMax) query = query.lte("donor_count", parseInt(donorMax));

    // Sorting
    if (sort === "most_funded") {
      query = query.order("raised_cents", { ascending: false });
    } else if (sort === "most_donors") {
      query = query.order("donor_count", { ascending: false });
    } else if (sort === "ending_soon") {
      query = query.not("end_date", "is", null).order("end_date", { ascending: true });
    } else if (sort === "oldest") {
      query = query.order("created_at", { ascending: true });
    } else if (sort === "goal_high") {
      query = query.order("goal_cents", { ascending: false });
    } else if (sort === "goal_low") {
      query = query.order("goal_cents", { ascending: true });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const from = (page - 1) * limit;
    query = query.range(from, from + limit - 1);

    const { data, count, error } = await query;

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ campaigns: data, total: count, page, limit });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Ensure fund_profile exists for this user
    await supabase
      .from("fund_profiles")
      .upsert(
        { id: user.id, display_name: user.email?.split("@")[0] || "User" },
        { onConflict: "id", ignoreDuplicates: true }
      );

    const body = await request.json();
    const { title, story_html, category, goal_cents, banner_url, gallery_images, end_date, team_id } = body;

    if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

    const slug = generateUniqueSlug(title);

    const { data, error } = await supabase
      .from("fund_campaigns")
      .insert({
        creator_id: user.id,
        title,
        slug,
        story_html: story_html || "",
        category: category || "other",
        goal_cents: goal_cents || 0,
        banner_url: banner_url || null,
        gallery_images: gallery_images || [],
        end_date: end_date || null,
        team_id: team_id || null,
        status: "draft",
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
