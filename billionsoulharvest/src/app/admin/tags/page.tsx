import { createClient } from "@/shared/utils/supabase/server";
import { TagsManager } from "@/features/tags/tags-manager";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tags — BSH Admin",
};

export default async function TagsPage() {
  const supabase = await createClient();
  const { data: tags } = await supabase.rpc("get_tags_with_counts");

  return <TagsManager tags={tags ?? []} />;
}
