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
    .select("id, title, slug, description, author, banner_url, published_at, display_order")
    .eq("status", "published")
    .order("display_order", { ascending: true, nullsFirst: false })
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
              <div className="flex flex-col items-center justify-center py-24 px-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#0d223f]/10 to-[#29BDD6]/10 flex items-center justify-center mb-6">
                  <svg className="w-10 h-10 text-[#29BDD6]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-[#0d223f] mb-2 font-[family-name:var(--font-jakarta)]">
                  Stories Coming Soon
                </h2>
                <p className="text-gray-400 text-center max-w-md">
                  We&apos;re preparing inspiring stories of impact and transformation from around the world. Check back soon to read about what God is doing through the Billion Soul Harvest movement.
                </p>
                <div className="flex items-center gap-2 mt-8">
                  <span className="w-2 h-2 rounded-full bg-[#29BDD6]/30 animate-pulse" />
                  <span className="w-2 h-2 rounded-full bg-[#29BDD6]/50 animate-pulse [animation-delay:300ms]" />
                  <span className="w-2 h-2 rounded-full bg-[#29BDD6]/30 animate-pulse [animation-delay:600ms]" />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Resources */}
        <section className="py-20 md:py-[100px] bg-white">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <div className="mb-12">
              <span className="text-[#00b8d4] text-xs font-semibold font-[family-name:var(--font-geist-sans)] uppercase tracking-widest">
                Downloads, Brochures, Guides &amp; Presentations
              </span>
              <h2 className="font-[family-name:var(--font-jakarta)] text-3xl md:text-[40px] md:leading-[48px] font-bold text-[#0d223f] mt-4 tracking-[-0.02em]">
                Resources
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: "Downloads", icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                )},
                { label: "Brochures", icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                )},
                { label: "Guides", icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )},
                { label: "Presentations", icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21l5-2.5L17 21M7 3l5 2.5L17 3m-5 2.5V21M3 7h18M3 17h18M3 7v10h18V7" />
                  </svg>
                )},
              ].map((cat) => (
                <div
                  key={cat.label}
                  className="group bg-[#f9f9ff] rounded-2xl border border-[#b4c7ec]/20 p-6 hover:border-[#00b8d4]/30 hover:shadow-md transition-all duration-300 flex flex-col items-center text-center"
                >
                  <div className="w-14 h-14 rounded-xl bg-[#0d223f] flex items-center justify-center text-[#a9edff] mb-4">
                    {cat.icon}
                  </div>
                  <h3 className="font-[family-name:var(--font-jakarta)] text-lg font-bold text-[#0d223f] mb-2">
                    {cat.label}
                  </h3>
                  <span className="text-sm text-[#44474d]/60 italic font-[family-name:var(--font-geist-sans)]">
                    Coming soon
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <StaticFooter />
    </div>
  );
}
