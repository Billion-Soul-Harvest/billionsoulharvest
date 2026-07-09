import Link from "next/link";
import { createClient } from "@/shared/utils/supabase/server";
import { PastGatherings } from "./past-gatherings";
import { ScrollReveal } from "../components/scroll-reveal";

export const dynamic = "force-dynamic";

export default async function GatheringsPage() {
  const supabase = await createClient();

  const { data: events } = await supabase
    .from("events")
    .select(
      "id, title, slug, start_date, end_date, city, country, banner_url, status, is_external, external_url"
    )
    .in("status", ["published", "registration_open", "registration_closed"])
    .order("start_date", { ascending: true });

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative bg-[#0d223f] text-white py-24 md:py-32 overflow-hidden">
        <img
          src="/initiatives-collab.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(13,34,63,0.95) 20%, rgba(13,34,63,0.7) 100%)",
          }}
        />
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 relative z-10">
          <span className="text-[#a9edff] text-xs font-semibold font-[family-name:var(--font-geist-sans)] uppercase tracking-widest">
            Global Gatherings
          </span>
          <h1 className="font-[family-name:var(--font-jakarta)] text-4xl md:text-[56px] md:leading-[64px] font-bold mt-4 mb-6 tracking-[-0.02em]">
            Bringing the Body of Christ Together for the Greatest Harvest in
            History
          </h1>
          <p className="font-[family-name:var(--font-jakarta)] text-lg md:text-xl leading-8 text-white/80 max-w-3xl">
            Every Billion Soul Harvest gathering is designed to inspire, equip,
            and unite Christian leaders for the fulfillment of the Great
            Commission. From global summits to national gatherings, each event
            strengthens Kingdom relationships, mobilizes leaders, and advances
            the vision of reaching one billion souls by 2033.
          </p>
        </div>
      </section>

      {/* ── Upcoming Gatherings ── */}
      <section className="py-20 md:py-[100px] bg-[#f9f9ff]">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <ScrollReveal>
            <div className="mb-12">
              <h2 className="font-[family-name:var(--font-jakarta)] text-3xl md:text-[40px] md:leading-[48px] font-bold text-[#0d223f] tracking-[-0.02em]">
                Upcoming Gatherings
              </h2>
            </div>
          </ScrollReveal>

          {events && events.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => {
                const start = event.start_date
                  ? new Date(event.start_date)
                  : null;
                const end = event.end_date
                  ? new Date(event.end_date)
                  : null;

                const dateStr = start
                  ? end &&
                    end.toISOString().slice(0, 10) !==
                      start.toISOString().slice(0, 10)
                    ? `${start.toLocaleDateString("en-US", { month: "long", day: "numeric" })}\u2013${end.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`
                    : start.toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                  : null;

                const location = [event.city, event.country]
                  .filter(Boolean)
                  .join(", ");

                const href = event.is_external
                  ? event.external_url
                  : event.slug
                    ? `/events/${event.slug}`
                    : null;

                return (
                  <div
                    key={event.id}
                    className="bg-white rounded-2xl border border-[#b4c7ec]/30 overflow-hidden hover:shadow-lg hover:border-[#00b8d4]/30 transition-all duration-300 flex flex-col"
                  >
                    {event.banner_url && (
                      <img
                        src={event.banner_url}
                        alt={event.title}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-6 flex flex-col flex-1">
                      {(event.status === "registration_open" ||
                        event.status === "registration_closed") && (
                        <span
                          className={`inline-block w-fit text-xs font-semibold font-[family-name:var(--font-geist-sans)] px-2.5 py-1 rounded-full mb-3 ${
                            event.status === "registration_open"
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {event.status === "registration_open"
                            ? "Registration Open"
                            : "Registration Closed"}
                        </span>
                      )}
                      <h3 className="font-[family-name:var(--font-jakarta)] text-lg font-bold text-[#0d223f] mb-2">
                        {event.title}
                      </h3>
                      {dateStr && (
                        <p className="font-[family-name:var(--font-jakarta)] text-sm font-semibold text-[#00b8d4] mb-1">
                          {dateStr}
                        </p>
                      )}
                      {location && (
                        <p className="font-[family-name:var(--font-jakarta)] text-sm text-[#44474d] mb-4">
                          {location}
                        </p>
                      )}
                      <div className="mt-auto">
                        {href ? (
                          <Link
                            href={href}
                            target={event.is_external ? "_blank" : undefined}
                            rel={
                              event.is_external
                                ? "noopener noreferrer"
                                : undefined
                            }
                            className="inline-flex items-center gap-1 text-[#00b8d4] text-sm font-semibold font-[family-name:var(--font-geist-sans)] hover:underline"
                          >
                            Learn More &rarr;
                          </Link>
                        ) : (
                          <span className="text-sm text-[#44474d]/60 italic font-[family-name:var(--font-geist-sans)]">
                            Details coming soon
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#b4c7ec]/30 p-12 text-center">
              <p className="font-[family-name:var(--font-jakarta)] text-lg text-[#44474d]">
                New gatherings will be announced soon. Stay tuned!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── Past Gatherings ── */}
      <section className="py-20 md:py-[100px] bg-white">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <ScrollReveal>
            <div className="mb-12">
              <h2 className="font-[family-name:var(--font-jakarta)] text-3xl md:text-[40px] md:leading-[48px] font-bold text-[#0d223f] tracking-[-0.02em]">
                Past Gatherings
              </h2>
            </div>
          </ScrollReveal>

          <PastGatherings />
        </div>
      </section>
    </div>
  );
}
