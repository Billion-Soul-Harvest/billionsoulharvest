import { createClient } from "@/shared/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ eventSlug: string }>;
}

export const metadata: Metadata = {
  title: "Registration Confirmed — Billion Soul Harvest",
};

export default async function SuccessPage({ params }: Props) {
  const { eventSlug } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select("title, start_date, end_date, location, city, country")
    .eq("slug", eventSlug)
    .single();

  if (!event) notFound();

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "TBD";
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#f9f9ff] flex items-center justify-center p-6">
      <div className="max-w-lg w-full text-center">
        {/* Success checkmark */}
        <div className="mx-auto w-20 h-20 bg-[#00b8d4]/15 rounded-full flex items-center justify-center mb-8 shadow-lg shadow-[#00b8d4]/10">
          <svg className="w-10 h-10 text-[#00b8d4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-[#0d223f] mb-3">
          You&apos;re Registered!
        </h1>

        <p className="text-[#0d223f]/50 text-lg mb-8">
          Your registration for <span className="font-semibold text-[#0d223f]">{event.title}</span> has been confirmed. A confirmation email is on its way.
        </p>

        {/* Event summary card */}
        <div className="bg-white rounded-2xl border border-[#b4c7ec]/30 shadow-lg p-6 mb-8 text-left">
          <h3 className="text-sm font-semibold text-[#00b8d4] uppercase tracking-wider mb-4">
            Event Details
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-[#00b8d4] mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="text-[#0d223f] font-medium">{formatDate(event.start_date)}</p>
                {event.end_date && event.end_date !== event.start_date && (
                  <p className="text-[#0d223f]/50 text-sm">through {formatDate(event.end_date)}</p>
                )}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-[#00b8d4] mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-[#0d223f] font-medium">
                {event.location || event.city || "Location TBD"}, {event.country}
              </p>
            </div>
          </div>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[#00b8d4] hover:text-[#0d223f] font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Billion Soul Harvest
        </Link>
      </div>
    </div>
  );
}
