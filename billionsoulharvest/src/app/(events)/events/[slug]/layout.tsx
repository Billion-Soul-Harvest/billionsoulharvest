import { createClient } from "@/shared/utils/supabase/server";
import { notFound } from "next/navigation";
import type { Event, EventPage } from "@/shared/types/database";
import { EventSiteHeader } from "@/features/events/public/event-site-header";

interface Props {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}

export default async function EventSiteLayout({ params, children }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select("id, title, slug, banner_url, status")
    .eq("slug", slug)
    .single();

  if (!event) notFound();

  const { data: pages } = await supabase
    .from("event_pages")
    .select("id, title, slug, sort_order, published")
    .eq("event_id", event.id)
    .eq("published", true)
    .order("sort_order");

  const typedPages = (pages ?? []) as unknown as EventPage[];

  return (
    <div className="min-h-screen flex flex-col bg-[#0f2744]">
      <EventSiteHeader
        event={event as unknown as Event}
        pages={typedPages}
      />
      <main className="flex-1">{children}</main>
      <footer className="bg-[#0a1e38] border-t border-white/10 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Billion Soul Harvest. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
