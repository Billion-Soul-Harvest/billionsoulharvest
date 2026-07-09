import { createClient } from "@/shared/utils/supabase/server";
import { SegmentBuilderPage } from "@/features/audiences/segment-builder";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Segment — BSH Admin",
};

export default async function NewSegmentPage() {
  const supabase = await createClient();

  const { data: audiences } = await supabase
    .from("audiences")
    .select("name")
    .eq("type", "list")
    .order("name");

  const listNames = (audiences ?? []).map((a) => a.name);

  return <SegmentBuilderPage audience={null} listNames={listNames} />;
}
