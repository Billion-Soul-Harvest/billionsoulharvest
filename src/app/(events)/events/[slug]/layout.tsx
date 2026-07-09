import { createClient } from "@/shared/utils/supabase/server";
import { notFound } from "next/navigation";
import type { Event, EventPage } from "@/shared/types/database";
import { EventSiteHeader } from "@/features/events/public/event-site-header";
import { StaticFooter } from "@/app/(static-site)/static-render/components/footer";

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
    <div className="min-h-screen flex flex-col bg-[#f9f9ff] text-[#0a1c34]">
      <EventSiteHeader
        event={event as unknown as Event}
        pages={typedPages}
      />
      <main className="flex-1">{children}</main>
      <StaticFooter />
    </div>
  );
}
