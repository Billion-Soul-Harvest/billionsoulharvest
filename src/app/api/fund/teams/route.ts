import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/shared/utils/supabase/server";
import { generateUniqueSlug } from "@/features/fund/utils/slug";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("fund_teams")
      .select("*, members:fund_team_members(*)")
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name, description, goal_cents } = await request.json();

    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const slug = generateUniqueSlug(name);

    const { data: team, error } = await supabase
      .from("fund_teams")
      .insert({
        name,
        slug,
        description: description || null,
        goal_cents: goal_cents || 0,
        captain_id: user.id,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Add creator as captain
    await supabase.from("fund_team_members").insert({
      team_id: team.id,
      user_id: user.id,
      role: "captain",
    });

    return NextResponse.json(team, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
