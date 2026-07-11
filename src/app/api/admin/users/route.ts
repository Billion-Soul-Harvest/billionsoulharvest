import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/shared/utils/supabase/server";
import { createServiceClient } from "@/shared/utils/supabase/service";
import type { AdminRole } from "@/shared/types/database";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Verify caller is super_admin
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: caller } = await supabase
    .from("admin_users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (caller?.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const {
    email,
    password,
    display_name,
    role,
  }: {
    email: string;
    password: string;
    display_name: string;
    role: AdminRole;
  } = body;

  if (!email || !password || !role) {
    return NextResponse.json(
      { error: "email, password, and role are required" },
      { status: 400 }
    );
  }

  const validRoles: AdminRole[] = ["super_admin", "admin", "editor"];
  if (!validRoles.includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const serviceClient = createServiceClient();

  // Create auth user
  const { data: authData, error: authError } =
    await serviceClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 });
  }

  // Insert into admin_users
  const { error: insertError } = await serviceClient
    .from("admin_users")
    .insert({
      id: authData.user.id,
      role,
      display_name: display_name || null,
    });

  if (insertError) {
    // Rollback: delete the auth user we just created
    await serviceClient.auth.admin.deleteUser(authData.user.id);
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  return NextResponse.json({
    id: authData.user.id,
    email: authData.user.email,
    role,
    display_name: display_name || null,
  });
}
