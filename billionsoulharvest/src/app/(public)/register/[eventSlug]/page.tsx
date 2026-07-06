import { createClient } from "@/shared/utils/supabase/server";
import { notFound } from "next/navigation";
import { RegistrationForm } from "@/features/registration/registration-form";
import { DynamicRegistrationForm } from "@/features/registration/dynamic-registration-form";
import type { RegistrationConfig } from "@/shared/types/database";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ eventSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { eventSlug } = await params;
  const supabase = await createClient();
  const { data: event } = await supabase
    .from("events")
    .select("title, description")
    .eq("slug", eventSlug)
    .single();

  return {
    title: event ? `Register — ${event.title}` : "Event Registration",
    description: event?.description || "Register for a Billion Soul Harvest event",
  };
}

export default async function RegisterPage({ params }: Props) {
  const { eventSlug } = await params;
  const supabase = await createClient();

  const { data: event, error } = await supabase
    .from("events")
    .select("*, ministry_regions(name, color)")
    .eq("slug", eventSlug)
    .single();

  if (error || !event) {
    notFound();
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "TBD";
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const dateRange =
    event.start_date && event.end_date
      ? `${formatDate(event.start_date)} — ${formatDate(event.end_date)}`
      : "Dates TBD";

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50/30 to-green-50/40 relative overflow-hidden">
      {/* Background texture */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      {/* Hero Section */}
      <header className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-900 via-emerald-800 to-amber-900 overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="absolute top-40 -left-32 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-yellow-500/10 rounded-full blur-2xl" />
          {/* Cross pattern overlay */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, white 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }} />
        </div>

        <div className="relative max-w-4xl mx-auto px-6 pt-12 pb-16 sm:pt-20 sm:pb-24 text-center">
          {/* Ministry badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2 mb-8">
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
            <span className="text-amber-100 text-sm font-medium tracking-wider uppercase">
              Registration Open
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight tracking-tight">
            {event.title}
          </h1>

          <p className="text-lg sm:text-xl text-amber-100/80 max-w-2xl mx-auto mb-8 leading-relaxed">
            {event.description}
          </p>

          {/* Event details pills */}
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2.5 border border-white/10">
              <svg className="w-4 h-4 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-white font-medium">{dateRange}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2.5 border border-white/10">
              <svg className="w-4 h-4 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-white font-medium">
                {event.location || event.city || "Location TBD"}, {event.country}
              </span>
            </div>
          </div>
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 80V40C240 80 480 0 720 40C960 80 1200 0 1440 40V80H0Z" className="fill-amber-50/50" />
            <path d="M0 80V50C240 80 480 20 720 50C960 80 1200 20 1440 50V80H0Z" className="fill-amber-50" style={{ fill: 'rgb(255 251 235 / 1)' }} />
          </svg>
        </div>
      </header>

      {/* Registration Form Section */}
      <main className="relative max-w-2xl mx-auto px-6 -mt-4 pb-20">
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-amber-100 shadow-xl shadow-amber-900/5 p-8 sm:p-10">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-amber-950 mb-2">
              Register Now
            </h2>
            <p className="text-amber-700/70 text-sm">
              Complete the form below to secure your spot. Fields marked with{" "}
              <span className="text-red-500">*</span> are required.
            </p>
          </div>

          {(event.registration_config as RegistrationConfig | null)?.enabled ? (
            <DynamicRegistrationForm
              registrationConfig={event.registration_config as RegistrationConfig}
              eventSlug={eventSlug}
            />
          ) : (
            <RegistrationForm eventSlug={eventSlug} eventTitle={event.title} />
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-amber-800/40 text-sm font-medium tracking-wider uppercase">
            Billion Soul Harvest Ministry
          </p>
        </div>
      </main>
    </div>
  );
}
