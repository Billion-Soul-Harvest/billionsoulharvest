import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PastGatherings } from "./past-gatherings";

export const metadata: Metadata = {
  title: "Global Gatherings — Billion Soul Harvest",
  description: "Upcoming and past Billion Soul Harvest gatherings around the world.",
};

const upcomingGatherings = [
  {
    title: "Brazil Global Summit 2026",
    date: "November 5-7, 2026",
    location: "Sao Jose dos Campos, Brazil",
    flag: "🇧🇷",
    image: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=640&q=80",
  },
  {
    title: "Nepal Leadership Gathering",
    date: "September 2026",
    location: "Nepal",
    flag: "🇳🇵",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=640&q=80",
  },
  {
    title: "Kazakhstan Leadership Summit",
    date: "August 2026",
    location: "Kazakhstan",
    flag: "🇰🇿",
    image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=640&q=80",
  },
];

export default function GatheringsPage() {
  return (
    <div>
      {/* Hero with background image */}
      <section className="relative py-28 sm:py-36 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=1920&q=80"
          alt=""
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f2744]/85 via-[#0f2744]/75 to-[#0f2744]/90" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <p className="text-[#29BDD6] text-xs font-semibold tracking-widest uppercase mb-4">Events</p>
          <h1 className="font-[family-name:var(--font-heading)] text-4xl sm:text-6xl font-bold text-white mb-6">
            Global Gatherings
          </h1>
          <p className="text-lg text-gray-200/80 max-w-2xl mx-auto leading-relaxed">
            Bringing the Body of Christ together for the greatest harvest in history.
            Every gathering is designed to inspire, equip, and unite Christian leaders
            for the fulfillment of the Great Commission.
          </p>
        </div>
      </section>

      {/* Upcoming Gatherings */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[#D4A843] text-xs font-semibold tracking-widest uppercase mb-3">Coming Soon</p>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl font-bold text-white">
              Upcoming Gatherings
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {upcomingGatherings.map((event) => (
              <div
                key={event.title}
                className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-[#29BDD6]/30 transition-all"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f2744]/80 to-transparent" />
                  <span className="absolute top-4 left-4 text-3xl">{event.flag}</span>
                </div>
                <div className="p-6">
                  <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold text-white mb-2">
                    {event.title}
                  </h3>
                  <p className="text-[#29BDD6] text-sm font-medium mb-1">{event.date}</p>
                  <p className="text-gray-400 text-sm mb-4">{event.location}</p>
                  <Link
                    href="/events"
                    className="inline-flex items-center gap-1 text-[#29BDD6] hover:text-[#3dcde6] text-sm font-semibold transition-colors"
                  >
                    Learn More
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Past Gatherings */}
      <section className="bg-[#0a1e38] py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[#D4A843] text-xs font-semibold tracking-widest uppercase mb-3">History</p>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl font-bold text-white">
              Past Gatherings
            </h2>
          </div>
          <PastGatherings />
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-white mb-4">
            Looking for Event Registration?
          </h3>
          <p className="text-gray-400 mb-8">
            Visit our events page for current registration details and upcoming event information.
          </p>
          <Link
            href="/events"
            className="inline-flex items-center justify-center gap-2 bg-[#29BDD6] hover:bg-[#1a9ab5] text-white font-semibold px-8 py-4 rounded-xl transition-colors shadow-lg shadow-[#29BDD6]/20"
          >
            View All Events
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
