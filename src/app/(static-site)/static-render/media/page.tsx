import type { ReactNode } from "react";
import Link from "next/link";
import { HeroSlideshow } from "../components/hero-slideshow";
import { ScrollReveal } from "../components/scroll-reveal";

export default function MediaPage() {
  const storyCategories = [
    { type: "video" as const, label: "Videos" },
    { type: "testimony" as const, label: "Testimonies" },
    { type: "news" as const, label: "News" },
    { type: "photo" as const, label: "Photos" },
  ];

  const resourceCategories = [
    { type: "download" as const, label: "Downloads" },
    { type: "brochure" as const, label: "Brochures" },
    { type: "guide" as const, label: "Guides" },
    { type: "presentation" as const, label: "Presentations" },
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
      {/* Hero */}
      <header className="relative min-h-[85vh] flex flex-col justify-end overflow-hidden bg-[#0a0a0a]">
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
              Media
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
            Stories of a Global{" "}
            <span className="text-[#1ecdec]">Movement</span>
          </h1>

          <div className="hidden md:block border-t border-[#1ecdec] pt-7">
            <div className="grid grid-cols-1 md:grid-cols-[1.1fr_auto] gap-8 items-end">
              <p className="font-[family-name:var(--font-jakarta)] text-[15px] leading-[1.7] text-white/90 m-0 max-w-[52ch] text-pretty">
                Videos, testimonies, news, and photos from the Billion Soul Harvest movement around the world.
              </p>
              <div className="flex gap-3">
                <Link
                  href="/stories"
                  className="bg-[#1ecdec] text-[#0a0a0a] px-8 py-[18px] text-[14px] font-[800] tracking-[0.08em] uppercase font-[family-name:var(--font-jakarta)] hover:bg-white transition-colors"
                >
                  Stories
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

      {/* Stories */}
      <section className="py-20 md:py-[100px] bg-[#f9f9ff]">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <ScrollReveal>
            <div className="mb-12">
              <span className="text-[#00b8d4] text-xs font-semibold font-[family-name:var(--font-geist-sans)] uppercase tracking-widest">
                Videos, Testimonies, News &amp; Photos
              </span>
              <h2 className="font-[family-name:var(--font-jakarta)] text-3xl md:text-[40px] md:leading-[48px] font-bold text-[#0d223f] mt-4 tracking-[-0.02em]">
                Stories
              </h2>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {storyCategories.map((cat) => {
              const icon = typeIcons[cat.type];
              return (
                <div
                  key={cat.type}
                  className="bg-white rounded-2xl border border-[#b4c7ec]/30 overflow-hidden hover:shadow-lg hover:border-[#00b8d4]/30 transition-all duration-300 flex flex-col"
                >
                  <div className="aspect-video bg-gradient-to-br from-[#0d223f] to-[#1a3a5c] flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-white/40">
                      {icon}
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-[family-name:var(--font-jakarta)] text-lg font-bold text-[#0d223f] mb-3">
                      {cat.label}
                    </h3>
                    <div className="mt-auto">
                      <span className="text-sm text-[#44474d]/60 italic font-[family-name:var(--font-geist-sans)]">
                        Coming soon
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

      {/* Resources */}
      <section className="py-20 md:py-[100px] bg-white">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <ScrollReveal>
            <div className="mb-12">
              <span className="text-[#00b8d4] text-xs font-semibold font-[family-name:var(--font-geist-sans)] uppercase tracking-widest">
                Downloads, Brochures, Guides &amp; Presentations
              </span>
              <h2 className="font-[family-name:var(--font-jakarta)] text-3xl md:text-[40px] md:leading-[48px] font-bold text-[#0d223f] mt-4 tracking-[-0.02em]">
                Resources
              </h2>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {resourceCategories.map((cat) => {
              const icon = typeIcons[cat.type];
              return (
                <div
                  key={cat.type}
                  className="group bg-[#f9f9ff] rounded-2xl border border-[#b4c7ec]/20 p-6 hover:border-[#00b8d4]/30 hover:shadow-md transition-all duration-300 flex flex-col items-center text-center"
                >
                  <div className="w-14 h-14 rounded-xl bg-[#0d223f] flex items-center justify-center text-[#a9edff] mb-4">
                    {icon}
                  </div>
                  <h3 className="font-[family-name:var(--font-jakarta)] text-lg font-bold text-[#0d223f] mb-2">
                    {cat.label}
                  </h3>
                  <span className="text-sm text-[#44474d]/60 italic font-[family-name:var(--font-geist-sans)]">
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
