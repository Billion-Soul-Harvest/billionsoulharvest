import { createClient } from "@/shared/utils/supabase/server";
import { notFound } from "next/navigation";
import { ContactDetail } from "@/features/contacts/contact-detail";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("contacts")
    .select("first_name, last_name")
    .eq("id", id)
    .single();

  return {
    title: data ? `${data.first_name} ${data.last_name} — BSH Admin` : "Contact",
  };
}

export default async function ContactDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const [
    { data: contact, error },
    { data: regions },
    { data: positions },
    { data: registrations },
    { data: followUps },
    { data: notes },
    { data: audiences },
  ] = await Promise.all([
    supabase
      .from("contacts")
      .select("*, region:ministry_regions(id, name, color), position:positions(id, name)")
      .eq("id", id)
      .single(),
    supabase.from("ministry_regions").select("id, name, color").order("name"),
    supabase.from("positions").select("id, name").order("name"),
    supabase
      .from("registrations")
      .select("*, event:events(title, slug, start_date)")
      .eq("contact_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("follow_ups")
      .select("*")
      .eq("contact_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("contact_notes")
      .select("*")
      .eq("contact_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("audiences")
      .select("id, name")
      .eq("type", "list")
      .order("name"),
  ]);

  if (error || !contact) notFound();

  return (
    <ContactDetail
      contact={contact}
      regions={regions ?? []}
      positions={positions ?? []}
      registrations={registrations ?? []}
      followUps={followUps ?? []}
      notes={notes ?? []}
      audiences={audiences ?? []}
    />
  );
}
