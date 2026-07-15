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

  const galleryImages = (typedStory.gallery_images ?? []) as { url: string; caption?: string }[];

  // New WYSIWYG content
  if (typedStory.content_html) {
    return (
      <div>
        {isPreview && (
          <div className="bg-amber-500 text-amber-950 text-center text-sm font-medium py-2 px-4">
            Preview Mode — This story is not yet published.
            <Link href="/admin/stories" className="underline ml-2">Back to Admin</Link>
          </div>
        )}

        {/* Banner */}
        {typedStory.banner_url && (
          <div className="w-full max-h-[500px] overflow-hidden">
            <img
              src={typedStory.banner_url}
              alt={typedStory.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="max-w-[720px] mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{typedStory.title}</h1>
          <div className="flex items-center gap-3 text-sm text-gray-500 mb-8">
            {typedStory.author && <span>{typedStory.author}</span>}
            {typedStory.author && typedStory.published_at && <span>&middot;</span>}
            {typedStory.published_at && (
              <time dateTime={typedStory.published_at}>
                {new Date(typedStory.published_at).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </time>
            )}
          </div>

          <div
            className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-[#29BDD6] prose-img:rounded-lg"
            dangerouslySetInnerHTML={{ __html: typedStory.content_html }}
          />
        </div>

        {/* Gallery */}
        {galleryImages.length > 0 && (
          <div className="max-w-[1000px] mx-auto px-4 pb-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {galleryImages.map((img, i) => (
                <div key={i} className="space-y-2">
                  <div className="aspect-[4/3] rounded-lg overflow-hidden">
                    <img
                      src={img.url}
                      alt={img.caption || `Gallery image ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {img.caption && (
                    <p className="text-sm text-gray-500 text-center">{img.caption}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Fallback: Craft.js page builder content
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

  // No content yet
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <p className="text-gray-400 text-lg">This story is under construction.</p>
    </div>
  );
}
