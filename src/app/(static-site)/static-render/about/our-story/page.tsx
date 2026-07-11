import Link from "next/link";
import { VideoDialogButton } from "../../components/video-dialog";
import { ScrollReveal } from "../../components/scroll-reveal";
import { timeline } from "../shared";

export const revalidate = 3600;

export default async function OurStoryPage() {
  return (
    <div className="scroll-smooth">
      {/* ── Hero ── */}
      <header className="relative min-h-[400px] md:min-h-[500px] flex items-center overflow-hidden">
        <img
          src="/initiatives-collab.webp"
          alt="Billion Soul Harvest gathering"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0 z-[1]"
          style={{
            background:
              "linear-gradient(to bottom, rgba(13,34,63,0.45), rgba(13,34,63,0.85))",
          }}
        />
        <div className="relative z-10 max-w-[1280px] mx-auto px-4 md:px-8 w-full" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>
          <div className="max-w-2xl">
            <span className="inline-block bg-[#65e2fe] text-[#006373] px-4 py-1 rounded-lg text-xs font-semibold font-[family-name:var(--font-geist-sans)] mb-6 uppercase tracking-wider">
              Our Story
            </span>
            <h1 className="font-[family-name:var(--font-jakarta)] text-4xl md:text-[48px] md:leading-[56px] font-bold text-white mb-6 tracking-[-0.02em]">
              A Vision Born for Such a Time as This
            </h1>
            <p className="font-[family-name:var(--font-jakarta)] text-lg leading-7 text-white/90">
              From its beginning, Billion Soul Harvest has sought to bring Christian leaders
              together across nations, generations, and traditions — serving as a catalyst for
              Kingdom collaboration.
            </p>
          </div>
        </div>
      </header>

      {/* ── Our Story Content ── */}
      <section id="our-story" className="py-20 md:py-[100px] bg-white">
        <div className="max-w-[800px] mx-auto px-4 md:px-8">
          <div className="space-y-6 font-[family-name:var(--font-jakarta)] text-[17px] leading-8 text-[#2a3a50]">
            <p>
              Billion Soul Harvest was born from a simple yet compelling
              conviction:{" "}
              <strong className="text-[#0d223f]">
                the greatest harvest in history will require the greatest unity
                in history.
              </strong>
            </p>
            <p>
              No single church, denomination, ministry, or mission organization
              can fulfill the Great Commission alone. But together, through
              prayer, humility, collaboration, and the power of the Holy Spirit,
              the Body of Christ can make an unprecedented impact for the Kingdom
              of God.
            </p>
            <p>
              From its beginning, Billion Soul Harvest has sought to bring
              Christian leaders together across nations, generations, and
              traditions&mdash;not to build another organization, but to serve as
              a catalyst for Kingdom collaboration through global gatherings,
              leadership development, ministry partnerships, and strategic
              ministries.
            </p>
            <blockquote className="border-l-4 border-[#00b8d4] pl-6 py-2 my-8 bg-[#e7f9fc] rounded-r-lg">
              <p className="font-[family-name:var(--font-jakarta)] text-xl md:text-2xl leading-9 font-semibold text-[#0d223f]">
                To unite the Body of Christ and help accelerate the fulfillment
                of the Great Commission&mdash;one soul, one church, one nation at
                a time.
              </p>
            </blockquote>
          </div>
        </div>
      </section>

      {/* ── Our Journey Timeline ── */}
      <section id="our-journey" className="py-20 md:py-[100px] bg-[#0d223f] relative overflow-hidden scroll-mt-20">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#00b8d4]/5 rounded-full blur-[160px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#a9edff]/5 rounded-full blur-[100px]" />

        <div className="max-w-[1280px] mx-auto px-4 md:px-8 relative z-10">
          <ScrollReveal direction="none">
            <div className="text-center mb-16">
              <span className="text-[#a9edff] text-xs font-semibold font-[family-name:var(--font-geist-sans)] uppercase tracking-widest">
                Our Journey
              </span>
              <h2 className="font-[family-name:var(--font-jakarta)] text-3xl md:text-[40px] md:leading-[48px] font-bold text-white mt-4 tracking-[-0.02em]">
                Our Journey
              </h2>
            </div>
          </ScrollReveal>

          <div className="relative max-w-3xl mx-auto">
            <div className="absolute left-[19px] md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#00b8d4] via-[#a9edff]/40 to-[#00b8d4]" />
            <div className="absolute left-[17px] md:left-[calc(50%-2px)] top-0 bottom-0 w-[5px] bg-gradient-to-b from-[#00b8d4]/20 via-[#a9edff]/10 to-[#00b8d4]/20 blur-sm" />

            <div className="space-y-8 md:space-y-12">
              {timeline.map((item, i) => (
                <div
                  key={i}
                  className={`relative flex items-start gap-6 md:gap-0 ${
                    i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  <div
                    className={`absolute left-[12px] md:left-1/2 md:-translate-x-1/2 top-1 z-10 w-[16px] h-[16px] rounded-full border-[3px] transition-all ${
                      "highlight" in item && item.highlight
                        ? "bg-[#00b8d4] border-[#00b8d4] shadow-lg shadow-[#00b8d4]/50"
                        : "bg-[#0d223f] border-[#00b8d4]/70"
                    }`}
                  />
                  <div className="ml-10 md:ml-0 md:w-[calc(50%-32px)]">
                    <div
                      className={`p-5 rounded-xl border backdrop-blur-sm transition-all duration-300 ${
                        "highlight" in item && item.highlight
                          ? "bg-[#00b8d4]/20 border-[#00b8d4]/50 shadow-lg shadow-[#00b8d4]/10"
                          : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-[#a9edff]/30"
                      }`}
                    >
                      <h4
                        className={`font-[family-name:var(--font-jakarta)] text-base font-bold ${
                          "highlight" in item && item.highlight ? "text-[#a9edff]" : "text-white"
                        }`}
                      >
                        {item.label}
                      </h4>
                      <p
                        className={`font-[family-name:var(--font-jakarta)] text-sm mt-1 ${
                          "highlight" in item && item.highlight ? "text-white/90" : "text-white/60"
                        }`}
                      >
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── The Four Greats ── */}
      <section id="vision" className="py-20 md:py-[120px] bg-[#f0f3ff]">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <ScrollReveal>
            <div className="mb-16">
              <h2 className="font-[family-name:var(--font-jakarta)] text-[28px] md:text-[32px] leading-10 font-semibold text-[#0d223f]">
                The Four Greats
              </h2>
            </div>
          </ScrollReveal>

          <ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-6">
            <div className="md:col-span-2 md:row-span-1 bg-white/70 backdrop-blur-sm border border-[#b4c7ec]/30 p-8 rounded-lg">
              <svg className="w-10 h-10 text-[#00b8d4] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
              </svg>
              <h3 className="font-[family-name:var(--font-jakarta)] text-2xl font-semibold text-[#0d223f] mb-2">Great Return</h3>
              <p className="font-[family-name:var(--font-geist-sans)] text-base text-[#44474d]">Living with expectancy for Christ&apos;s return.</p>
            </div>

            <div className="md:col-span-2 md:row-span-2 bg-[#0d223f] text-white p-8 rounded-lg flex flex-col justify-end relative overflow-hidden" style={{ backgroundImage: "linear-gradient(to top, rgba(13,34,63,0.9) 20%, rgba(13,34,63,0.4) 100%), url('/great-harvest-bg.webp')", backgroundSize: "cover", backgroundPosition: "center" }}>
              <svg className="w-12 h-12 text-[#a9edff] mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
              </svg>
              <h3 className="font-[family-name:var(--font-jakarta)] text-[28px] md:text-[32px] leading-10 font-semibold mb-4">Great Harvest</h3>
              <p className="font-[family-name:var(--font-jakarta)] text-lg leading-7 text-white/80 max-w-md">Reaching the world with the Gospel.</p>
              <Link href="/gatherings" className="mt-8 inline-flex items-center gap-2 text-[#a9edff] text-sm font-semibold font-[family-name:var(--font-geist-sans)] hover:underline">
                LEARN MORE
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            <div className="md:col-span-1 md:row-span-1 bg-white/70 backdrop-blur-sm border border-[#b4c7ec]/30 p-8 rounded-lg border-l-4 border-l-[#b4c7ec]">
              <svg className="w-10 h-10 text-[#b4c7ec] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
              </svg>
              <h3 className="font-[family-name:var(--font-jakarta)] text-2xl font-semibold text-[#0d223f] mb-2">Great Unity</h3>
              <p className="font-[family-name:var(--font-geist-sans)] text-base text-[#44474d]">Bringing the Body of Christ together.</p>
            </div>

            <div className="md:col-span-1 md:row-span-1 bg-white/70 backdrop-blur-sm border border-[#b4c7ec]/30 p-8 rounded-lg border-l-4 border-l-[#006879]">
              <svg className="w-10 h-10 text-[#006879] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
              <h3 className="font-[family-name:var(--font-jakarta)] text-2xl font-semibold text-[#0d223f] mb-2">Great Breakthrough</h3>
              <p className="font-[family-name:var(--font-geist-sans)] text-base text-[#44474d]">
                Advancing God&apos;s Kingdom through prayer, faith, and the power of the Holy Spirit.
              </p>
            </div>
          </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Win, Build, Multiply ── */}
      <section id="mission" className="py-20 md:py-[120px] bg-[#f9f9ff]">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="font-[family-name:var(--font-jakarta)] text-[28px] md:text-[32px] leading-10 font-semibold text-[#000b20]">
                Win, Build, Multiply
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ScrollReveal delay={0}>
            <div className="bg-white p-10 rounded-lg shadow-sm hover:shadow-xl transition-all border-b-4 border-[#00b8d4] group h-full">
              <div className="w-16 h-16 bg-[#00b8d4]/10 rounded-lg flex items-center justify-center mb-8 group-hover:bg-[#00b8d4] transition-colors">
                <svg className="w-8 h-8 text-[#00b8d4] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A8.966 8.966 0 013 12c0-1.777.514-3.434 1.401-4.832" />
                </svg>
              </div>
              <h3 className="font-[family-name:var(--font-jakarta)] text-2xl font-semibold text-[#0d223f] mb-4">Win</h3>
              <p className="font-[family-name:var(--font-geist-sans)] text-base leading-relaxed text-[#44474d]">
                Win people to Christ so that every person has the opportunity to know Jesus.
              </p>
            </div>
            </ScrollReveal>

            <ScrollReveal delay={100}>
            <div className="bg-white p-10 rounded-lg shadow-sm hover:shadow-xl transition-all border-b-4 border-[#000b20] group h-full">
              <div className="w-16 h-16 bg-[#000b20]/10 rounded-lg flex items-center justify-center mb-8 group-hover:bg-[#000b20] transition-colors">
                <svg className="w-8 h-8 text-[#000b20] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
              <h3 className="font-[family-name:var(--font-jakarta)] text-2xl font-semibold text-[#0d223f] mb-4">Build</h3>
              <p className="font-[family-name:var(--font-geist-sans)] text-base leading-relaxed text-[#44474d]">
                Build believers up in their faith, equipping them to grow in Christ and become faithful followers.
              </p>
            </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
            <div className="bg-white p-10 rounded-lg shadow-sm hover:shadow-xl transition-all border-b-4 border-[#58d6f2] group h-full">
              <div className="w-16 h-16 bg-[#58d6f2]/10 rounded-lg flex items-center justify-center mb-8 group-hover:bg-[#58d6f2] transition-colors">
                <svg className="w-8 h-8 text-[#58d6f2] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                </svg>
              </div>
              <h3 className="font-[family-name:var(--font-jakarta)] text-2xl font-semibold text-[#0d223f] mb-4">Multiply</h3>
              <p className="font-[family-name:var(--font-geist-sans)] text-base leading-relaxed text-[#44474d]">
                Develop leaders, plant ministries, strengthen churches, and reproduce disciple-makers who will impact future generations.
              </p>
            </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── Global Initiatives ── */}
      <section id="initiatives" className="py-20 md:py-[120px] bg-white">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <ScrollReveal direction="left">
            <div>
              <span className="text-[#00b8d4] text-xs font-semibold font-[family-name:var(--font-geist-sans)] uppercase tracking-widest">
                The Implementation
              </span>
              <h2 className="font-[family-name:var(--font-jakarta)] text-[28px] md:text-[32px] leading-10 font-semibold text-[#0d223f] mt-2 mb-4">
                Global Initiatives
              </h2>
              <p className="font-[family-name:var(--font-geist-sans)] text-base text-[#44474d] mb-8 max-w-lg">
                Through strategic global gatherings, leadership development,
                collaborative partnerships, and compassionate outreach, we seek
                to serve as a catalyst for a worldwide movement that prepares
                the Church for the greatest harvest in history.
              </p>

              <div className="space-y-3">
                {[
                  { num: 1, title: "Harvest Summits", desc: "Gathering and mobilizing leaders.", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A8.966 8.966 0 013 12c0-1.777.514-3.434 1.401-4.832" /></svg> },
                  { num: 2, title: "International Leadership Institute", desc: "Equipping leaders for lasting Kingdom impact.", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" /></svg> },
                  { num: 3, title: "Fanning the Flame", desc: "Encouraging spiritual renewal and evangelistic momentum.", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.047 8.287 8.287 0 009 9.601a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18a3.75 3.75 0 00.495-7.468 5.99 5.99 0 00-1.925 3.547 5.975 5.975 0 01-2.133-1.001A3.75 3.75 0 0012 18z" /></svg> },
                  { num: 4, title: "Billion Soul Care", desc: "Demonstrating Christ\u2019s love through compassionate action.", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg> },
                  { num: 5, title: "Strategic Partnerships", desc: "Collaborating with churches, ministries, and networks to accelerate the Great Commission.", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.56a4.5 4.5 0 00-6.364-6.364L4.5 8.06" /></svg> },
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
                      <svg className="w-5 h-5 text-[#74777e] group-open:text-[#00b8d4] group-open:rotate-180 transition-all shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

            <ScrollReveal direction="right" delay={200}>
            <div className="relative group hidden lg:block">
              <div className="absolute -inset-4 bg-[#b4c7ec]/20 rounded-2xl blur-2xl group-hover:bg-[#00b8d4]/10 transition-all duration-500" />
              <div className="relative rounded-2xl shadow-2xl overflow-hidden border border-[#b4c7ec]/20">
                <img src="/initiatives-collab.webp" alt="Leaders collaborating together" className="w-full h-[620px] object-cover" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(13,34,63,0.9) 20%, rgba(13,34,63,0.4) 100%)" }} />
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
              href="/gatherings"
              className="bg-[#00b8d4] text-white px-12 py-5 rounded-lg text-sm font-semibold font-[family-name:var(--font-geist-sans)] hover:scale-105 transition-all shadow-xl shadow-[#00b8d4]/40 uppercase tracking-widest"
            >
              Join the Movement Now
            </Link>
            <Link
              href="/connect"
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
