import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/shared/utils/supabase/server";
import { PastGatherings } from "./past-gatherings";

export const metadata: Metadata = {
  title: "Global Gatherings — Billion Soul Harvest",
  description: "Upcoming and past Billion Soul Harvest gatherings around the world.",
};

export default async function GatheringsPage() {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  // Upcoming: published or registration_open with future start_date
  const { data: upcoming } = await supabase
    .from("events")
    .select("id, title, slug, description, start_date, end_date, city, country, banner_url, status")
    .in("status", ["published", "registration_open"])
    .gte("start_date", today)
    .order("start_date");

  // Past: completed or end_date in the past
  const { data: past } = await supabase
    .from("events")
    .select("id, title, slug, start_date, end_date, city, country, banner_url, status")
    .or(`status.eq.completed,end_date.lt.${today}`)
    .not("status", "in", '("draft","cancelled")')
    .order("start_date", { ascending: false });

  const upcomingEvents = upcoming ?? [];
  const pastEvents = past ?? [];

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
      <section className="bg-white py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[#D4A843] text-xs font-semibold tracking-widest uppercase mb-3">Coming Soon</p>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl font-bold text-[#0f2744]">
              Upcoming Gatherings
            </h2>
          </div>

          {upcomingEvents.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8">
              {upcomingEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.slug}`}
                  className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-[#29BDD6]/30 hover:shadow-lg transition-all"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    {event.banner_url ? (
                      <Image
                        src={event.banner_url}
                        alt={event.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#1e3a5f] to-[#0f2744] flex items-center justify-center">
                        <span className="text-[#29BDD6]/30 text-3xl font-bold">BSH</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                  <div className="p-6">
                    <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[#0f2744] mb-2">
                      {event.title}
                    </h3>
                    {event.start_date && (
                      <p className="text-[#29BDD6] text-sm font-medium mb-1">
                        {new Date(event.start_date + "T00:00:00").toLocaleDateString("en-US", {
                          month: "long", day: "numeric", year: "numeric",
                        })}
                        {event.end_date && (
                          <>
                            {" "}&ndash;{" "}
                            {new Date(event.end_date + "T00:00:00").toLocaleDateString("en-US", {
                              month: "long", day: "numeric", year: "numeric",
                            })}
                          </>
                        )}
                      </p>
                    )}
                    {(event.city || event.country) && (
                      <p className="text-gray-500 text-sm mb-4">
                        {[event.city, event.country].filter(Boolean).join(", ")}
                      </p>
                    )}
                    <span className="inline-flex items-center gap-1 text-[#29BDD6] hover:text-[#3dcde6] text-sm font-semibold transition-colors">
                      Learn More
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400">
              No upcoming gatherings at this time. Check back soon.
            </p>
          )}
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
          <PastGatherings events={pastEvents} />
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#0f2744] mb-4">
            Looking for Event Registration?
          </h3>
          <p className="text-gray-500 mb-8">
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
