import Link from "next/link";
import type { Event } from "@/shared/types/database";

interface Props {
  event: Event;
  config: Record<string, unknown>;
}

export function HeroBlock({ event, config }: Props) {
  const showDates = config.show_dates !== false;
  const showCta = config.show_cta !== false;

  return (
    <section className="relative overflow-hidden">
      {event.banner_url ? (
        <div className="absolute inset-0">
          <img src={event.banner_url} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#0f2744]/80" />
        </div>
      ) : (
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-[#c69c3f]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-3xl" />
        </div>
      )}

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 text-center">
        <h1 className="font-[family-name:var(--font-heading)] text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
          {event.title}
        </h1>

        {showDates && (
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-gray-300 mb-6">
            {event.start_date && (
              <span className="flex items-center gap-1.5 text-sm">
                <svg className="w-4 h-4 text-[#c69c3f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
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
              </span>
            )}
            {(event.city || event.country) && (
              <span className="flex items-center gap-1.5 text-sm">
                <svg className="w-4 h-4 text-[#c69c3f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {[event.location, event.city, event.country].filter(Boolean).join(", ")}
              </span>
            )}
          </div>
        )}

        {event.description && (
          <p className="text-gray-300/80 max-w-2xl mx-auto mb-8">{event.description}</p>
        )}

        {showCta && event.status === "registration_open" && (
          <Link
            href={`/register/${event.slug}`}
            className="inline-flex items-center gap-2 bg-[#c69c3f] hover:bg-[#b08a35] text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors shadow-lg shadow-[#c69c3f]/20"
          >
            Register Now
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        )}
      </div>
    </section>
  );
}
