import { createClient } from "@/shared/utils/supabase/server";
import { RegistrationsTable } from "@/features/registration/registrations-table";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Registrations — BSH Admin",
};

export default async function RegistrationsPage() {
  const supabase = await createClient();

  const { data: events } = await supabase
    .from("events")
    .select("id, title, slug")
    .order("created_at", { ascending: false });

  const { data: registrations } = await supabase
    .from("registrations")
    .select(`
      *,
      contact:contacts(first_name, last_name, email, phone, church_name),
      event:events(title, slug)
    `)
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Registrations</h1>
      <RegistrationsTable
        registrations={registrations ?? []}
        events={events ?? []}
      />
    </div>
  );
}
