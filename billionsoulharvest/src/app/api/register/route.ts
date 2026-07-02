import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { registrationSchema } from "@/features/registration/schema";
import { Resend } from "resend";
import { RegistrationConfirmationEmail } from "@/features/email/templates/registration-confirmation";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const resend = getResend();
    const body = await request.json();
    const { eventSlug, ...formData } = body;

    // Validate form data
    const result = registrationSchema.safeParse(formData);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const data = result.data;

    // Fetch event
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("slug", eventSlug)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.status !== "registration_open") {
      return NextResponse.json(
        { error: "Registration is not open for this event" },
        { status: 400 }
      );
    }

    // Check max registrations
    if (event.max_registrations) {
      const { count } = await supabase
        .from("registrations")
        .select("*", { count: "exact", head: true })
        .eq("event_id", event.id)
        .neq("status", "cancelled");

      if (count && count >= event.max_registrations) {
        return NextResponse.json(
          { error: "This event is at capacity" },
          { status: 400 }
        );
      }
    }

    // Upsert contact
    const contactData = {
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email.toLowerCase(),
      phone: data.phone || null,
      church_name: data.churchName || null,
      church_role: data.churchRole,
      city: data.city || null,
      country: data.country,
      contact_type: data.churchRole === "pastor" ? "pastor" as const : "attendee" as const,
    };

    const { data: contact, error: contactError } = await supabase
      .from("contacts")
      .upsert(contactData, { onConflict: "email" })
      .select("id")
      .single();

    if (contactError) {
      console.error("Contact upsert error:", contactError);
      return NextResponse.json(
        { error: "Failed to create contact" },
        { status: 500 }
      );
    }

    // Check for existing registration
    const { data: existingReg } = await supabase
      .from("registrations")
      .select("id")
      .eq("event_id", event.id)
      .eq("contact_id", contact.id)
      .single();

    if (existingReg) {
      return NextResponse.json(
        { error: "You are already registered for this event" },
        { status: 409 }
      );
    }

    // Create registration
    const { error: regError } = await supabase.from("registrations").insert({
      event_id: event.id,
      contact_id: contact.id,
      church_name: data.churchName || null,
      church_role: data.churchRole,
      city: data.city || null,
      country: data.country,
      dietary_requirements: data.dietaryRequirements || null,
      special_needs: data.specialNeeds || null,
      how_heard: data.howHeard || null,
      status: "confirmed",
    });

    if (regError) {
      console.error("Registration error:", regError);
      return NextResponse.json(
        { error: "Failed to create registration" },
        { status: 500 }
      );
    }

    // Send confirmation email
    try {
      if (process.env.RESEND_API_KEY) {
        await resend.emails.send({
          from: "Billion Soul Harvest <noreply@billionsoulharvest.org>",
          to: data.email,
          subject: `Registration Confirmed — ${event.title}`,
          react: RegistrationConfirmationEmail({
            firstName: data.firstName,
            eventTitle: event.title,
            eventDate: event.start_date,
            eventLocation: event.location || event.city || "TBD",
          }),
        });
      }
    } catch (emailError) {
      // Don't fail registration if email fails
      console.error("Email send error:", emailError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Registration API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
