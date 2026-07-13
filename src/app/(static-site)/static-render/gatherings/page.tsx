import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/shared/utils/supabase/server";
import { ScrollReveal } from "../components/scroll-reveal";

export const revalidate = 3600; // re-generate every hour

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
        <Image
          src="/initiatives-collab.webp"
          alt=""
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(13,34,63,0.8) 20%, rgba(13,34,63,0.45) 100%)",
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

                const Wrapper = href ? Link : "div";
                const wrapperProps = href
                  ? {
                      href,
                      target: event.is_external ? "_blank" : undefined,
                      rel: event.is_external
                        ? "noopener noreferrer"
                        : undefined,
                    }
                  : {};

                return (
                  <Wrapper
                    key={event.id}
                    {...(wrapperProps as any)}
                    className="bg-white rounded-2xl border border-[#b4c7ec]/30 overflow-hidden hover:shadow-lg hover:border-[#00b8d4]/30 transition-all duration-300 flex flex-col cursor-pointer"
                  >
                    {event.banner_url && (
                      <div className="relative w-full h-48">
                        <Image
                          src={event.banner_url}
                          alt={event.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          loading="lazy"
                        />
                      </div>
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
                          <span className="inline-flex items-center gap-1 text-[#00b8d4] text-sm font-semibold font-[family-name:var(--font-geist-sans)]">
                            Learn More &rarr;
                          </span>
                        ) : (
                          <span className="text-sm text-[#44474d]/60 italic font-[family-name:var(--font-geist-sans)]">
                            Details coming soon
                          </span>
                        )}
                      </div>
                    </div>
                  </Wrapper>
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

      {/* ── Past Global Gatherings ── */}
      <section className="py-20 md:py-[100px] bg-white">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <ScrollReveal>
            <div className="mb-12">
              <h2 className="font-[family-name:var(--font-jakarta)] text-3xl md:text-[40px] md:leading-[48px] font-bold text-[#0d223f] tracking-[-0.02em]">
                Past Global Gatherings
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "BSH Global Summit 2025",
                location: "Jeju, South Korea",
                href: "https://sites.google.com/view/ghs-2025",
              },
              {
                title: "BSH Global Summit 2024",
                location: "Pyeongchang, South Korea",
                href: "https://sites.google.com/view/ghs-2024/home",
              },
              {
                title: "BSH Global Summit 2023",
                location: "Colorado Springs, USA",
                href: null,
              },
              {
                title: "BSH Global Summit 2022",
                location: "Colorado Springs, USA",
                href: null,
              },
            ].map((g, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-[#b4c7ec]/30 overflow-hidden hover:shadow-lg hover:border-[#00b8d4]/30 transition-all duration-300 flex flex-col"
              >
                <div className="p-6 flex flex-col flex-1">
                  <div className="w-10 h-10 rounded-full bg-[#e7f8ff] flex items-center justify-center mb-4">
                    <svg className="w-5 h-5 text-[#00b8d4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A8.966 8.966 0 013 12c0-1.264.26-2.466.727-3.559" />
                    </svg>
                  </div>
                  <h3 className="font-[family-name:var(--font-jakarta)] text-lg font-bold text-[#0d223f] mb-2">
                    {g.title}
                  </h3>
                  <p className="font-[family-name:var(--font-jakarta)] text-sm text-[#44474d] mb-4">
                    {g.location}
                  </p>
                  <div className="mt-auto">
                    {g.href ? (
                      <a
                        href={g.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#00b8d4] text-sm font-semibold font-[family-name:var(--font-geist-sans)]"
                      >
                        Learn More &rarr;
                      </a>
                    ) : (
                      <span className="text-sm text-[#44474d]/60 italic font-[family-name:var(--font-geist-sans)]">
                        Details coming soon
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Past National Gatherings ── */}
      <section className="py-20 md:py-[100px] bg-[#f9f9ff]">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <ScrollReveal>
            <div className="mb-12">
              <h2 className="font-[family-name:var(--font-jakarta)] text-3xl md:text-[40px] md:leading-[48px] font-bold text-[#0d223f] tracking-[-0.02em]">
                Past National Gatherings
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* BSH UK/Europe 2025 — link card */}
            <a
              href="https://sites.google.com/view/bshuk?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-2xl border border-[#b4c7ec]/30 overflow-hidden hover:shadow-lg hover:border-[#00b8d4]/30 transition-all duration-300 flex flex-col cursor-pointer"
            >
              <div className="p-6 flex flex-col flex-1">
                <div className="w-10 h-10 rounded-full bg-[#e7f8ff] flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-[#00b8d4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A8.966 8.966 0 013 12c0-1.264.26-2.466.727-3.559" />
                  </svg>
                </div>
                <h3 className="font-[family-name:var(--font-jakarta)] text-lg font-bold text-[#0d223f] mb-2">
                  BSH UK/Europe 2025
                </h3>
                <p className="font-[family-name:var(--font-jakarta)] text-sm text-[#44474d] mb-4">
                  United Kingdom
                </p>
                <div className="mt-auto">
                  <span className="inline-flex items-center gap-1 text-[#00b8d4] text-sm font-semibold font-[family-name:var(--font-geist-sans)]">
                    Learn More &rarr;
                  </span>
                </div>
              </div>
            </a>

            {/* Video cards */}
            {[
              { title: "BSH Taiwan", videoId: "RDEl9j5MdIU" },
              { title: "BSH Uganda & Ethiopia", videoId: "xYGMfgrbNGY" },
              { title: "Billion Soul Harvest Next Gen Korea", videoId: "ddZ1bvXAOdg" },
              { title: "BSH India", videoId: "wM4hzDzHlsw" },
              { title: "BSH Indonesia", videoId: "hywPfXySUWU" },
              { title: "BSH WPA Indonesia", videoId: "_9eiWELCE5g" },
              { title: "BSH Transform World South Asia", videoId: "1B4EAWSJ9o0" },
              { title: "Billion Soul Harvest Pakistan", videoId: "3UbMmQHQhuY" },
            ].map((g) => (
              <a
                key={g.videoId}
                href={`https://www.youtube.com/watch?v=${g.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-2xl border border-[#b4c7ec]/30 overflow-hidden hover:shadow-lg hover:border-[#00b8d4]/30 transition-all duration-300 flex flex-col cursor-pointer"
              >
                <div className="relative w-full h-48">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://img.youtube.com/vi/${g.videoId}/hqdefault.jpg`}
                    alt={g.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-black/60 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-[family-name:var(--font-jakarta)] text-lg font-bold text-[#0d223f] mb-2">
                    {g.title}
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[#00b8d4] text-sm font-semibold font-[family-name:var(--font-geist-sans)]">
                    Watch Video &rarr;
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
