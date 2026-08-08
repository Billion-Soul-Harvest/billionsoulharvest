import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/shared/utils/supabase/server";
import { ScrollReveal } from "../components/scroll-reveal";
import { HeroSlideshow } from "../components/hero-slideshow";

export const revalidate = 3600; // re-generate every hour

export default async function GatheringsPage() {
  const supabase = await createClient();

  const { data: events } = await supabase
    .from("events")
    .select(
      "id, title, slug, start_date, end_date, city, country, banner_url, status, is_external, external_url, display_order"
    )
    .in("status", ["published", "registration_open", "registration_closed"])
    .order("display_order", { ascending: true, nullsFirst: false })
    .order("start_date", { ascending: true });

  return (
    <div>
      {/* ── Hero ── */}
      <header className="relative min-h-screen md:min-h-[85vh] flex flex-col justify-end overflow-hidden bg-[#0a0a0a]">
        <HeroSlideshow />
        <div
          className="absolute inset-0 z-[1]"
          style={{
            background:
              "linear-gradient(to top, #0a0a0a 2%, rgba(10,10,10,0.7) 35%, rgba(10,10,10,0.15) 70%, transparent 100%)",
          }}
        />

        <div className="relative z-10 max-w-[1360px] mx-auto px-4 md:px-10 w-full pt-[180px] pb-14 flex flex-col gap-7">
          <div className="flex items-center">
            <span className="inline-block bg-[#0a1928]/80 border border-[#1ecdec]/50 rounded-full px-6 py-2.5 font-[family-name:var(--font-geist-mono)] text-[12px] font-medium tracking-[0.2em] uppercase text-[#1ecdec]">
              Global Gatherings
            </span>
          </div>

          <h1
            className="font-[family-name:var(--font-jakarta)] font-[900] text-white uppercase m-0 max-w-[14ch]"
            style={{
              fontSize: "clamp(44px, 7vw, 120px)",
              lineHeight: 0.88,
              letterSpacing: "-0.05em",
              textShadow: "0 4px 40px rgba(10,10,10,0.55)",
            }}
          >
            Global{" "}
            <span className="text-[#1ecdec]">Gatherings</span>
          </h1>

          <div className="hidden md:block border-t border-[#1ecdec] pt-7">
            <p className="font-[family-name:var(--font-jakarta)] text-[15px] leading-[1.7] text-white/90 m-0 max-w-[52ch] text-pretty">
              Bringing the Body of Christ together for the greatest harvest in history. Join leaders from every nation united for the Great Commission.
            </p>
          </div>
        </div>
      </header>

      {/* ── Upcoming Gatherings ── */}
      <section className="py-[110px] bg-[#f5f7fa] text-[#0a0a0a]">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <ScrollReveal>
            <div className="mb-12">
              <span className="font-[family-name:var(--font-geist-mono)] uppercase text-[#506b9f] block mb-4" style={{ fontSize: "12.5px", fontWeight: 500, letterSpacing: "0.16em" }}>
                Events
              </span>
              <h2 className="font-[family-name:var(--font-jakarta)] font-[900] text-[#0a0a0a] uppercase" style={{ fontSize: "clamp(36px, 4.8vw, 80px)", lineHeight: 0.88, letterSpacing: "-0.045em" }}>
                Upcoming Gatherings
              </h2>
              <div className="mt-8 border-b-2 border-[#0a0a0a]" />
            </div>
          </ScrollReveal>

          {events && events.length > 0 ? (
            <div className="grid gap-[28px]" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))" }}>
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
                    className="bg-white border border-[rgba(10,10,10,0.16)] overflow-hidden transition-all duration-300 flex flex-col cursor-pointer hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(10,10,10,0.18)]"
                  >
                    <div className="relative w-full bg-[#262d48]" style={{ aspectRatio: "16/9" }}>
                      {event.banner_url ? (
                        <Image
                          src={event.banner_url}
                          alt={event.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          loading="lazy"
                        />
                      ) : null}
                      {(event.status === "registration_open" ||
                        event.status === "registration_closed") && (
                        <span
                          className={`absolute top-0 left-0 font-[family-name:var(--font-geist-mono)] uppercase ${
                            event.status === "registration_open"
                              ? "bg-[#1ecdec] text-[#0a0a0a]"
                              : "bg-[#0a0a0a]/70 text-white"
                          }`}
                          style={{ padding: "7px 12px", fontSize: "10px", fontWeight: 500, letterSpacing: "0.14em" }}
                        >
                          {event.status === "registration_open"
                            ? "Registration Open"
                            : "Registration Closed"}
                        </span>
                      )}
                      {dateStr && (
                        <span className="absolute bottom-[18px] left-[18px] font-[family-name:var(--font-geist-mono)] text-white" style={{ fontSize: "13px", fontWeight: 500, letterSpacing: "0.06em" }}>
                          {dateStr}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col flex-1" style={{ padding: "26px 24px", gap: "14px" }}>
                      <h3 className="font-[family-name:var(--font-jakarta)] font-[900] text-[#0a0a0a] uppercase" style={{ fontSize: "clamp(22px, 2vw, 30px)", lineHeight: 0.98, letterSpacing: "-0.04em" }}>
                        {event.title}
                      </h3>
                      <div className="mt-auto flex justify-between items-center font-[family-name:var(--font-geist-mono)] text-[#506b9f]" style={{ paddingTop: "14px", borderTop: "1px solid rgba(10,10,10,0.16)", fontSize: "12.5px", letterSpacing: "0.04em" }}>
                        {location && (
                          <span>
                            {location}
                          </span>
                        )}
                        {href ? (
                          <span className="font-[family-name:var(--font-jakarta)] font-[800] uppercase" style={{ fontSize: "14px", letterSpacing: "0.08em" }}>
                            Learn More &rarr;
                          </span>
                        ) : (
                          <span className="italic">
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
            <div className="bg-white border border-[rgba(10,10,10,0.16)] p-12 text-center">
              <p className="font-[family-name:var(--font-jakarta)] text-lg text-[#0a0a0a]/60">
                New gatherings will be announced soon. Stay tuned!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── Past Global Gatherings ── */}
      <section className="py-[110px] bg-[#0a0a0a]">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <ScrollReveal>
            <div className="mb-12">
              <span className="font-[family-name:var(--font-geist-mono)] uppercase text-[#1ecdec] block mb-4" style={{ fontSize: "12.5px", fontWeight: 500, letterSpacing: "0.16em" }}>
                Archive
              </span>
              <h2 className="font-[family-name:var(--font-jakarta)] font-[900] text-white uppercase" style={{ fontSize: "clamp(36px, 4.8vw, 80px)", lineHeight: 0.88, letterSpacing: "-0.045em" }}>
                Past Global Gatherings
              </h2>
              <div className="mt-8 border-b-2 border-white/30" />
            </div>
          </ScrollReveal>

          <div className="grid gap-[28px]" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
            {[
              {
                title: "BSH Global Summit 2025",
                location: "Jeju, South Korea",
                href: "https://sites.google.com/view/ghs-2025",
                videoId: "QxxpfJUkius" as string | null,
              },
              {
                title: "BSH Global Summit 2024",
                location: "Pyeongchang, South Korea",
                href: "https://sites.google.com/view/ghs-2024/home",
                videoId: "b5fsZIbo1Co",
              },
              {
                title: "BSH Global Summit 2023",
                location: "Colorado Springs, USA",
                href: "https://youtu.be/G63W5y8p51I",
                videoId: "G63W5y8p51I",
              },
              {
                title: "BSH Global Summit 2022",
                location: "Colorado Springs, USA",
                href: "https://youtu.be/ZE4Tto5DaDQ",
                videoId: "ZE4Tto5DaDQ",
              },
            ].map((g, i) => (
              <div
                key={i}
                className="overflow-hidden flex flex-col"
              >
                {g.videoId && (
                  <a href={`https://youtu.be/${g.videoId}`} target="_blank" rel="noopener noreferrer" className="relative w-full block bg-[#262d48]" style={{ aspectRatio: "16/9" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://img.youtube.com/vi/${g.videoId}/hqdefault.jpg`}
                      alt={g.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-[rgba(10,10,10,0.25)]" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="rounded-full bg-[#1ecdec] text-[#0a0a0a] flex items-center justify-center" style={{ width: "62px", height: "62px", fontSize: "20px" }}>
                        <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                    <span className="absolute bottom-0 left-0 font-[family-name:var(--font-geist-mono)] bg-[#1ecdec] text-[#0a0a0a] uppercase" style={{ padding: "8px 12px", fontSize: "11px", fontWeight: 500, letterSpacing: "0.14em" }}>
                      {g.title.match(/\d{4}/)?.[0] || ""}
                    </span>
                  </a>
                )}
                {!g.videoId && (
                  <div className="relative w-full bg-[#262d48] flex items-center justify-center" style={{ aspectRatio: "16/9" }}>
                    <svg className="w-12 h-12 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A8.966 8.966 0 013 12c0-1.264.26-2.466.727-3.559" />
                    </svg>
                  </div>
                )}
                <div className="pt-5 flex flex-col flex-1">
                  <h3 className="font-[family-name:var(--font-jakarta)] font-[900] text-white uppercase" style={{ fontSize: "clamp(21px, 2vw, 28px)", lineHeight: 0.98, letterSpacing: "-0.035em" }}>
                    {g.title}
                  </h3>
                  <p className="font-[family-name:var(--font-geist-mono)] text-white/82 mt-2" style={{ fontSize: "12px", letterSpacing: "0.06em" }}>
                    {g.location}
                  </p>
                  <div className="mt-auto flex items-center gap-4 pt-4">
                    {g.videoId && (
                      <a
                        href={`https://youtu.be/${g.videoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#1ecdec] font-[family-name:var(--font-geist-mono)] font-[500] uppercase" style={{ fontSize: "11.5px", letterSpacing: "0.12em" }}
                      >
                        Watch Video &rarr;
                      </a>
                    )}
                    {g.href && (!g.videoId || g.href !== `https://youtu.be/${g.videoId}`) && (
                      <a
                        href={g.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#1ecdec] font-[family-name:var(--font-geist-mono)] font-[500] uppercase" style={{ fontSize: "11.5px", letterSpacing: "0.12em" }}
                      >
                        Learn More &rarr;
                      </a>
                    )}
                    {!g.videoId && !g.href && (
                      <span className="font-[family-name:var(--font-geist-mono)] text-white/50 italic" style={{ fontSize: "11.5px", letterSpacing: "0.12em" }}>
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
      <section className="py-[110px] bg-[#f5f7fa] text-[#0a0a0a]">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <ScrollReveal>
            <div className="mb-12">
              <span className="font-[family-name:var(--font-geist-mono)] uppercase text-[#506b9f] block mb-4" style={{ fontSize: "12.5px", fontWeight: 500, letterSpacing: "0.16em" }}>
                Regional Events
              </span>
              <h2 className="font-[family-name:var(--font-jakarta)] font-[900] text-[#0a0a0a] uppercase" style={{ fontSize: "clamp(36px, 4.8vw, 80px)", lineHeight: 0.88, letterSpacing: "-0.045em" }}>
                Past National Gatherings
              </h2>
              <div className="mt-8 border-b-2 border-[#0a0a0a]" />
            </div>
          </ScrollReveal>

          <div className="grid gap-[24px]" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
            {/* BSH UK/Europe 2025 — link card */}
            <a
              href="https://sites.google.com/view/bshuk?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="overflow-hidden flex flex-col cursor-pointer"
            >
              <div className="relative w-full bg-[#0a0a0a] flex items-center justify-center" style={{ aspectRatio: "16/9" }}>
                <div className="absolute inset-0 bg-[rgba(10,10,10,0.22)]" />
                <div className="rounded-full bg-[rgba(10,10,10,0.78)] text-white flex items-center justify-center relative z-10" style={{ width: "52px", height: "52px", fontSize: "16px" }}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A8.966 8.966 0 013 12c0-1.264.26-2.466.727-3.559" />
                  </svg>
                </div>
              </div>
              <div className="pt-4">
                <h3 className="font-[family-name:var(--font-jakarta)] font-[900] text-[#0a0a0a] uppercase" style={{ fontSize: "19px", lineHeight: 1.02, letterSpacing: "-0.03em" }}>
                  BSH UK/Europe 2025
                </h3>
                <p className="font-[family-name:var(--font-geist-mono)] text-[#506b9f] mt-1" style={{ fontSize: "12px", letterSpacing: "0.06em" }}>
                  United Kingdom
                </p>
                <div className="mt-3">
                  <span className="inline-flex items-center gap-1 text-[#506b9f] font-[family-name:var(--font-geist-mono)] font-[500] uppercase" style={{ fontSize: "11px", letterSpacing: "0.12em" }}>
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
                className="overflow-hidden flex flex-col cursor-pointer"
              >
                <div className="relative w-full bg-[#0a0a0a]" style={{ aspectRatio: "16/9" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://img.youtube.com/vi/${g.videoId}/hqdefault.jpg`}
                    alt={g.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-[rgba(10,10,10,0.22)]" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="rounded-full bg-[rgba(10,10,10,0.78)] text-white flex items-center justify-center" style={{ width: "52px", height: "52px", fontSize: "16px" }}>
                      <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="pt-4">
                  <h3 className="font-[family-name:var(--font-jakarta)] font-[900] text-[#0a0a0a] uppercase" style={{ fontSize: "19px", lineHeight: 1.02, letterSpacing: "-0.03em" }}>
                    {g.title}
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[#506b9f] font-[family-name:var(--font-geist-mono)] font-[500] uppercase mt-2" style={{ fontSize: "11px", letterSpacing: "0.12em" }}>
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
