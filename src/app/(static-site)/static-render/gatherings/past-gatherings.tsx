"use client";

import { useState } from "react";

type GatheringEvent = { name: string; link?: string; photos?: string };

const pastGatherings: { year: string; events: GatheringEvent[] }[] = [
  {
    year: "2026",
    events: [
      { name: "Brazil" },
      { name: "Kazakhstan" },
      { name: "Nepal" },
      { name: "India" },
      { name: "Mexico" },
      { name: "Atlanta" },
    ],
  },
  {
    year: "2025",
    events: [
      {
        name: "BSH Global Summit 2025 Jeju",
        link: "https://sites.google.com/view/ghs-2025",
      },
      {
        name: "BSH UK/Europe 2025",
        link: "https://sites.google.com/view/bshuk?usp=sharing",
      },
      { name: "BSH Global Summit 2025 Colorado Springs" },
      { name: "Dubai" },
      { name: "Brazil" },
      { name: "Ethiopia" },
    ],
  },
  {
    year: "2024",
    events: [
      {
        name: "BSH Global Summit 2024 Pyeongchang",
        link: "https://sites.google.com/view/ghs-2024/home",
        photos: "https://photos.app.goo.gl/i7pgjAouzpA1wKUq8",
      },
      { name: "BSH Global Summit 2024 Colorado Springs" },
      { name: "Young Generation Summit" },
      { name: "Regional gatherings" },
    ],
  },
];

// Color accents per year for visual variety
const yearAccents: Record<string, { gradient: string; dot: string; badge: string }> = {
  "2026": {
    gradient: "from-[#00b8d4]/10 to-transparent",
    dot: "bg-[#00b8d4]",
    badge: "bg-[#00b8d4]/10 text-[#00b8d4]",
  },
  "2025": {
    gradient: "from-[#6366f1]/10 to-transparent",
    dot: "bg-[#6366f1]",
    badge: "bg-[#6366f1]/10 text-[#6366f1]",
  },
  "2024": {
    gradient: "from-[#f59e0b]/10 to-transparent",
    dot: "bg-[#f59e0b]",
    badge: "bg-[#f59e0b]/10 text-[#f59e0b]",
  },
};

const defaultAccent = {
  gradient: "from-[#b4c7ec]/10 to-transparent",
  dot: "bg-[#b4c7ec]",
  badge: "bg-[#b4c7ec]/10 text-[#44474d]",
};

export function PastGatherings() {
  const [openYear, setOpenYear] = useState<string | null>(
    pastGatherings[0]?.year ?? null
  );

  return (
    <div className="relative">
      {/* Vertical timeline line */}
      <div className="absolute left-[23px] top-0 bottom-0 w-px bg-gradient-to-b from-[#00b8d4] via-[#b4c7ec]/40 to-[#b4c7ec]/20 hidden md:block" />

      <div className="space-y-6">
        {pastGatherings.map((group, idx) => {
          const isOpen = openYear === group.year;
          const accent = yearAccents[group.year] ?? defaultAccent;

          return (
            <div key={group.year} className="relative md:pl-16">
              {/* Timeline dot */}
              <div className="hidden md:flex absolute left-0 top-6 items-center justify-center">
                <div
                  className={`w-[14px] h-[14px] rounded-full border-[3px] border-white shadow-md ${accent.dot} ring-4 ring-white`}
                />
              </div>

              {/* Card */}
              <div
                className={`rounded-2xl border overflow-hidden transition-all duration-300 ${
                  isOpen
                    ? "border-[#00b8d4]/30 shadow-lg"
                    : "border-[#b4c7ec]/30 hover:border-[#00b8d4]/20 hover:shadow-md"
                }`}
              >
                {/* Header */}
                <button
                  onClick={() => setOpenYear(isOpen ? null : group.year)}
                  className={`w-full flex items-center justify-between px-6 py-5 transition-all duration-300 bg-gradient-to-r ${accent.gradient} ${
                    isOpen ? "bg-[#f0f3ff]" : "bg-white hover:bg-[#f9f9ff]"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`font-[family-name:var(--font-jakarta)] text-3xl md:text-4xl font-bold tracking-tight ${
                        isOpen ? "text-[#0d223f]" : "text-[#0d223f]/70"
                      }`}
                    >
                      {group.year}
                    </span>
                    <span
                      className={`text-xs font-semibold font-[family-name:var(--font-geist-sans)] px-3 py-1 rounded-full ${accent.badge}`}
                    >
                      {group.events.length} gathering
                      {group.events.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isOpen
                        ? "bg-[#0d223f] text-white rotate-180"
                        : "bg-[#f0f3ff] text-[#44474d]"
                    }`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </button>

                {/* Expanded content */}
                {isOpen && (
                  <div className="px-6 py-6 bg-white border-t border-[#b4c7ec]/20">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {group.events.map((event) => (
                          <div
                            key={event.name}
                            className="group relative flex items-center gap-4 px-5 py-4 rounded-xl bg-gradient-to-br from-[#f9f9ff] to-white border border-[#b4c7ec]/20 hover:border-[#00b8d4]/30 hover:shadow-md transition-all duration-300"
                          >
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${accent.badge}`}
                            >
                              <svg
                                className="w-5 h-5"
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
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="font-[family-name:var(--font-jakarta)] text-sm text-[#0d223f] font-semibold">
                                {event.name}
                              </span>
                              {(event.link || event.photos) && (
                                <div className="flex items-center gap-3 mt-1">
                                  {event.link && (
                                    <a
                                      href={event.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-[#00b8d4] font-[family-name:var(--font-geist-sans)] font-medium hover:underline"
                                    >
                                      View Details &rarr;
                                    </a>
                                  )}
                                  {event.photos && (
                                    <a
                                      href={event.photos}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-[#6366f1] font-[family-name:var(--font-geist-sans)] font-medium hover:underline"
                                    >
                                      Photos
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
