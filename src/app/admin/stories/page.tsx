import { createClient } from "@/shared/utils/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";
import { StoriesList } from "@/features/stories/admin/stories-list";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Stories — BSH Admin",
};

export default async function StoriesPage() {
  const supabase = await createClient();

  const { data: stories } = await supabase
    .from("stories")
    .select("id, title, description, slug, status, author, published_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Stories</h1>
        <Link href="/admin/stories/new">
          <Button>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Story
          </Button>
        </Link>
      </div>

      <StoriesList stories={stories ?? []} />
    </div>
  );
}
