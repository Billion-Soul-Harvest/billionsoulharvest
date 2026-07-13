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
        <Badge variant="secondary" className={statusColors[story.status as StoryStatus]}>
          {story.status}
        </Badge>
        <DeleteStoryButton storyId={story.id} storyTitle={story.title} />
      </div>

      {/* Page Builder CTA */}
      <div className="bg-white rounded-xl border p-6 mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Story Page</h2>
          <p className="text-sm text-gray-500 mt-1">
            Design your story&apos;s public page with the drag-and-drop builder.
          </p>
          <div className="flex gap-4 mt-2">
            <p className="text-xs text-gray-400">
              Public page: <code className="bg-gray-50 px-2 py-0.5 rounded border text-blue-700">/stories/{story.slug}</code>
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/stories/${story.slug}?preview=true`}
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Preview
          </Link>
          <Link
            href={`/admin/stories/edit/${story.id}/builder`}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#29BDD6] rounded-lg hover:bg-[#29BDD6]/90 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Open Page Builder
          </Link>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Story Details</h2>
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
          }}
        />
      </div>
    </div>
  );
}
