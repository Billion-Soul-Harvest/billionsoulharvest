import { createClient } from "@/shared/utils/supabase/server";
import { notFound } from "next/navigation";
import { StoryPageBuilder } from "@/features/stories/builder/story-editor";
import type { Story } from "@/shared/types/database";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function StoryBuilderPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: story, error } = await supabase
    .from("stories")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !story) notFound();

  return <StoryPageBuilder story={story as unknown as Story} />;
}
