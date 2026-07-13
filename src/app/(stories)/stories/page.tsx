import { createClient } from "@/shared/utils/supabase/server";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { StaticHeader } from "@/app/(static-site)/static-render/components/header";
import { StaticFooter } from "@/app/(static-site)/static-render/components/footer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Stories — Billion Soul Harvest",
  description: "Read stories from the Billion Soul Harvest movement.",
};

export default async function StoriesListingPage() {
  const supabase = await createClient();

  const { data: stories } = await supabase
    .from("stories")
    .select("id, title, slug, description, author, banner_url, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  return (
    <div className="min-h-screen flex flex-col bg-[#f9f9ff] text-[#0a1c34]">
      <StaticHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-[#0d223f] to-[#1a3a5c] py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-[family-name:var(--font-jakarta)]">
              Stories
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Discover stories of impact and transformation from the Billion Soul Harvest movement.
            </p>
          </div>
        </section>

        {/* Stories Grid */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            {stories && stories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {stories.map((story) => (
                  <Link
                    key={story.id}
                    href={`/stories/${story.slug}`}
                    className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {story.banner_url ? (
                      <div className="aspect-[16/9] relative overflow-hidden">
                        <Image
                          src={story.banner_url}
                          alt={story.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="aspect-[16/9] bg-gradient-to-br from-[#0d223f] to-[#29BDD6] flex items-center justify-center">
                        <svg className="w-12 h-12 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                    )}
                    <div className="p-6">
                      <h2 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#29BDD6] transition-colors line-clamp-2">
                        {story.title}
                      </h2>
                      {story.description && (
                        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{story.description}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        {story.author && <span>{story.author}</span>}
                        {story.author && story.published_at && <span>&middot;</span>}
                        {story.published_at && (
                          <span>{new Date(story.published_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-gray-400">
                <p className="text-lg">No stories published yet. Check back soon.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <StaticFooter />
    </div>
  );
}
