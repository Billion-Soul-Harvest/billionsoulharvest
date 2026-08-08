import type { ReactNode } from "react";
import Link from "next/link";
import { HeroSlideshow } from "../components/hero-slideshow";
import { ScrollReveal } from "../components/scroll-reveal";

export default function StoriesPage() {
  const storyCategories = [
    { type: "video" as const, label: "Videos", number: "01" },
    { type: "testimony" as const, label: "Testimonies", number: "02" },
    { type: "news" as const, label: "News", number: "03" },
    { type: "photo" as const, label: "Photos", number: "04" },
  ];

  const resourceCategories = [
    { type: "download" as const, label: "Downloads", number: "01" },
    { type: "brochure" as const, label: "Brochures", number: "02" },
    { type: "guide" as const, label: "Guides", number: "03" },
    { type: "presentation" as const, label: "Presentations", number: "04" },
  ];

  const typeIcons: Record<string, ReactNode> = {
    video: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    testimony: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    news: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
    ),
    photo: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    brochure: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    presentation: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21l5-2.5L17 21M7 3l5 2.5L17 3m-5 2.5V21M3 7h18M3 17h18M3 7v10h18V7" />
      </svg>
    ),
    guide: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    download: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    ),
  };

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
              From the Field
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
            <span className="text-[#1ecdec]">Stories</span>
          </h1>

          <div className="hidden md:block border-t border-[#1ecdec] pt-7">
            <div className="grid grid-cols-1 md:grid-cols-[1.1fr_auto] gap-8 items-end">
              <p className="font-[family-name:var(--font-jakarta)] text-[15px] leading-[1.7] text-white/90 m-0 max-w-[52ch] text-pretty">
                Testimonies, updates, and reports from the global movement — see what God is doing through Billion Soul Harvest.
              </p>
              <div className="flex gap-3">
                <Link
                  href="/gatherings"
                  className="bg-[#1ecdec] text-[#0a0a0a] px-8 py-[18px] text-[14px] font-[800] tracking-[0.08em] uppercase font-[family-name:var(--font-jakarta)] hover:bg-white transition-colors"
                >
                  Gatherings
                </Link>
                <Link
                  href="/connect"
                  className="border-2 border-white/50 text-white px-8 py-[18px] text-[14px] font-[800] tracking-[0.08em] uppercase font-[family-name:var(--font-jakarta)] hover:bg-white hover:text-[#0a0a0a] transition-colors"
                >
                  Connect
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Latest Stories ── */}
      <section className="py-[110px] bg-[#f5f7fa] text-[#0a0a0a]">
        <div className="max-w-[1360px] mx-auto px-4 md:px-10 flex flex-col gap-11">
          <ScrollReveal>
            <div
              className="flex flex-wrap items-end justify-between gap-5 pb-[22px]"
              style={{ borderBottom: "2px solid #0a0a0a" }}
            >
              <h2
                className="font-[family-name:var(--font-jakarta)] uppercase m-0"
                style={{
                  fontWeight: 900,
                  fontSize: "clamp(36px, 4.8vw, 80px)",
                  lineHeight: 0.88,
                  letterSpacing: "-0.05em",
                }}
              >
                Latest Stories
              </h2>
              <p className="font-[family-name:var(--font-geist-mono)] text-[12.5px] font-medium tracking-[0.16em] uppercase text-[#506b9f] m-0">
                Videos, Testimonies, News &amp; Photos
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <div
              className="grid gap-7"
              style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
              }}
            >
              {storyCategories.map((cat) => {
                const icon = typeIcons[cat.type];
                return (
                  <div
                    key={cat.type}
                    className="flex flex-col bg-white border border-[#0a0a0a]/16 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(10,10,10,0.18)]"
                  >
                    {/* Card image area */}
                    <div
                      className="relative flex items-center justify-center overflow-hidden"
                      style={{
                        aspectRatio: "16/9",
                        backgroundColor: "#262d48",
                      }}
                    >
                      {/* Number badge */}
                      <span
                        className="absolute left-0 top-0 font-[family-name:var(--font-geist-mono)] uppercase"
                        style={{
                          padding: "7px 12px",
                          backgroundColor: "#0a0a0a",
                          color: "#1ecdec",
                          fontSize: "10px",
                          fontWeight: 500,
                          letterSpacing: "0.14em",
                        }}
                      >
                        {cat.number}
                      </span>
                      <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-white/40">
                        {icon}
                      </div>
                    </div>

                    {/* Card body */}
                    <div className="flex flex-col flex-1 gap-3.5 p-[28px_26px_24px]">
                      <h3
                        className="font-[family-name:var(--font-jakarta)] uppercase m-0"
                        style={{
                          fontWeight: 900,
                          fontSize: "clamp(22px, 2vw, 30px)",
                          lineHeight: 1,
                          letterSpacing: "-0.04em",
                        }}
                      >
                        {cat.label}
                      </h3>
                      <p
                        className="font-[family-name:var(--font-jakarta)] m-0"
                        style={{
                          fontSize: "16px",
                          lineHeight: 1.62,
                          color: "#505870",
                        }}
                      >
                        Coming soon
                      </p>

                      {/* Card footer */}
                      <div
                        className="flex items-center justify-between gap-[18px] mt-auto font-[family-name:var(--font-geist-mono)]"
                        style={{
                          paddingTop: "18px",
                          borderTop: "1px solid rgba(10,10,10,0.16)",
                          fontSize: "12px",
                          letterSpacing: "0.06em",
                          color: "#506b9f",
                        }}
                      >
                        <span>{cat.type.toUpperCase()}</span>
                        <span
                          className="uppercase"
                          style={{
                            fontWeight: 500,
                            letterSpacing: "0.12em",
                          }}
                        >
                          Browse →
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Resources ── */}
      <section className="py-[110px] bg-[#0a0a0a]">
        <div className="max-w-[1360px] mx-auto px-4 md:px-10 flex flex-col gap-11">
          <ScrollReveal>
            <div
              className="flex flex-wrap items-end justify-between gap-5 pb-[22px]"
              style={{ borderBottom: "2px solid rgba(255,255,255,0.3)" }}
            >
              <h2
                className="font-[family-name:var(--font-jakarta)] uppercase text-white m-0"
                style={{
                  fontWeight: 900,
                  fontSize: "clamp(36px, 4.8vw, 80px)",
                  lineHeight: 0.88,
                  letterSpacing: "-0.05em",
                }}
              >
                Resources
              </h2>
              <p className="font-[family-name:var(--font-geist-mono)] text-[12.5px] font-medium tracking-[0.16em] uppercase text-[#1ecdec] m-0 max-w-[34ch]">
                Downloads, Brochures, Guides &amp; Presentations
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <div
              className="grid"
              style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                borderTop: "1px solid rgba(255,255,255,0.16)",
                borderLeft: "1px solid rgba(255,255,255,0.16)",
              }}
            >
              {resourceCategories.map((cat) => {
                const icon = typeIcons[cat.type];
                return (
                  <div
                    key={cat.type}
                    className="flex flex-col bg-[#0a0a0a]"
                    style={{
                      borderRight: "1px solid rgba(255,255,255,0.16)",
                      borderBottom: "1px solid rgba(255,255,255,0.16)",
                      padding: "40px 30px 44px",
                      gap: "16px",
                    }}
                  >
                    <span
                      className="font-[family-name:var(--font-geist-mono)] uppercase"
                      style={{
                        fontSize: "11px",
                        fontWeight: 500,
                        letterSpacing: "0.14em",
                        color: "#1ecdec",
                      }}
                    >
                      {cat.number}
                    </span>
                    <h3
                      className="font-[family-name:var(--font-jakarta)] uppercase text-white m-0"
                      style={{
                        fontWeight: 900,
                        fontSize: "clamp(26px, 2.4vw, 36px)",
                        lineHeight: 0.92,
                        letterSpacing: "-0.045em",
                      }}
                    >
                      {cat.label}
                    </h3>
                    <span
                      className="self-start font-[family-name:var(--font-geist-mono)] uppercase"
                      style={{
                        marginTop: "6px",
                        padding: "6px 11px",
                        border: "1px solid rgba(255,255,255,0.28)",
                        fontSize: "10.5px",
                        fontWeight: 500,
                        letterSpacing: "0.14em",
                        color: "rgba(255,255,255,0.82)",
                      }}
                    >
                      Coming soon
                    </span>
                  </div>
                );
              })}
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
