import Link from "next/link";
import { createClient } from "@/shared/utils/supabase/server";
import { VideoDialogButton } from "./components/video-dialog";
import { ScrollReveal } from "./components/scroll-reveal";
import { HeroSlideshow } from "./components/hero-slideshow";

export const revalidate = 3600;

export default async function StaticHomePage() {
  const supabase = await createClient();

  const { data: events } = await supabase
    .from("events")
    .select(
      "id, title, slug, start_date, end_date, city, country, banner_url, status, is_external, external_url"
    )
    .eq("status", "published")
    .order("start_date", { ascending: true })
    .limit(3);

  return (
    <div className="scroll-smooth">
      {/* ── Hero Section ── */}
      <header
        id="about"
        className="relative min-h-[700px] lg:min-h-[800px] flex items-center overflow-hidden"
      >
        <HeroSlideshow />
        <div
          className="absolute inset-0 z-[1]"
          style={{
            background:
              "linear-gradient(to bottom, rgba(13,34,63,0.7), rgba(13,34,63,0.92))",
          }}
        />
        <div className="relative z-10 max-w-[1280px] mx-auto px-4 md:px-8 w-full" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>
          <div className="max-w-2xl">
            <span className="inline-block bg-[#65e2fe] text-[#006373] px-4 py-1 rounded-lg text-xs font-semibold font-[family-name:var(--font-geist-sans)] mb-6 uppercase tracking-wider">
              ESTABLISHED FOR 2033
            </span>
            <h1 className="font-[family-name:var(--font-jakarta)] text-4xl md:text-[48px] md:leading-[56px] font-bold text-white mb-6 tracking-[-0.02em]">
              What is Billion Soul Harvest?
            </h1>
            <p className="font-[family-name:var(--font-jakarta)] text-lg leading-7 text-white/90 mb-10">
              <strong>Billion Soul Harvest (BSH)</strong> is a global movement
              uniting churches, ministries, mission organizations, and Christian
              leaders around a shared vision: <strong>to help catalyze the
              greatest harvest of souls in history as we approach the year
              2033</strong> — the 2,000th anniversary of the death, resurrection,
              and the birth of the Church.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/events"
                className="bg-[#00b8d4] text-white px-10 py-4 rounded-lg text-sm font-semibold font-[family-name:var(--font-geist-sans)] hover:bg-[#006879] transition-all inline-flex items-center gap-2"
              >
                Join the Movement
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <VideoDialogButton />
            </div>
          </div>
        </div>
      </header>

      {/* ── Mission: Evangelize, Disciple, Multiply ── */}
      <section id="mission" className="py-20 md:py-[120px] bg-[#f9f9ff]">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="text-[#00b8d4] text-xs font-semibold font-[family-name:var(--font-geist-sans)] tracking-widest uppercase">
                Our Core Call
              </span>
              <h2 className="font-[family-name:var(--font-jakarta)] text-[28px] md:text-[32px] leading-10 font-semibold text-[#000b20] mt-2">
                Evangelize, Disciple, Multiply
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Evangelize */}
            <ScrollReveal delay={0}>
            <div className="bg-white p-10 rounded-lg shadow-sm hover:shadow-xl transition-all border-b-4 border-[#00b8d4] group h-full">
              <div className="w-16 h-16 bg-[#00b8d4]/10 rounded-lg flex items-center justify-center mb-8 group-hover:bg-[#00b8d4] transition-colors">
                <svg
                  className="w-8 h-8 text-[#00b8d4] group-hover:text-white transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A8.966 8.966 0 013 12c0-1.777.514-3.434 1.401-4.832"
                  />
                </svg>
              </div>
              <h3 className="font-[family-name:var(--font-jakarta)] text-2xl font-semibold text-[#0d223f] mb-4">
                Evangelize
              </h3>
              <p className="font-[family-name:var(--font-geist-sans)] text-base leading-relaxed text-[#44474d]">
                Proclaim the Gospel so that every person has the opportunity
                to know Jesus Christ.
              </p>
            </div>
            </ScrollReveal>

            {/* Disciple */}
            <ScrollReveal delay={100}>
            <div className="bg-white p-10 rounded-lg shadow-sm hover:shadow-xl transition-all border-b-4 border-[#000b20] group h-full">
              <div className="w-16 h-16 bg-[#000b20]/10 rounded-lg flex items-center justify-center mb-8 group-hover:bg-[#000b20] transition-colors">
                <svg
                  className="w-8 h-8 text-[#000b20] group-hover:text-white transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                  />
                </svg>
              </div>
              <h3 className="font-[family-name:var(--font-jakarta)] text-2xl font-semibold text-[#0d223f] mb-4">
                Disciple
              </h3>
              <p className="font-[family-name:var(--font-geist-sans)] text-base leading-relaxed text-[#44474d]">
                Equip believers to grow in Christ, live out their faith, and
                become faithful followers of Jesus.
              </p>
            </div>
            </ScrollReveal>

            {/* Multiply */}
            <ScrollReveal delay={200}>
            <div className="bg-white p-10 rounded-lg shadow-sm hover:shadow-xl transition-all border-b-4 border-[#58d6f2] group h-full">
              <div className="w-16 h-16 bg-[#58d6f2]/10 rounded-lg flex items-center justify-center mb-8 group-hover:bg-[#58d6f2] transition-colors">
                <svg
                  className="w-8 h-8 text-[#58d6f2] group-hover:text-white transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
                  />
                </svg>
              </div>
              <h3 className="font-[family-name:var(--font-jakarta)] text-2xl font-semibold text-[#0d223f] mb-4">
                Multiply
              </h3>
              <p className="font-[family-name:var(--font-geist-sans)] text-base leading-relaxed text-[#44474d]">
                Develop leaders, plant ministries, strengthen churches, and
                reproduce disciple-makers who will impact future generations.
              </p>
            </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── DNA: Holy, Humble, Hidden ── */}
      <section className="bg-[#0d223f] text-white py-20 md:py-[120px] relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00b8d4]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#a9edff]/5 rounded-full blur-[100px]" />

        <div className="max-w-[1280px] mx-auto px-4 md:px-8 relative z-10">
          <ScrollReveal direction="none">
            <div className="text-center mb-16">
              <span className="text-[#a9edff] text-xs font-semibold font-[family-name:var(--font-geist-sans)] uppercase tracking-widest">
                The Core Values
              </span>
              <h2 className="font-[family-name:var(--font-jakarta)] text-4xl md:text-[48px] md:leading-[56px] font-bold text-white mt-4 tracking-[-0.02em]">
                Our DNA: Holy, Humble, Hidden
              </h2>
            </div>
          </ScrollReveal>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                num: "01",
                title: "Holy",
                desc: "Living lives fully devoted to God.",
                icon: (
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                  </svg>
                ),
              },
              {
                num: "02",
                title: "Humble",
                desc: "Serving others with the spirit of Christ.",
                icon: (
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                ),
              },
              {
                num: "03",
                title: "Hidden",
                desc: "Seeking God\u2019s glory above our own recognition.",
                icon: (
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div
                key={item.num}
                className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-10 hover:bg-white/10 hover:border-[#a9edff]/30 transition-all duration-300"
              >
                <div className="text-6xl font-[family-name:var(--font-jakarta)] text-[#a9edff]/10 italic absolute top-4 right-6">
                  {item.num}
                </div>
                <div className="text-[#a9edff] mb-5">
                  {item.icon}
                </div>
                <h4 className="font-[family-name:var(--font-jakarta)] text-2xl font-semibold text-white mb-3">
                  {item.title}
                </h4>
                <p className="font-[family-name:var(--font-jakarta)] text-lg leading-7 text-white/70">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Vision: The Four Greats (Bento Grid) ── */}
      <section id="vision" className="py-20 md:py-[120px] bg-[#f0f3ff]">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <ScrollReveal>
            <div className="mb-16">
              <span className="text-[#006879] text-xs font-semibold font-[family-name:var(--font-geist-sans)] tracking-widest uppercase">
                The Roadmap
              </span>
              <h2 className="font-[family-name:var(--font-jakarta)] text-[28px] md:text-[32px] leading-10 font-semibold text-[#0d223f] mt-2">
                Our Vision: The Four Greats
              </h2>
            </div>
          </ScrollReveal>

          <ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-6">
            {/* Great Return */}
            <div className="md:col-span-2 md:row-span-1 bg-white/70 backdrop-blur-sm border border-[#b4c7ec]/30 p-8 rounded-lg">
              <svg className="w-10 h-10 text-[#00b8d4] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
              </svg>
              <h3 className="font-[family-name:var(--font-jakarta)] text-2xl font-semibold text-[#0d223f] mb-2">
                Great Return
              </h3>
              <p className="font-[family-name:var(--font-geist-sans)] text-base text-[#44474d]">
                Living with expectancy for Christ&apos;s return.
              </p>
            </div>

            {/* Great Harvest (featured) */}
            <div className="md:col-span-2 md:row-span-2 bg-[#0d223f] text-white p-8 rounded-lg flex flex-col justify-end relative overflow-hidden" style={{ backgroundImage: "linear-gradient(to top, rgba(13,34,63,0.9) 20%, rgba(13,34,63,0.4) 100%), url('/great-harvest-bg.webp')", backgroundSize: "cover", backgroundPosition: "center" }}>
              <svg className="w-12 h-12 text-[#a9edff] mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
              </svg>
              <h3 className="font-[family-name:var(--font-jakarta)] text-[28px] md:text-[32px] leading-10 font-semibold mb-4">
                Great Harvest
              </h3>
              <p className="font-[family-name:var(--font-jakarta)] text-lg leading-7 text-white/80 max-w-md">
                Reaching the world with the Gospel.
              </p>
              <Link
                href="/events"
                className="mt-8 inline-flex items-center gap-2 text-[#a9edff] text-sm font-semibold font-[family-name:var(--font-geist-sans)] hover:underline"
              >
                LEARN MORE
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            {/* Great Unity */}
            <div className="md:col-span-1 md:row-span-1 bg-white/70 backdrop-blur-sm border border-[#b4c7ec]/30 p-8 rounded-lg border-l-4 border-l-[#b4c7ec]">
              <svg className="w-10 h-10 text-[#b4c7ec] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
              </svg>
              <h3 className="font-[family-name:var(--font-jakarta)] text-2xl font-semibold text-[#0d223f] mb-2">
                Great Unity
              </h3>
              <p className="font-[family-name:var(--font-geist-sans)] text-base text-[#44474d]">
                Bringing the Body of Christ together.
              </p>
            </div>

            {/* Great Breakthrough */}
            <div className="md:col-span-1 md:row-span-1 bg-white/70 backdrop-blur-sm border border-[#b4c7ec]/30 p-8 rounded-lg border-l-4 border-l-[#006879]">
              <svg className="w-10 h-10 text-[#006879] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
              <h3 className="font-[family-name:var(--font-jakarta)] text-2xl font-semibold text-[#0d223f] mb-2">
                Great Breakthrough
              </h3>
              <p className="font-[family-name:var(--font-geist-sans)] text-base text-[#44474d]">
                Advancing God&apos;s Kingdom through prayer, faith, and the
                power of the Holy Spirit.
              </p>
            </div>
          </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Five Global Initiatives ── */}
      <section id="initiatives" className="py-20 md:py-[120px] bg-white">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <ScrollReveal direction="left">
            <div>
              <span className="text-[#00b8d4] text-xs font-semibold font-[family-name:var(--font-geist-sans)] uppercase tracking-widest">
                The Implementation
              </span>
              <h2 className="font-[family-name:var(--font-jakarta)] text-[28px] md:text-[32px] leading-10 font-semibold text-[#0d223f] mt-2 mb-4">
                Five Global Initiatives
              </h2>
              <p className="font-[family-name:var(--font-geist-sans)] text-base text-[#44474d] mb-8 max-w-lg">
                Through strategic global gatherings, leadership development,
                collaborative partnerships, and compassionate outreach, we seek
                to serve as a catalyst for a worldwide movement that prepares
                the Church for the greatest harvest in history.
              </p>

              <div className="space-y-3">
                {[
                  {
                    num: 1,
                    title: "Global Harvest Summits",
                    desc: "Gathering and mobilizing leaders.",
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A8.966 8.966 0 013 12c0-1.777.514-3.434 1.401-4.832" />
                      </svg>
                    ),
                  },
                  {
                    num: 2,
                    title: "International Leadership Institute",
                    desc: "Equipping leaders for lasting Kingdom impact.",
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                      </svg>
                    ),
                  },
                  {
                    num: 3,
                    title: "Fanning the Flame",
                    desc: "Encouraging spiritual renewal and evangelistic momentum.",
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.047 8.287 8.287 0 009 9.601a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18a3.75 3.75 0 00.495-7.468 5.99 5.99 0 00-1.925 3.547 5.975 5.975 0 01-2.133-1.001A3.75 3.75 0 0012 18z" />
                      </svg>
                    ),
                  },
                  {
                    num: 4,
                    title: "Mercy Ministries",
                    desc: "Demonstrating Christ\u2019s love through compassionate action.",
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                      </svg>
                    ),
                  },
                  {
                    num: 5,
                    title: "Strategic Partnerships",
                    desc: "Collaborating with churches, ministries, and networks to accelerate the Great Commission.",
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.56a4.5 4.5 0 00-6.364-6.364L4.5 8.06" />
                      </svg>
                    ),
                  },
                ].map((item) => (
                  <details
                    key={item.num}
                    className="group rounded-xl border border-[#c4c6ce]/60 overflow-hidden transition-all hover:border-[#00b8d4]/40 open:border-[#00b8d4]/50 open:shadow-lg open:shadow-[#00b8d4]/5"
                    open
                  >
                    <summary className="flex justify-between items-center p-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden bg-white group-open:bg-[#f0f3ff] transition-colors">
                      <span className="font-[family-name:var(--font-jakarta)] text-lg text-[#0d223f] flex items-center gap-4">
                        <span className="w-10 h-10 rounded-xl bg-[#00b8d4]/10 text-[#00b8d4] flex items-center justify-center shrink-0 group-open:bg-[#00b8d4] group-open:text-white transition-colors">
                          {item.icon}
                        </span>
                        <span className="font-semibold">{item.title}</span>
                      </span>
                      <svg
                        className="w-5 h-5 text-[#74777e] group-open:text-[#00b8d4] group-open:rotate-180 transition-all shrink-0 ml-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="px-5 pb-5 bg-[#f0f3ff]">
                      <div className="ml-14 pl-0 border-l-2 border-[#00b8d4]/20 pl-4">
                        <p className="text-[#44474d] font-[family-name:var(--font-geist-sans)] text-[15px] leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            </div>
            </ScrollReveal>

            {/* Right side — image */}
            <ScrollReveal direction="right" delay={200}>
            <div className="relative group hidden lg:block">
              <div className="absolute -inset-4 bg-[#b4c7ec]/20 rounded-2xl blur-2xl group-hover:bg-[#00b8d4]/10 transition-all duration-500" />

              <div className="relative rounded-2xl shadow-2xl overflow-hidden border border-[#b4c7ec]/20">
                <img
                  src="/initiatives-collab.webp"
                  alt="Leaders collaborating together"
                  className="w-full h-[620px] object-cover"
                />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(13,34,63,0.9) 20%, rgba(13,34,63,0.4) 100%)" }} />

                {/* CTA overlay */}
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-white/95 backdrop-blur-md p-6 rounded-xl border-l-4 border-[#00b8d4] shadow-lg">
                    <p className="font-[family-name:var(--font-jakarta)] text-[#0d223f] text-lg leading-7 font-semibold">
                      Gather for Vision. Scatter for Harvest. Unite for the Kingdom.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── Upcoming Events ── */}
      {events && events.length > 0 && (
        <section className="py-20 md:py-[120px] bg-[#f9f9ff]">
          <div className="max-w-[1280px] mx-auto px-4 md:px-8">
            <ScrollReveal>
              <div className="text-center mb-16">
                <span className="text-[#00b8d4] text-xs font-semibold font-[family-name:var(--font-geist-sans)] tracking-widest uppercase">
                  Get Involved
                </span>
                <h2 className="font-[family-name:var(--font-jakarta)] text-[28px] md:text-[32px] leading-10 font-semibold text-[#0d223f] mt-2">
                  Upcoming Events
                </h2>
              </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => {
                const hasExternalUrl =
                  event.is_external && !!event.external_url;
                const href = hasExternalUrl
                  ? event.external_url
                  : `/events/${event.slug}`;

                return (
                  <Link
                    key={event.id}
                    href={href}
                    target={hasExternalUrl ? "_blank" : undefined}
                    rel={hasExternalUrl ? "noopener noreferrer" : undefined}
                    className="group bg-white border border-[#c4c6ce] rounded-lg overflow-hidden hover:shadow-xl transition-all"
                  >
                    <div className="h-40 bg-gradient-to-br from-[#0d223f] to-[#000b20] flex items-center justify-center">
                      {event.banner_url ? (
                        <img
                          src={event.banner_url}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-[#00b8d4]/30 text-4xl font-bold font-[family-name:var(--font-jakarta)]">
                          BSH
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="font-[family-name:var(--font-jakarta)] text-xl font-semibold text-[#0d223f] group-hover:text-[#006879] transition-colors mb-2">
                        {event.title}
                      </h3>
                      <p className="font-[family-name:var(--font-geist-sans)] text-sm text-[#44474d]">
                        {event.start_date &&
                          new Date(
                            event.start_date + "T00:00:00"
                          ).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                      </p>
                      {(event.city || event.country) && (
                        <p className="font-[family-name:var(--font-geist-sans)] text-sm text-[#74777e] mt-1">
                          {[event.city, event.country]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="text-center mt-12">
              <Link
                href="/events"
                className="text-[#006879] hover:text-[#00b8d4] font-[family-name:var(--font-geist-sans)] text-sm font-semibold transition-colors inline-flex items-center gap-2"
              >
                View All Events
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Final CTA ── */}
      <section className="py-20 md:py-[120px] bg-[#0d223f] text-white text-center">
        <ScrollReveal direction="none">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <h2 className="font-[family-name:var(--font-jakarta)] text-[28px] md:text-[32px] leading-10 font-semibold text-[#a9edff] mb-4">
            Gather for Vision. Scatter for Harvest. Unite for the Kingdom.
          </h2>
          <p className="font-[family-name:var(--font-jakarta)] text-lg leading-7 text-white/80 mb-12">
            Whether you are a pastor, missionary, ministry leader, church
            member, or believer with a heart for the nations, we invite you to
            join us. Together, let us pray, serve, collaborate, and proclaim
            Christ so that every person has the opportunity to hear the Gospel.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/events"
              className="bg-[#00b8d4] text-white px-12 py-5 rounded-lg text-sm font-semibold font-[family-name:var(--font-geist-sans)] hover:scale-105 transition-all shadow-xl shadow-[#00b8d4]/40 uppercase tracking-widest"
            >
              Join the Movement Now
            </Link>
            <Link
              href="/contact"
              className="bg-white text-[#0d223f] px-12 py-5 rounded-lg text-sm font-semibold font-[family-name:var(--font-geist-sans)] hover:bg-[#dee8ff] transition-all uppercase tracking-widest"
            >
              Partner With Us
            </Link>
          </div>
          <VideoDialogButton
            videoSrc="https://www.youtube.com/embed/EQ6zj85bxEA?autoplay=1"
            title="BSH Theme Song"
            className="inline-flex items-center gap-2 text-[#a9edff] hover:text-white font-[family-name:var(--font-geist-sans)] text-sm font-medium transition-colors mt-8 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            Listen to the BSH Theme Song
          </VideoDialogButton>
        </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
