import { createClient } from "@/shared/utils/supabase/server";
import { notFound } from "next/navigation";
import { PageBuilder } from "@/features/events/builder/editor";
import type { Event } from "@/shared/types/database";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function BuilderPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !event) notFound();

  return <PageBuilder event={event as unknown as Event} />;
}
