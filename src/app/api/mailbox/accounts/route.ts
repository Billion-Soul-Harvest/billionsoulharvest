import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/shared/utils/supabase/server";
import { getServiceSupabase } from "@/features/email/send-campaign";
import { encryptPassword } from "@/shared/utils/mailbox/crypto";
import { testImapConnection } from "@/shared/utils/mailbox/imap-client";

export async function GET() {
  try {
    const authSupabase = await createServerClient();
    const { data: { user } } = await authSupabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from("email_accounts")
      .select("id, label, email_address, imap_host, imap_port, smtp_host, smtp_port, username, is_active, created_at, updated_at")
      .order("created_at", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to fetch accounts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authSupabase = await createServerClient();
    const { data: { user } } = await authSupabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { label, email_address, imap_host, imap_port, smtp_host, smtp_port, username, password } = body;

    if (!label || !email_address || !username || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Test IMAP connection before saving
    const imapTest = await testImapConnection({
      imap_host: imap_host || "imap.hostinger.com",
      imap_port: imap_port || 993,
      username,
      password,
    });

    if (!imapTest.success) {
      return NextResponse.json({ error: `IMAP connection failed: ${imapTest.error}` }, { status: 400 });
    }

    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from("email_accounts")
      .insert({
        label,
        email_address,
        imap_host: imap_host || "imap.hostinger.com",
        imap_port: imap_port || 993,
        smtp_host: smtp_host || "smtp.hostinger.com",
        smtp_port: smtp_port || 465,
        username,
        encrypted_password: encryptPassword(password),
        created_by: user.id,
      })
      .select("id, label, email_address, imap_host, imap_port, smtp_host, smtp_port, username, is_active, created_at, updated_at")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to create account" }, { status: 500 });
  }
}
