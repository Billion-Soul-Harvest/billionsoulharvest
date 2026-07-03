import { createClient } from "@/shared/utils/supabase/server";
import { notFound } from "next/navigation";
import { EventForm } from "@/features/events/event-form";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Metadata } from "next";
import type { EventStatus, EventSpeaker, EventProgram, EventFaq, EventSection, EventPage, EventPageBlock } from "@/shared/types/database";
import { SpeakersEditor } from "@/features/events/admin/speakers-editor";
import { ProgramEditor } from "@/features/events/admin/program-editor";
import { FaqEditor } from "@/features/events/admin/faq-editor";
import { SectionsEditor } from "@/features/events/admin/sections-editor";
import { PageManager } from "@/features/events/admin/page-manager";
import { DeleteEventButton } from "@/features/events/admin/delete-event-button";

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

  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !event) notFound();

  const { data: regions } = await supabase
    .from("ministry_regions")
    .select("id, name")
    .order("name");

  const [
    { data: registrations },
    { data: speakers },
    { data: programs },
    { data: faqs },
    { data: sections },
    { data: eventPages },
    { data: pageBlocks },
  ] = await Promise.all([
    supabase
      .from("registrations")
      .select("*, contact:contacts(first_name, last_name, email, phone)")
      .eq("event_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("event_speakers")
      .select("*")
      .eq("event_id", id)
      .order("sort_order"),
    supabase
      .from("event_programs")
      .select("*")
      .eq("event_id", id)
      .order("day_date")
      .order("start_time"),
    supabase
      .from("event_faqs")
      .select("*")
      .eq("event_id", id)
      .order("sort_order"),
    supabase
      .from("event_sections")
      .select("*")
      .eq("event_id", id)
      .order("sort_order"),
    supabase
      .from("event_pages")
      .select("*")
      .eq("event_id", id)
      .order("sort_order"),
    supabase
      .from("event_page_blocks")
      .select("*")
      .eq("event_id", id)
      .order("sort_order"),
  ]);

  const regCount = registrations?.filter((r) => r.status !== "cancelled").length ?? 0;
  const typedSpeakers = (speakers ?? []) as unknown as EventSpeaker[];
  const typedPrograms = (programs ?? []) as unknown as EventProgram[];
  const typedFaqs = (faqs ?? []) as unknown as EventFaq[];
  const typedSections = (sections ?? []) as unknown as EventSection[];
  const typedPages = (eventPages ?? []) as unknown as EventPage[];
  const typedBlocks = (pageBlocks ?? []) as unknown as EventPageBlock[];

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
        <div>
          <p className="text-3xl font-bold text-gray-900">{regCount}</p>
          <p className="text-sm text-gray-500">registrations</p>
        </div>
        {event.max_registrations && (
          <div>
            <p className="text-3xl font-bold text-gray-400">{event.max_registrations}</p>
            <p className="text-sm text-gray-400">max capacity</p>
          </div>
        )}
        {event.status === "registration_open" && (
          <div className="ml-auto">
            <p className="text-xs text-gray-400 mb-1">Public registration link:</p>
            <code className="text-sm bg-gray-50 px-3 py-1 rounded border text-cyan-700">
              /register/{event.slug}
            </code>
          </div>
        )}
      </div>

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="speakers">Speakers ({typedSpeakers.length})</TabsTrigger>
          <TabsTrigger value="program">Program ({typedPrograms.length})</TabsTrigger>
          <TabsTrigger value="faqs">FAQ ({typedFaqs.length})</TabsTrigger>
          <TabsTrigger value="sections">Sections ({typedSections.length})</TabsTrigger>
          <TabsTrigger value="pages">Pages ({typedPages.length})</TabsTrigger>
          <TabsTrigger value="registrations">Registrations ({registrations?.length ?? 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Edit Event</h2>
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
                  region_id: event.region_id ?? "",
                  max_registrations: event.max_registrations?.toString() ?? "",
                }}
                regions={regions ?? []}
              />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Public event page:</p>
              <code className="text-sm bg-gray-50 px-3 py-1 rounded border text-blue-700">
                /events/{event.slug}
              </code>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="speakers">
          <SpeakersEditor eventId={event.id} initialSpeakers={typedSpeakers} />
        </TabsContent>

        <TabsContent value="program">
          <ProgramEditor eventId={event.id} initialPrograms={typedPrograms} speakers={typedSpeakers} />
        </TabsContent>

        <TabsContent value="faqs">
          <FaqEditor eventId={event.id} initialFaqs={typedFaqs} />
        </TabsContent>

        <TabsContent value="sections">
          <SectionsEditor eventId={event.id} initialSections={typedSections} />
        </TabsContent>

        <TabsContent value="pages">
          <PageManager eventId={event.id} initialPages={typedPages} initialBlocks={typedBlocks} />
        </TabsContent>

        <TabsContent value="registrations">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Registrations ({registrations?.length ?? 0})
          </h2>
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {registrations && registrations.length > 0 ? registrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <Link href={`/contacts/${reg.contact_id}`} className="font-medium text-gray-900 hover:text-blue-700">
                          {reg.contact?.first_name} {reg.contact?.last_name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{reg.contact?.email}</td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary" className={
                          reg.status === "confirmed" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                        }>{reg.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {new Date(reg.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                        No registrations yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
