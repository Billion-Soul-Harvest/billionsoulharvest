import Link from "next/link";
import { ScrollReveal } from "../components/scroll-reveal";
import { HeroSlideshow } from "../components/hero-slideshow";

export const revalidate = 3600;

export default async function AboutPage() {
  return (
    <div className="scroll-smooth">
      {/* ── 1. Hero Section ── */}
      <header
        id="about"
        className="relative min-h-[700px] lg:min-h-[800px] flex items-center overflow-hidden"
      >
        <HeroSlideshow />
        <div
          className="absolute inset-0 z-[1]"
          style={{
            background:
              "linear-gradient(to bottom, rgba(13,34,63,0.45), rgba(13,34,63,0.8))",
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
                href="/gatherings"
                className="bg-[#00b8d4] text-white px-10 py-4 rounded-lg text-sm font-semibold font-[family-name:var(--font-geist-sans)] hover:bg-[#006879] transition-all inline-flex items-center gap-2"
              >
                Join the Movement
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="https://www.youtube.com/@ghs2033"
                target="_blank"
                rel="noopener noreferrer"
                className="border-2 border-white text-white px-10 py-4 rounded-lg text-sm font-semibold font-[family-name:var(--font-geist-sans)] hover:bg-white/10 transition-all"
              >
                Watch Our Story
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ── Mission & Vision ── */}
      <section className="py-20 md:py-[100px] bg-[#f0f3ff]">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16">
            <ScrollReveal>
              <div>
                <span className="text-[#00b8d4] text-xs font-semibold font-[family-name:var(--font-geist-sans)] uppercase tracking-widest">
                  Our Mission
                </span>
                <h2 className="font-[family-name:var(--font-jakarta)] text-3xl md:text-[40px] md:leading-[48px] font-bold text-[#0d223f] mt-4 tracking-[-0.02em]">
                  Our Mission
                </h2>
                <p className="font-[family-name:var(--font-jakarta)] text-lg leading-8 text-[#44474d] mt-6">
                  To unite and mobilize the global Church for evangelism, discipleship,
                  prayer, and kingdom collaboration toward a Billion Soul Harvest by 2033.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={100}>
              <div>
                <span className="text-[#00b8d4] text-xs font-semibold font-[family-name:var(--font-geist-sans)] uppercase tracking-widest">
                  Our Vision
                </span>
                <h2 className="font-[family-name:var(--font-jakarta)] text-3xl md:text-[40px] md:leading-[48px] font-bold text-[#0d223f] mt-4 tracking-[-0.02em]">
                  Every Single Soul Matters.
                </h2>
                <p className="font-[family-name:var(--font-jakarta)] text-lg leading-8 text-[#44474d] mt-6">
                  To see every nation equipped, every believer mobilized, and every
                  community reached with the Gospel.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── What We Do ── */}
      <section className="py-20 md:py-[100px] bg-white">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="font-[family-name:var(--font-jakarta)] text-3xl md:text-[40px] md:leading-[48px] font-bold text-[#0d223f] tracking-[-0.02em]">
                What We Do
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Unite the Church",
                desc: "Building relationships across denominations, ministries, and nations.",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                ),
              },
              {
                title: "Equip Leaders",
                desc: "Training pastors and leaders through the BSH International Leadership Institute.",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                  </svg>
                ),
              },
              {
                title: "Mobilize Prayer",
                desc: "Calling believers to strategic prayer for revival and harvest.",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                ),
              },
              {
                title: "Accelerate Disciple Making",
                desc: "Helping churches multiply disciples and disciple-makers.",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
                  </svg>
                ),
              },
              {
                title: "Catalyze Global Collaboration",
                desc: "Connecting ministries to accomplish more together than any one organization could alone.",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A8.966 8.966 0 013 12c0-1.264.26-2.466.727-3.559" />
                  </svg>
                ),
              },
            ].map((card, i) => (
              <ScrollReveal key={card.title} delay={i * 80}>
                <div className="bg-[#f9f9ff] rounded-2xl border border-[#b4c7ec]/30 p-8 hover:shadow-lg hover:border-[#00b8d4]/30 hover:scale-105 transition-all duration-300 h-full">
                  <div className="w-12 h-12 rounded-xl bg-[#e7f8ff] flex items-center justify-center text-[#00b8d4] mb-5">
                    {card.icon}
                  </div>
                  <h3 className="font-[family-name:var(--font-jakarta)] text-lg font-bold text-[#0d223f] mb-3">
                    {card.title}
                  </h3>
                  <p className="font-[family-name:var(--font-jakarta)] text-sm leading-6 text-[#44474d]">
                    {card.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
