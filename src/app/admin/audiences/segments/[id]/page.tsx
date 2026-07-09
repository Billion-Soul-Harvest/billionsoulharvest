import { createClient } from "@/shared/utils/supabase/server";
import { SegmentBuilderPage } from "@/features/audiences/segment-builder";
import { notFound } from "next/navigation";
import type { Audience } from "@/shared/types/database";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Segment — BSH Admin",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditSegmentPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: audience } = await supabase
    .from("audiences")
    .select("*")
    .eq("id", id)
    .single();

  if (!audience || audience.type !== "segment") {
    notFound();
  }

  const { data: audiences } = await supabase
    .from("audiences")
    .select("name")
    .eq("type", "list")
    .order("name");

  const listNames = (audiences ?? []).map((a) => a.name);

  return <SegmentBuilderPage audience={audience as Audience} listNames={listNames} />;
}
