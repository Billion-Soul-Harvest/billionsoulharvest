import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/shared/utils/supabase/server";
import { createServiceClient } from "@/shared/utils/supabase/service";
import type { AdminRole } from "@/shared/types/database";

async function verifySuperAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized", status: 401, userId: null };

  const { data: caller } = await supabase
    .from("admin_users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (caller?.role !== "super_admin") {
    return { error: "Forbidden", status: 403, userId: null };
  }

  return { error: null, status: null, userId: user.id };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error, status, userId } = await verifySuperAdmin();
  if (error) return NextResponse.json({ error }, { status: status! });

  // Prevent self-demotion
  if (id === userId) {
    return NextResponse.json(
      { error: "Cannot modify your own account" },
      { status: 400 }
    );
  }

  const body = await request.json();
  const updates: Record<string, unknown> = {};

  if (body.role) {
    const validRoles: AdminRole[] = ["super_admin", "admin", "editor"];
    if (!validRoles.includes(body.role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    updates.role = body.role;
  }

  if (body.display_name !== undefined) {
    updates.display_name = body.display_name || null;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 }
    );
  }

  const serviceClient = createServiceClient();
  const { error: updateError } = await serviceClient
    .from("admin_users")
    .update(updates)
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error, status, userId } = await verifySuperAdmin();
  if (error) return NextResponse.json({ error }, { status: status! });

  // Prevent self-deletion
  if (id === userId) {
    return NextResponse.json(
      { error: "Cannot delete your own account" },
      { status: 400 }
    );
  }

  const serviceClient = createServiceClient();

  // Delete from admin_users first
  const { error: deleteError } = await serviceClient
    .from("admin_users")
    .delete()
    .eq("id", id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 400 });
  }

  // Delete from auth
  const { error: authError } =
    await serviceClient.auth.admin.deleteUser(id);

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
