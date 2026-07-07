import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { registrationSchema } from "@/features/registration/schema";
import { z } from "zod";
import QRCode from "qrcode";
import { render } from "@react-email/components";
import { RegistrationConfirmationEmail } from "@/features/email/templates/registration-confirmation";
import { sendEmail, getFromAddress } from "@/shared/utils/send-email";
import type { RegistrationConfig } from "@/shared/types/database";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function buildDynamicSchema(config: RegistrationConfig) {
  const shape: Record<string, z.ZodTypeAny> = {
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
  };

  const fieldDefs: Array<{ key: string; field?: { visible: boolean; required: boolean }; zodRequired: z.ZodTypeAny; zodOptional: z.ZodTypeAny }> = [
    { key: "region", field: config.fields.region, zodRequired: z.string().min(1), zodOptional: z.string().optional() },
    { key: "country", field: config.fields.country, zodRequired: z.string().min(1), zodOptional: z.string().optional() },
    { key: "visaRequired", field: config.fields.visaRequired, zodRequired: z.string().min(1), zodOptional: z.string().optional() },
    { key: "passportNumber", field: config.fields.passportNumber, zodRequired: z.string().min(1), zodOptional: z.string().optional() },
    { key: "phone", field: config.fields.phone, zodRequired: z.string().min(1), zodOptional: z.string().optional() },
    { key: "churchName", field: config.fields.churchName, zodRequired: z.string().min(1), zodOptional: z.string().optional() },
    { key: "churchRole", field: config.fields.churchRole, zodRequired: z.string().min(1), zodOptional: z.string().optional() },
    { key: "referredBy", field: config.fields.referredBy, zodRequired: z.string().min(1), zodOptional: z.string().optional() },
    { key: "city", field: config.fields.city, zodRequired: z.string().min(1), zodOptional: z.string().optional() },
    { key: "dietaryRequirements", field: config.fields.dietaryRequirements, zodRequired: z.string().min(1), zodOptional: z.string().optional() },
    { key: "howHeard", field: config.fields.howHeard, zodRequired: z.string().min(1), zodOptional: z.string().optional() },
    { key: "specialNeeds", field: config.fields.specialNeeds, zodRequired: z.string().min(1), zodOptional: z.string().optional() },
  ];

  for (const { key, field, zodRequired, zodOptional } of fieldDefs) {
    if (field?.visible) {
      shape[key] = field.required ? zodRequired : zodOptional;
    }
  }

  return z.object(shape);
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const body = await request.json();
    const { eventSlug, customFields, ...formData } = body;

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

    // Use dynamic schema if registration_config exists, otherwise use static schema
    const regConfig = event.registration_config as RegistrationConfig | null;
    const validationSchema = regConfig ? buildDynamicSchema(regConfig) : registrationSchema;

    const result = validationSchema.safeParse(formData);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const data = result.data as Record<string, string | undefined>;

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
      email: (data.email as string).toLowerCase(),
      phone: data.phone || null,
      church_name: data.churchName || null,
      church_role: data.churchRole || null,
      city: data.city || null,
      country: data.country || null,
      contact_type: data.churchRole?.toLowerCase().includes("pastor") ? "pastor" as const : "attendee" as const,
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
    const allCustomFields = {
      ...(customFields || {}),
      ...(data.region ? { region: data.region } : {}),
      ...(data.visaRequired ? { visaRequired: data.visaRequired } : {}),
      ...(data.passportNumber ? { passportNumber: data.passportNumber } : {}),
      ...(data.referredBy ? { referredBy: data.referredBy } : {}),
    };

    const { data: registration, error: regError } = await supabase
      .from("registrations")
      .insert({
        event_id: event.id,
        contact_id: contact.id,
        church_name: data.churchName || null,
        church_role: data.churchRole || null,
        city: data.city || null,
        country: data.country || null,
        dietary_requirements: data.dietaryRequirements || null,
        special_needs: data.specialNeeds || null,
        how_heard: data.howHeard || null,
        custom_fields: allCustomFields,
        status: "confirmed",
      })
      .select("id")
      .single();

    if (regError) {
      console.error("Registration error:", regError);
      return NextResponse.json(
        { error: "Failed to create registration" },
        { status: 500 }
      );
    }

    // Send confirmation email
    try {
      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL || "https://billionsoulharvest.org";
      const checkInUrl = `${siteUrl}/check-in/${registration.id}`;
      const qrCodeUrl = await QRCode.toDataURL(checkInUrl, {
        width: 200,
        margin: 2,
        color: { dark: "#1a3a2a" },
      });

      const html = await render(
        RegistrationConfirmationEmail({
          firstName: data.firstName as string,
          eventTitle: event.title,
          eventDate: event.start_date,
          eventLocation: event.location || event.city || "TBD",
          qrCodeUrl,
          registrationId: registration.id,
        })
      );

      const result = await sendEmail({
        from: getFromAddress(),
        to: data.email as string,
        subject: `Registration Confirmed — ${event.title}`,
        html,
      });
      if (!result.success) {
        console.error("Email send failed:", result.error);
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
