import { createClient } from "@/shared/utils/supabase/server";
import { EventForm } from "@/features/events/event-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Event — BSH Admin",
};

export default async function NewEventPage() {
  const supabase = await createClient();
  const { data: regions } = await supabase
    .from("ministry_regions")
    .select("id, name")
    .order("name");

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">New Event</h1>
      <EventForm regions={regions ?? []} />
    </div>
  );
}
