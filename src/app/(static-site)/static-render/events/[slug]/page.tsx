import { createClient } from "@/shared/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import type {
  Event,
  EventSpeaker,
  EventProgram,
  EventFaq,
} from "@/shared/types/database";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
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

export default async function StaticEventPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!event) notFound();

  // External events: redirect if URL set, otherwise no page to show
  if (event.is_external && event.external_url) redirect(event.external_url);
  if (event.is_external) notFound();

  const typedEvent = event as unknown as Event;

  // Fetch related data
  const [{ data: speakers }, { data: programs }, { data: faqs }] =
    await Promise.all([
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

  const typedSpeakers = (speakers ?? []) as unknown as EventSpeaker[];
  const typedPrograms = (programs ?? []) as unknown as EventProgram[];
  const typedFaqs = (faqs ?? []) as unknown as EventFaq[];

  // Group programs by day
  const programsByDay = typedPrograms.reduce(
    (acc, p) => {
      const day = p.day_date ?? "TBD";
      if (!acc[day]) acc[day] = [];
      acc[day].push(p);
      return acc;
    },
    {} as Record<string, EventProgram[]>
  );

  return (
    <div>
      {/* Hero */}
      <section className="relative py-20 sm:py-32 overflow-hidden">
        {typedEvent.banner_url && (
          <div className="absolute inset-0">
            <img
              src={typedEvent.banner_url}
              alt={typedEvent.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-[#0f2744]/80" />
          </div>
        )}
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-[family-name:var(--font-heading)] text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            {typedEvent.title}
          </h1>
          {typedEvent.description && (
            <p className="text-lg text-gray-300/90 max-w-2xl mx-auto mb-8">
              {typedEvent.description}
            </p>
          )}
          <div className="flex flex-wrap justify-center gap-6 text-gray-300 text-sm">
            {typedEvent.start_date && (
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-[#29BDD6]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {new Date(
                  typedEvent.start_date + "T00:00:00"
                ).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
                {typedEvent.end_date && (
                  <>
                    {" "}
                    &ndash;{" "}
                    {new Date(
                      typedEvent.end_date + "T00:00:00"
                    ).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </>
                )}
              </div>
            )}
            {(typedEvent.city || typedEvent.country) && (
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-[#29BDD6]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {[typedEvent.city, typedEvent.country]
                  .filter(Boolean)
                  .join(", ")}
              </div>
            )}
          </div>
          {typedEvent.status === "registration_open" && (
            <div className="mt-10">
              <Link
                href={`/register/${typedEvent.slug}`}
                className="inline-flex items-center gap-2 bg-[#29BDD6] hover:bg-[#1a9ab5] text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors shadow-lg shadow-[#29BDD6]/20"
              >
                Register Now
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* About */}
      {typedEvent.long_description && (
        <section className="py-16 bg-[#0a1e38]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-white mb-6 text-center">
              About This Event
            </h2>
            <div
              className="text-gray-300 leading-relaxed prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: typedEvent.long_description }}
            />
          </div>
        </section>
      )}

      {/* Speakers */}
      {typedSpeakers.length > 0 && (
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-white mb-12 text-center">
              Speakers
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {typedSpeakers.map((speaker) => (
                <div key={speaker.id} className="text-center">
                  <div className="w-28 h-28 mx-auto mb-4 rounded-full overflow-hidden bg-white/10">
                    {speaker.photo_url ? (
                      <img
                        src={speaker.photo_url}
                        alt={speaker.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 text-2xl font-bold">
                        {speaker.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                    )}
                  </div>
                  <h3 className="text-white font-semibold">{speaker.name}</h3>
                  {speaker.title && (
                    <p className="text-gray-400 text-sm mt-1">
                      {speaker.title}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Program / Schedule */}
      {typedPrograms.length > 0 && (
        <section className="py-16 bg-[#0a1e38]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-white mb-12 text-center">
              Schedule
            </h2>
            <div className="space-y-10">
              {Object.entries(programsByDay).map(([day, items]) => (
                <div key={day}>
                  <h3 className="text-[#29BDD6] font-semibold text-lg mb-4">
                    {day !== "TBD"
                      ? new Date(day + "T00:00:00").toLocaleDateString(
                          "en-US",
                          {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                          }
                        )
                      : "Schedule"}
                  </h3>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-4 bg-white/5 border border-white/10 rounded-xl p-4"
                      >
                        {item.start_time && (
                          <div className="text-[#29BDD6] font-mono text-sm shrink-0 w-16">
                            {item.start_time.slice(0, 5)}
                          </div>
                        )}
                        <div>
                          <p className="text-white font-medium">{item.title}</p>
                          {item.description && (
                            <p className="text-gray-400 text-sm mt-1">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQs */}
      {typedFaqs.length > 0 && (
        <section className="py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-white mb-12 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {typedFaqs.map((faq) => (
                <details
                  key={faq.id}
                  className="group bg-white/5 border border-white/10 rounded-xl"
                >
                  <summary className="flex items-center justify-between cursor-pointer p-5 text-white font-medium">
                    {faq.question}
                    <svg
                      className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </summary>
                  <div className="px-5 pb-5 text-gray-400 text-sm leading-relaxed">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      {typedEvent.status === "registration_open" && (
        <section className="py-20 bg-[#0a1e38]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-white mb-4">
              Ready to Join?
            </h2>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto">
              Don&apos;t miss this opportunity to be part of what God is doing
              through the global harvest movement. Register today.
            </p>
            <Link
              href={`/register/${typedEvent.slug}`}
              className="inline-flex items-center gap-2 bg-[#29BDD6] hover:bg-[#1a9ab5] text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors shadow-lg shadow-[#29BDD6]/20"
            >
              Register Now
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
