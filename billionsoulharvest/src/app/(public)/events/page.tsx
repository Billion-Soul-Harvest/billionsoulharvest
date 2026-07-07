import Link from "next/link";
import { createClient } from "@/shared/utils/supabase/server";
import { Badge } from "@/components/ui/badge";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Events — Billion Soul Harvest",
  description: "Browse upcoming and past Billion Soul Harvest events and summits.",
};

const statusStyles: Record<string, string> = {
  registration_open: "bg-green-500/20 text-green-300 border-green-500/30",
  published: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  completed: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const statusLabels: Record<string, string> = {
  registration_open: "Registration Open",
  published: "Coming Soon",
  completed: "Completed",
};

export default async function EventsListPage() {
  const supabase = await createClient();
  const { data: events } = await supabase
    .from("events")
    .select("*, region:ministry_regions(name, color)")
    .in("status", ["published", "registration_open", "completed"])
    .order("start_date", { ascending: false });

  return (
    <div>
      {/* Hero */}
      <section className="py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-[family-name:var(--font-heading)] text-4xl sm:text-5xl font-bold text-white mb-6">
            Events & Summits
          </h1>
          <p className="text-lg text-gray-300/80 max-w-2xl mx-auto leading-relaxed">
            Global Harvest Summits and regional gatherings bringing church leaders
            together for worship, equipping, and partnership.
          </p>
        </div>
      </section>

      {/* Events Grid */}
      <section className="bg-[#0a1e38] py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {events && events.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.slug}`}
                  className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-[#29BDD6]/30 transition-all"
                >
                  {/* Banner placeholder */}
                  <div className="h-40 bg-gradient-to-br from-[#1e3a5f] to-[#0f2744] flex items-center justify-center">
                    {event.banner_url ? (
                      <img src={event.banner_url} alt={event.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-[#29BDD6]/30 text-4xl font-bold">BSH</div>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge
                        variant="outline"
                        className={statusStyles[event.status] ?? "bg-gray-500/20 text-gray-400 border-gray-500/30"}
                      >
                        {statusLabels[event.status] ?? event.status}
                      </Badge>
                      {event.region && (
                        <Badge variant="outline" className="border-white/10 text-gray-400">
                          {(event.region as { name: string }).name}
                        </Badge>
                      )}
                    </div>

                    <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold text-white group-hover:text-[#29BDD6] transition-colors mb-2">
                      {event.title}
                    </h3>

                    <p className="text-gray-400 text-sm mb-1">
                      {event.start_date && new Date(event.start_date + "T00:00:00").toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                      {event.end_date && (
                        <> &ndash; {new Date(event.end_date + "T00:00:00").toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}</>
                      )}
                    </p>

                    {(event.city || event.country) && (
                      <p className="text-gray-500 text-sm">
                        {[event.city, event.country].filter(Boolean).join(", ")}
                      </p>
                    )}

                    {event.description && (
                      <p className="text-gray-400 text-xs mt-3 line-clamp-2">{event.description}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-400 text-lg">No events available at this time.</p>
              <p className="text-gray-500 text-sm mt-2">Check back soon for upcoming gatherings.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
