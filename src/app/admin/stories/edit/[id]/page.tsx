import { createClient } from "@/shared/utils/supabase/server";
import { notFound } from "next/navigation";
import { StoryForm } from "@/features/stories/story-form";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { StoryStatus } from "@/shared/types/database";
import { DeleteStoryButton } from "@/features/stories/admin/delete-story-button";

interface Props {
  params: Promise<{ id: string }>;
}

const statusColors: Record<StoryStatus, string> = {
  draft: "bg-gray-100 text-gray-700",
  published: "bg-blue-100 text-blue-700",
};

export const dynamic = "force-dynamic";

export default async function StoryDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: story, error } = await supabase.from("stories").select("*").eq("id", id).single();

  if (error || !story) notFound();

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/stories" className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 flex-1">{story.title}</h1>
        <Link
          href={`/stories/${story.slug}?preview=true`}
          target="_blank"
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Preview
        </Link>
        <Badge variant="secondary" className={statusColors[story.status as StoryStatus]}>
          {story.status}
        </Badge>
        <DeleteStoryButton storyId={story.id} storyTitle={story.title} />
      </div>

      <StoryForm
        story={{
          id: story.id,
          title: story.title,
          slug: story.slug,
          description: story.description ?? "",
          author: story.author ?? "",
          status: story.status as StoryStatus,
          banner_url: story.banner_url ?? "",
          published_at: story.published_at ?? "",
          content_html: story.content_html ?? "",
          gallery_images: story.gallery_images ?? [],
        }}
      />
    </div>
  );
}
