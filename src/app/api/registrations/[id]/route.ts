import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/shared/utils/supabase/server";
import QRCode from "qrcode";
import { render } from "@react-email/components";
import { RegistrationConfirmationEmail } from "@/features/email/templates/registration-confirmation";
import { sendEmail, getFromAddress } from "@/shared/utils/send-email";

const VALID_STATUSES = ["confirmed", "pending", "cancelled", "waitlisted"] as const;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Auth check
    const authSupabase = await createServerClient();
    const { data: { user } } = await authSupabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Validate UUID format
    if (!UUID_REGEX.test(id)) {
      return NextResponse.json({ error: "Invalid registration ID" }, { status: 400 });
    }

    const body = await request.json();
    const { action, ...payload } = body;

    const supabase = getSupabase();

    if (action === "update_status") {
      const { status } = payload;
      if (!status || !VALID_STATUSES.includes(status)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` },
          { status: 400 }
        );
      }

      const { data, error } = await supabase
        .from("registrations")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error || !data) {
        if (error?.code === "PGRST116") {
          return NextResponse.json({ error: "Registration not found" }, { status: 404 });
        }
        console.error("Update status error:", error);
        return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
      }

      return NextResponse.json(data);
    }

    if (action === "update_notes") {
      const { notes } = payload;
      if (typeof notes !== "string") {
        return NextResponse.json({ error: "Notes must be a string" }, { status: 400 });
      }
      if (notes.length > 5000) {
        return NextResponse.json({ error: "Notes must be 5000 characters or fewer" }, { status: 400 });
      }

      const { data, error } = await supabase
        .from("registrations")
        .update({ notes, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error || !data) {
        if (error?.code === "PGRST116") {
          return NextResponse.json({ error: "Registration not found" }, { status: 404 });
        }
        console.error("Update notes error:", error);
        return NextResponse.json({ error: "Failed to update notes" }, { status: 500 });
      }

      return NextResponse.json(data);
    }

    if (action === "resend_email") {
      const { data: registration, error } = await supabase
        .from("registrations")
        .select("*, contact:contacts(*), event:events(*)")
        .eq("id", id)
        .single();

      if (error || !registration) {
        if (error?.code === "PGRST116") {
          return NextResponse.json({ error: "Registration not found" }, { status: 404 });
        }
        console.error("Fetch registration error:", error);
        return NextResponse.json({ error: "Failed to fetch registration" }, { status: 500 });
      }

      const contact = registration.contact;
      const event = registration.event;

      if (!contact || !contact.email) {
        return NextResponse.json({ error: "Contact not found for this registration" }, { status: 404 });
      }
      if (!event) {
        return NextResponse.json({ error: "Event not found for this registration" }, { status: 404 });
      }

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://billionsoulharvest.org";
      const checkInUrl = `${siteUrl}/check-in/${registration.id}`;

      const qrCodeUrl = await QRCode.toDataURL(checkInUrl, {
        width: 200,
        margin: 2,
        color: { dark: "#1a3a2a" },
      });

      const html = await render(
        RegistrationConfirmationEmail({
          firstName: contact.first_name,
          eventTitle: event.title,
          eventDate: event.start_date,
          eventLocation: event.location || event.city || "TBD",
          qrCodeUrl,
          registrationId: registration.id,
        })
      );

      const result = await sendEmail({
        from: getFromAddress(),
        to: contact.email,
        subject: `Registration Confirmed — ${event.title}`,
        html,
      });

      if (!result.success) {
        console.error("Email send failed:", result.error);
        return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
      }

      return NextResponse.json(registration);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Registration action error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authSupabase = await createServerClient();
    const { data: { user } } = await authSupabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!UUID_REGEX.test(id)) {
      return NextResponse.json({ error: "Invalid registration ID" }, { status: 400 });
    }

    const supabase = getSupabase();
    const { error } = await supabase
      .from("registrations")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Delete registration error:", error);
      return NextResponse.json({ error: "Failed to delete registration" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete registration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
