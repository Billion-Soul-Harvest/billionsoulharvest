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

function extractFirstImage(contentHtml: string | null, galleryImages: { url: string }[] | null): string | null {
  if (contentHtml) {
    const match = contentHtml.match(/<img[^>]+src="([^"]+)"/);
    if (match) return match[1];
  }
  if (galleryImages && galleryImages.length > 0) {
    return galleryImages[0].url;
  }
  return null;
}

function extractTextSnippet(contentHtml: string | null, maxLength = 150): string | null {
  if (!contentHtml) return null;
  const text = contentHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (!text) return null;
  if (text.length <= maxLength) return text;
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + "...";
}

export default async function StoriesListingPage() {
  const supabase = await createClient();

  const { data: stories } = await supabase
    .from("stories")
    .select("id, title, slug, description, author, published_at, display_order, content_html, gallery_images")
    .eq("status", "published")
    .order("display_order", { ascending: true, nullsFirst: false })
    .order("published_at", { ascending: false });

  const storyCount = stories?.length ?? 0;

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a] text-white">
      <StaticHeader />
      <main className="flex-1">
        {/* ── Hero ── */}
        <section
          className="relative overflow-hidden flex flex-col justify-end"
          style={{ minHeight: "74vh" }}
        >
          <Image
            src="/hero/home/media-hero-bg.webp"
            alt=""
            fill
            className="object-cover"
            style={{ objectPosition: "center 45%" }}
            priority
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, #0a0a0a 2%, rgba(10,10,10,0.7) 35%, rgba(10,10,10,0.15) 70%, transparent 100%)",
            }}
          />

          <div className="relative z-10 px-4 md:px-10 pb-[60px] pt-[190px] flex flex-col gap-7">
            <div className="flex items-center">
              <span className="inline-block bg-[#0a1928]/80 border border-[#1ecdec]/50 rounded-full px-6 py-2.5 font-[family-name:var(--font-geist-mono)] text-[12px] font-medium tracking-[0.2em] uppercase text-[#1ecdec]">
                From the Field
              </span>
            </div>

            <h1
              className="font-[family-name:var(--font-jakarta)] text-white uppercase m-0"
              style={{
                fontWeight: 900,
                fontSize: "clamp(52px, 9vw, 168px)",
                lineHeight: 0.82,
                letterSpacing: "-0.06em",
                textShadow: "0 4px 40px rgba(10,10,10,0.55)",
              }}
            >
              Stories
            </h1>

            <p
              className="font-[family-name:var(--font-jakarta)] m-0 max-w-[58ch] text-pretty"
              style={{
                paddingTop: "26px",
                borderTop: "2px solid rgba(255,255,255,0.32)",
                fontSize: "17px",
                lineHeight: 1.7,
                color: "rgba(255,255,255,0.93)",
              }}
            >
              Discover stories of impact and transformation from the Billion
              Soul Harvest movement.
            </p>
          </div>
        </section>

        {/* ── Latest Stories ── */}
        <section className="py-[110px] bg-[#f5f7fa] text-[#0a0a0a]">
          <div className="max-w-[1360px] mx-auto px-4 md:px-10 flex flex-col gap-11">
            <div
              className="flex flex-wrap items-end justify-between gap-5 pb-[22px]"
              style={{ borderBottom: "2px solid #0a0a0a" }}
            >
              <h2
                className="font-[family-name:var(--font-jakarta)] uppercase m-0"
                style={{
                  fontWeight: 900,
                  fontSize: "clamp(36px, 4.8vw, 80px)",
                  lineHeight: 0.88,
                  letterSpacing: "-0.05em",
                }}
              >
                Latest Stories
              </h2>
              <p className="font-[family-name:var(--font-geist-mono)] text-[12.5px] font-medium tracking-[0.16em] uppercase text-[#506b9f] m-0">
                {storyCount} {storyCount === 1 ? "story" : "stories"}
              </p>
            </div>

            {stories && stories.length > 0 ? (
              <div
                className="grid gap-6"
                style={{
                  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                }}
              >
                {stories.map((story) => {
                  const previewImage = extractFirstImage(
                    story.content_html,
                    story.gallery_images as { url: string }[] | null
                  );
                  const snippet = extractTextSnippet(story.content_html, 120) || story.description;

                  return (
                    <Link
                      key={story.id}
                      href={`/stories/${story.slug}`}
                      className="flex flex-col bg-white border border-[#0a0a0a]/20 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(10,10,10,0.18)] shadow-[0_2px_12px_rgba(10,10,10,0.08)]"
                    >
                      {/* Card image */}
                      <span
                        className="relative block overflow-hidden"
                        style={{ aspectRatio: "3/2", backgroundColor: "#e8ecf1" }}
                      >
                        {previewImage ? (
                          <Image
                            src={previewImage}
                            alt={story.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        ) : (
                          <span className="absolute inset-0 bg-gradient-to-br from-[#0d1520] to-[#1ecdec]/20 flex items-center justify-center">
                            <svg className="w-10 h-10 text-white/25" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                          </span>
                        )}
                      </span>

                      {/* Card body */}
                      <span className="flex flex-col flex-1 gap-3 p-6">
                        <span
                          className="font-[family-name:var(--font-jakarta)]"
                          style={{
                            fontWeight: 800,
                            fontSize: "18px",
                            lineHeight: 1.25,
                            letterSpacing: "-0.02em",
                            color: "#0a0a0a",
                          }}
                        >
                          {story.title}
                        </span>
                        {snippet && (
                          <span
                            className="font-[family-name:var(--font-jakarta)]"
                            style={{
                              fontSize: "14.5px",
                              lineHeight: 1.6,
                              color: "#505870",
                            }}
                          >
                            {snippet}
                          </span>
                        )}

                        {/* Card footer */}
                        <span
                          className="flex items-center justify-between gap-4 mt-auto pt-4"
                          style={{
                            borderTop: "1px solid rgba(10,10,10,0.1)",
                          }}
                        >
                          <span
                            className="font-[family-name:var(--font-geist-mono)]"
                            style={{
                              fontSize: "11.5px",
                              letterSpacing: "0.04em",
                              color: "#506b9f",
                            }}
                          >
                            {story.author && <>{story.author}</>}
                            {story.author && story.published_at && <> · </>}
                            {story.published_at && new Date(story.published_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                          </span>
                          <span
                            className="font-[family-name:var(--font-jakarta)] font-[700] text-[#1ecdec]"
                            style={{
                              fontSize: "13px",
                              letterSpacing: "0.02em",
                              whiteSpace: "nowrap",
                            }}
                          >
                            Read More
                          </span>
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 px-4">
                <p className="font-[family-name:var(--font-jakarta)] text-[#505870] text-[17px]">
                  Stories coming soon. Check back for inspiring stories of impact and transformation.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ── Resources ── */}
        <section className="py-[110px] bg-[#0a0a0a]">
          <div className="max-w-[1360px] mx-auto px-4 md:px-10 flex flex-col gap-11">
            <div
              className="flex flex-wrap items-end justify-between gap-5 pb-[22px]"
              style={{ borderBottom: "2px solid rgba(255,255,255,0.3)" }}
            >
              <h2
                className="font-[family-name:var(--font-jakarta)] uppercase text-white m-0"
                style={{
                  fontWeight: 900,
                  fontSize: "clamp(36px, 4.8vw, 80px)",
                  lineHeight: 0.88,
                  letterSpacing: "-0.05em",
                }}
              >
                Resources
              </h2>
              <p className="font-[family-name:var(--font-geist-mono)] text-[12.5px] font-medium tracking-[0.16em] uppercase text-[#1ecdec] m-0 max-w-[34ch]">
                Downloads, Brochures, Guides &amp; Presentations
              </p>
            </div>

            <div
              className="grid"
              style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                borderTop: "1px solid rgba(255,255,255,0.16)",
                borderLeft: "1px solid rgba(255,255,255,0.16)",
              }}
            >
              {[
                { label: "Downloads", number: "01" },
                { label: "Brochures", number: "02" },
                { label: "Guides", number: "03" },
                { label: "Presentations", number: "04" },
              ].map((cat) => (
                <div
                  key={cat.label}
                  className="flex flex-col bg-[#0a0a0a]"
                  style={{
                    borderRight: "1px solid rgba(255,255,255,0.16)",
                    borderBottom: "1px solid rgba(255,255,255,0.16)",
                    padding: "40px 30px 44px",
                    gap: "16px",
                  }}
                >
                  <span
                    className="font-[family-name:var(--font-geist-mono)] uppercase"
                    style={{
                      fontSize: "11px",
                      fontWeight: 500,
                      letterSpacing: "0.14em",
                      color: "#1ecdec",
                    }}
                  >
                    {cat.number}
                  </span>
                  <h3
                    className="font-[family-name:var(--font-jakarta)] uppercase text-white m-0"
                    style={{
                      fontWeight: 900,
                      fontSize: "clamp(26px, 2.4vw, 36px)",
                      lineHeight: 0.92,
                      letterSpacing: "-0.045em",
                    }}
                  >
                    {cat.label}
                  </h3>
                  <span
                    className="self-start font-[family-name:var(--font-geist-mono)] uppercase"
                    style={{
                      marginTop: "6px",
                      padding: "6px 11px",
                      border: "1px solid rgba(255,255,255,0.28)",
                      fontSize: "10.5px",
                      fontWeight: 500,
                      letterSpacing: "0.14em",
                      color: "rgba(255,255,255,0.82)",
                    }}
                  >
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
