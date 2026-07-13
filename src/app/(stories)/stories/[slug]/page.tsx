import { createClient } from "@/shared/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import type { Story } from "@/shared/types/database";
import { CraftPageRenderer } from "@/features/events/builder/render";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("stories")
    .select("title, description")
    .eq("slug", slug)
    .single();

  if (!data) return { title: "Story Not Found" };
  return {
    title: `${data.title} — Billion Soul Harvest`,
    description: data.description ?? undefined,
  };
}

export default async function StoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const isPreview = preview === "true";
  const supabase = await createClient();

  const { data: story } = await supabase
    .from("stories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!story) notFound();

  const typedStory = story as unknown as Story;

  // Only show published stories unless preview mode
  if (typedStory.status !== "published" && !isPreview) notFound();

  if (typedStory.page_content) {
    return (
      <div>
        {isPreview && (
          <div className="bg-amber-500 text-amber-950 text-center text-sm font-medium py-2 px-4">
            Preview Mode — This story is not yet published.
            <Link href="/admin/stories" className="underline ml-2">Back to Admin</Link>
          </div>
        )}
        <CraftPageRenderer
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          content={typedStory.page_content as any}
        />
      </div>
    );
  }

  // No page content yet
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <p className="text-gray-400 text-lg">This story is under construction.</p>
    </div>
  );
}
