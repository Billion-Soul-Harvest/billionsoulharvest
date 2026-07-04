"use client";

import { useState } from "react";
import Link from "next/link";

interface PastEvent {
  id: string;
  title: string;
  slug: string;
  start_date: string | null;
  city: string | null;
  country: string | null;
}

interface Props {
  events: PastEvent[];
}

export function PastGatherings({ events }: Props) {
  // Group events by year from start_date
  const grouped: Record<string, PastEvent[]> = {};
  for (const event of events) {
    const year = event.start_date
      ? new Date(event.start_date + "T00:00:00").getFullYear().toString()
      : "Unknown";
    if (!grouped[year]) grouped[year] = [];
    grouped[year].push(event);
  }

  const years = Object.keys(grouped).sort((a, b) => Number(b) - Number(a));
  const [openYear, setOpenYear] = useState<string | null>(years[0] ?? null);

  if (years.length === 0) {
    return <p className="text-center text-gray-400">No past gatherings yet.</p>;
  }

  return (
    <div className="space-y-4">
      {years.map((year) => (
        <div key={year} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <button
            onClick={() => setOpenYear(openYear === year ? null : year)}
            className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-white/5 transition-colors"
            aria-expanded={openYear === year}
          >
            <div className="flex items-center gap-3">
              <span className="text-[#29BDD6] font-bold text-2xl">{year}</span>
              <span className="text-gray-400 text-sm">{grouped[year].length} gatherings</span>
            </div>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${openYear === year ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openYear === year && (
            <div className="px-6 pb-5 border-t border-white/5 pt-4">
              <ul className="space-y-3">
                {grouped[year].map((event) => (
                  <li key={event.id}>
                    <Link
                      href={`/events/${event.slug}`}
                      className="flex items-center gap-3 text-gray-300 text-sm hover:text-[#29BDD6] transition-colors"
                    >
                      <div className="w-2 h-2 bg-[#29BDD6]/60 rounded-full shrink-0" />
                      <span>{event.title}</span>
                      {(event.city || event.country) && (
                        <span className="text-gray-500 text-xs ml-auto">
                          {[event.city, event.country].filter(Boolean).join(", ")}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
