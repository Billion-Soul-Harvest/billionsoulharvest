import { createClient } from "@/shared/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import type { Event, EventSpeaker, EventProgram, EventFaq, EventSection, EventPage, EventPageBlock } from "@/shared/types/database";
import { EventHero } from "@/features/events/public/event-hero";
import { EventSpeakers } from "@/features/events/public/event-speakers";
import { EventProgramSchedule } from "@/features/events/public/event-program";
import { EventFaqSection } from "@/features/events/public/event-faq";
import { EventSections } from "@/features/events/public/event-sections";
import { EventPageTabs } from "@/features/events/public/event-page-tabs";
import { BlockRenderer } from "@/features/events/public/block-renderer";

interface Props {
  params: Promise<{ slug: string; pageSlug?: string[] }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("title, description")
    .eq("slug", slug)
    .single();

  if (!data) return { title: "Event Not Found" };
  return {
    title: `${data.title} — Billion Soul Harvest`,
    description: data.description ?? undefined,
  };
}

export default async function EventPage({ params }: Props) {
  const { slug, pageSlug } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!event) notFound();

  // Fetch pages to decide between block-based and legacy rendering
  const { data: eventPages } = await supabase
    .from("event_pages")
    .select("*")
    .eq("event_id", event.id)
    .eq("published", true)
    .order("sort_order");

  const typedEvent = event as unknown as Event;
  const typedPages = (eventPages ?? []) as unknown as EventPage[];

  // If no pages configured, fall back to legacy fixed layout
  if (typedPages.length === 0) {
    return <LegacyLayout event={typedEvent} supabase={supabase} />;
  }

  // Determine active page
  const activePageSlug = pageSlug?.[0] ?? typedPages[0]?.slug;
  const activePage = typedPages.find((p) => p.slug === activePageSlug);
  if (!activePage) notFound();

  // Fetch blocks + related data in parallel
  const [
    { data: blocks },
    { data: speakers },
    { data: programs },
    { data: faqs },
  ] = await Promise.all([
    supabase
      .from("event_page_blocks")
      .select("*")
      .eq("page_id", activePage.id)
      .eq("published", true)
      .order("sort_order"),
    supabase
      .from("event_speakers")
      .select("*")
      .eq("event_id", event.id)
      .order("sort_order"),
    supabase
      .from("event_programs")
      .select("*")
      .eq("event_id", event.id)
      .order("day_date")
      .order("start_time"),
    supabase
      .from("event_faqs")
      .select("*")
      .eq("event_id", event.id)
      .order("sort_order"),
  ]);

  const typedBlocks = (blocks ?? []) as unknown as EventPageBlock[];
  const typedSpeakers = (speakers ?? []) as unknown as EventSpeaker[];
  const typedPrograms = (programs ?? []) as unknown as EventProgram[];
  const typedFaqs = (faqs ?? []) as unknown as EventFaq[];

  return (
    <div>
      <EventPageTabs
        eventSlug={slug}
        pages={typedPages}
        activePageSlug={activePage.slug}
      />
      <BlockRenderer
        event={typedEvent}
        blocks={typedBlocks}
        speakers={typedSpeakers}
        programs={typedPrograms}
        faqs={typedFaqs}
      />
    </div>
  );
}

// Legacy fixed layout for events without configured pages
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function LegacyLayout({ event, supabase }: { event: Event; supabase: any }) {
  const [
    { data: speakers },
    { data: programs },
    { data: faqs },
    { data: sections },
  ] = await Promise.all([
    supabase
      .from("event_speakers")
      .select("*")
      .eq("event_id", event.id)
      .order("sort_order"),
    supabase
      .from("event_programs")
      .select("*")
      .eq("event_id", event.id)
      .order("day_date")
      .order("start_time"),
    supabase
      .from("event_faqs")
      .select("*")
      .eq("event_id", event.id)
      .order("sort_order"),
    supabase
      .from("event_sections")
      .select("*")
      .eq("event_id", event.id)
      .eq("published", true)
      .order("sort_order"),
  ]);

  const typedSpeakers = (speakers ?? []) as unknown as EventSpeaker[];
  const typedPrograms = (programs ?? []) as unknown as EventProgram[];
  const typedFaqs = (faqs ?? []) as unknown as EventFaq[];
  const typedSections = (sections ?? []) as unknown as EventSection[];

  return (
    <div>
      <EventHero event={event} />

      {event.long_description && (
        <section className="py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-white mb-6 text-center">
              About This Event
            </h2>
            <div
              className="text-gray-300 leading-relaxed prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: event.long_description }}
            />
          </div>
        </section>
      )}

      <EventSpeakers speakers={typedSpeakers} />
      <EventProgramSchedule programs={typedPrograms} speakers={typedSpeakers} />
      <EventSections sections={typedSections} />
      <EventFaqSection faqs={typedFaqs} />

      {event.status === "registration_open" && (
        <section className="py-20 bg-[#0a1e38]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-white mb-4">
              Ready to Join?
            </h2>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto">
              Don&apos;t miss this opportunity to be part of what God is doing through the
              global harvest movement. Register today.
            </p>
            <Link
              href={`/register/${event.slug}`}
              className="inline-flex items-center gap-2 bg-[#29BDD6] hover:bg-[#1a9ab5] text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors shadow-lg shadow-[#29BDD6]/20"
            >
              Register Now
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
