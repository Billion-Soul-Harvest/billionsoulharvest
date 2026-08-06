import { createClient } from "@/shared/utils/supabase/server";
import { notFound } from "next/navigation";
import { EventForm } from "@/features/events/event-form";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { EventStatus, RegistrationConfig } from "@/shared/types/database";
import { DeleteEventButton } from "@/features/events/admin/delete-event-button";
import { EventPageCard } from "./event-page-card";
import { EventDetailTabs } from "./event-detail-tabs";
// import { RegistrationFieldsManager } from "@/features/events/admin/registration-fields-manager";

interface Props {
  params: Promise<{ id: string }>;
}

const statusColors: Record<EventStatus, string> = {
  draft: "bg-gray-100 text-gray-700",
  published: "bg-blue-100 text-blue-700",
  registration_open: "bg-green-100 text-green-700",
  registration_closed: "bg-amber-100 text-amber-700",
  completed: "bg-purple-100 text-purple-700",
  cancelled: "bg-red-100 text-red-700",
};

export const dynamic = "force-dynamic";

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: event, error } = await supabase.from("events").select("*").eq("id", id).single();

  if (error || !event) notFound();

  const { data: registrations } = await supabase
    .from("registrations")
    .select("*, contact:contacts(first_name, last_name, email, phone)")
    .eq("event_id", id)
    .order("created_at", { ascending: false });

  const regCount = registrations?.filter((r) => r.status !== "cancelled").length ?? 0;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/events" className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 flex-1">{event.title}</h1>
        <Badge variant="secondary" className={statusColors[event.status as EventStatus]}>
          {event.status.replace("_", " ")}
        </Badge>
        <DeleteEventButton eventId={event.id} eventTitle={event.title} />
      </div>

      {/* Registration stats */}
      <div className="bg-white rounded-xl border p-5 mb-6 flex items-center gap-8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-green-100 text-green-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">{regCount}</p>
            <p className="text-sm text-gray-500">registrations</p>
          </div>
        </div>
        {event.max_registrations && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-amber-100 text-amber-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-400">{event.max_registrations}</p>
              <p className="text-sm text-gray-400">max capacity</p>
            </div>
          </div>
        )}
        {((event.registration_config as RegistrationConfig | null)?.enabled || event.status === "registration_open") && (
          <div className="ml-auto">
            <p className="text-xs text-gray-400 mb-1">Public registration link:</p>
            <code className="text-sm bg-gray-50 px-3 py-1 rounded border text-cyan-700">
              /register/{event.slug}
            </code>
          </div>
        )}
      </div>

      {/* Event Page — Google Sites integration */}
      <EventPageCard eventId={event.id} externalUrl={event.external_url} />

      <EventDetailTabs
        tabs={[
          {
            id: "details",
            label: "Gathering Details",
            content: (
              <EventForm
                event={{
                  id: event.id,
                  title: event.title,
                  slug: event.slug,
                  description: event.description ?? "",
                  event_type: event.event_type ?? "conference",
                  location: event.location ?? "",
                  city: event.city ?? "",
                  country: event.country ?? "",
                  start_date: event.start_date ?? "",
                  end_date: event.end_date ?? "",
                  status: event.status as EventStatus,
                  address: event.address ?? "",
                  region: event.region ?? "",
                  postal_code: event.postal_code ?? "",
                  max_registrations: event.max_registrations?.toString() ?? "",
                  banner_url: event.banner_url ?? "",
                  is_external: event.is_external ?? false,
                  external_url: event.external_url ?? "",
                  registration_config: event.registration_config as RegistrationConfig | null,
                }}
              />
            ),
          },
          // {
          //   id: "registration",
          //   label: "Registration",
          //   — temporarily hidden
          // },
        ]}
      />
    </div>
  );
}
