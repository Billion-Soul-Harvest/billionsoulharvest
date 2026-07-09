import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/shared/utils/supabase/server";
import { getServiceSupabase } from "@/features/email/send-campaign";
import { encryptPassword } from "@/shared/utils/mailbox/crypto";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    const authSupabase = await createServerClient();
    const { data: { user } } = await authSupabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { accountId } = await params;
    const body = await request.json();
    const update: Record<string, unknown> = {};

    if (body.label !== undefined) update.label = body.label;
    if (body.email_address !== undefined) update.email_address = body.email_address;
    if (body.imap_host !== undefined) update.imap_host = body.imap_host;
    if (body.imap_port !== undefined) update.imap_port = body.imap_port;
    if (body.smtp_host !== undefined) update.smtp_host = body.smtp_host;
    if (body.smtp_port !== undefined) update.smtp_port = body.smtp_port;
    if (body.username !== undefined) update.username = body.username;
    if (body.is_active !== undefined) update.is_active = body.is_active;
    if (body.password) update.encrypted_password = encryptPassword(body.password);

    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from("email_accounts")
      .update(update)
      .eq("id", accountId)
      .select("id, label, email_address, imap_host, imap_port, smtp_host, smtp_port, username, is_active, created_at, updated_at")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to update account" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    const authSupabase = await createServerClient();
    const { data: { user } } = await authSupabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { accountId } = await params;
    const supabase = getServiceSupabase();
    const { error } = await supabase
      .from("email_accounts")
      .delete()
      .eq("id", accountId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to delete account" }, { status: 500 });
  }
}
