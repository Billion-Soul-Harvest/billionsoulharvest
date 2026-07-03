"use client";

import { useState } from "react";

const pastGatherings: Record<string, string[]> = {
  "2026": ["Brazil", "Kazakhstan", "Nepal", "India", "Mexico", "Atlanta"],
  "2025": ["Jeju Global Summit", "United Kingdom", "Dubai", "Brazil", "Ethiopia"],
  "2024": ["Pyeongchang Global Summit", "Young Generation Summit", "Regional gatherings"],
};

export function PastGatherings() {
  const [openYear, setOpenYear] = useState<string | null>("2026");

  return (
    <div className="space-y-4">
      {Object.entries(pastGatherings).map(([year, events]) => (
        <div key={year} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <button
            onClick={() => setOpenYear(openYear === year ? null : year)}
            className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-white/5 transition-colors"
            aria-expanded={openYear === year}
          >
            <div className="flex items-center gap-3">
              <span className="text-[#29BDD6] font-bold text-2xl">{year}</span>
              <span className="text-gray-400 text-sm">{events.length} gatherings</span>
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
                {events.map((event) => (
                  <li key={event} className="flex items-center gap-3 text-gray-300 text-sm">
                    <div className="w-2 h-2 bg-[#29BDD6]/60 rounded-full shrink-0" />
                    {event}
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
