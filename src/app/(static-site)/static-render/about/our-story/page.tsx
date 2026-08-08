import Link from "next/link";
import { VideoDialogButton } from "../../components/video-dialog";
import { ScrollReveal } from "../../components/scroll-reveal";
import { HeroSlideshow } from "../../components/hero-slideshow";
import { timeline } from "../shared";

export const revalidate = 3600;

export default async function OurStoryPage() {
  return (
    <div className="scroll-smooth">
      {/* ── Hero ── */}
      <header className="relative min-h-[85vh] flex flex-col justify-end overflow-hidden bg-[#0a0a0a]">
        <HeroSlideshow />
        <div
          className="absolute inset-0 z-[1]"
          style={{
            background:
              "linear-gradient(to top, #0a0a0a 2%, rgba(10,10,10,0.7) 35%, rgba(10,10,10,0.15) 70%, transparent 100%)",
          }}
        />

        <div className="relative z-10 max-w-[1360px] mx-auto px-4 md:px-10 w-full pt-[180px] pb-14 flex flex-col gap-7">
          <div className="flex items-center">
            <span className="inline-block bg-[#0a1928]/80 border border-[#1ecdec]/50 rounded-full px-6 py-2.5 font-[family-name:var(--font-geist-mono)] text-[12px] font-medium tracking-[0.2em] uppercase text-[#1ecdec]">
              Our Story
            </span>
          </div>

          <h1
            className="font-[family-name:var(--font-jakarta)] font-[900] text-white uppercase m-0 max-w-[14ch]"
            style={{
              fontSize: "clamp(44px, 7vw, 120px)",
              lineHeight: 0.88,
              letterSpacing: "-0.05em",
              textShadow: "0 4px 40px rgba(10,10,10,0.55)",
            }}
          >
            A Vision Born for Such a{" "}
            <span className="text-[#1ecdec]">Time</span>
          </h1>

          <div className="hidden md:block border-t border-[#1ecdec] pt-7">
            <div className="grid grid-cols-1 md:grid-cols-[1.1fr_auto] gap-8 items-end">
              <p className="font-[family-name:var(--font-jakarta)] text-[15px] leading-[1.7] text-white/90 m-0 max-w-[52ch] text-pretty">
                From its beginning, Billion Soul Harvest has sought to bring Christian leaders
                together across nations, generations, and traditions — serving as a catalyst for
                Kingdom collaboration.
              </p>
              <div className="flex gap-3">
                <Link
                  href="/about/the-bsh-logo"
                  className="bg-[#1ecdec] text-[#0a0a0a] px-8 py-[18px] text-[14px] font-[800] tracking-[0.08em] uppercase font-[family-name:var(--font-jakarta)] hover:bg-white transition-colors"
                >
                  The BSH Logo
                </Link>
                <Link
                  href="/about/global-leaders"
                  className="border-2 border-white/50 text-white px-8 py-[18px] text-[14px] font-[800] tracking-[0.08em] uppercase font-[family-name:var(--font-jakarta)] hover:bg-white hover:text-[#0a0a0a] transition-colors"
                >
                  Global Leaders
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Our Story Content ── */}
      <section id="our-story" className="py-[110px]" style={{ background: "#f5f7fa" }}>
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <div
            className="grid gap-8 md:gap-0 grid-cols-1 md:grid-cols-[260px_1fr]"
            style={{ columnGap: 64 }}
          >
            {/* Sidebar label */}
            <div className="hidden md:block" style={{ paddingTop: 10 }}>
              <span
                className="font-[family-name:var(--font-geist-mono)]"
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "#506b9f",
                }}
              >
                Our Story
              </span>
            </div>

            {/* Main content */}
            <div className="font-[family-name:var(--font-jakarta)] flex flex-col" style={{ maxWidth: "68ch", gap: 28 }}>
              <p style={{ fontSize: 20, lineHeight: 1.62, color: "#3a3f54" }}>
                Billion Soul Harvest was born from a simple yet compelling
                conviction:{" "}
                <strong style={{ color: "#0a0a0a" }}>
                  the greatest harvest in history will require the greatest unity
                  in history.
                </strong>
              </p>
              <p style={{ fontSize: 17, lineHeight: 1.75, color: "#505870" }}>
                No single church, denomination, ministry, or mission organization
                can fulfill the Great Commission alone. But together, through
                prayer, humility, collaboration, and the power of the Holy Spirit,
                the Body of Christ can make an unprecedented impact for the Kingdom
                of God.
              </p>
              <p style={{ fontSize: 17, lineHeight: 1.75, color: "#505870" }}>
                From its beginning, Billion Soul Harvest has sought to bring
                Christian leaders together across nations, generations, and
                traditions&mdash;not to build another organization, but to serve as
                a catalyst for Kingdom collaboration through global gatherings,
                leadership development, ministry partnerships, and strategic
                ministries.
              </p>
              <blockquote
                style={{
                  padding: "34px 36px",
                  background: "#0a0a0a",
                  color: "white",
                  borderRadius: 6,
                }}
              >
                <h3
                  className="font-[family-name:var(--font-jakarta)]"
                  style={{
                    fontWeight: 800,
                    fontSize: "clamp(22px, 2.4vw, 34px)",
                    lineHeight: 1.14,
                    letterSpacing: "-0.03em",
                  }}
                >
                  To unite the Body of Christ and help accelerate the fulfillment
                  of the Great Commission&mdash;one soul, one church, one nation at
                  a time.
                </h3>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* ── Our Journey Timeline ── */}
      <section id="our-journey" className="py-[110px] scroll-mt-20" style={{ background: "#0a0a0a" }}>
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <ScrollReveal direction="none">
            <div className="mb-16">
              <span
                className="font-[family-name:var(--font-geist-mono)]"
                style={{
                  fontSize: 12.5,
                  fontWeight: 500,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "#1ecdec",
                }}
              >
                Our Journey
              </span>
              <h2
                className="font-[family-name:var(--font-jakarta)] text-white mt-4"
                style={{
                  fontSize: "clamp(38px, 5vw, 84px)",
                  lineHeight: 0.88,
                  letterSpacing: "-0.045em",
                  fontWeight: 900,
                }}
              >
                Our Journey
              </h2>
              <div className="mt-6" style={{ borderBottom: "2px solid rgba(255,255,255,0.3)" }} />
            </div>
          </ScrollReveal>

          {/* Timeline */}
          <div className="relative max-w-4xl mx-auto">
            {/* Center line - mobile left, desktop center */}
            <div
              className="absolute left-[19px] md:left-[calc(50%-1px)] top-0 bottom-0"
              style={{ width: 2, background: "rgba(30,205,236,0.55)" }}
            />

            <div className="space-y-8 md:space-y-0">
              {timeline.map((item, i) => (
                <div
                  key={i}
                  className="relative md:grid md:gap-0 md:grid-cols-[1fr_72px_1fr]"
                >
                  {/* Left content (even items) */}
                  <div className={`hidden md:block ${i % 2 === 0 ? "pr-8" : ""}`}>
                    {i % 2 === 0 && (
                      <div className="text-right py-6">
                        <h4
                          className="font-[family-name:var(--font-jakarta)] text-white"
                          style={{
                            fontWeight: 900,
                            fontSize: "clamp(20px, 2vw, 30px)",
                            lineHeight: 1,
                            letterSpacing: "-0.035em",
                            textTransform: "uppercase",
                          }}
                        >
                          {item.label}
                        </h4>
                        <p
                          className="text-white/70 mt-2"
                          style={{ fontSize: 15.5, lineHeight: 1.55 }}
                        >
                          {item.desc}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Center node */}
                  <div className="absolute left-[11px] md:relative md:left-auto flex items-start md:items-center justify-center pt-6 md:pt-0">
                    <div
                      className="rounded-full z-10"
                      style={{
                        width: 17,
                        height: 17,
                        border: "3px solid #1ecdec",
                        background:
                          "highlight" in item && item.highlight
                            ? "#1ecdec"
                            : "#0a0a0a",
                      }}
                    />
                  </div>

                  {/* Right content (odd items) */}
                  <div className={`hidden md:block ${i % 2 !== 0 ? "pl-8" : ""}`}>
                    {i % 2 !== 0 && (
                      <div className="py-6">
                        <h4
                          className="font-[family-name:var(--font-jakarta)] text-white"
                          style={{
                            fontWeight: 900,
                            fontSize: "clamp(20px, 2vw, 30px)",
                            lineHeight: 1,
                            letterSpacing: "-0.035em",
                            textTransform: "uppercase",
                          }}
                        >
                          {item.label}
                        </h4>
                        <p
                          className="text-white/70 mt-2"
                          style={{ fontSize: 15.5, lineHeight: 1.55 }}
                        >
                          {item.desc}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Mobile-only content */}
                  <div className="ml-10 md:hidden py-4">
                    <h4
                      className="font-[family-name:var(--font-jakarta)] text-white"
                      style={{
                        fontWeight: 900,
                        fontSize: "clamp(20px, 2vw, 30px)",
                        lineHeight: 1,
                        letterSpacing: "-0.035em",
                        textTransform: "uppercase",
                      }}
                    >
                      {item.label}
                    </h4>
                    <p
                      className="text-white/70 mt-2"
                      style={{ fontSize: 15.5, lineHeight: 1.55 }}
                    >
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── The Four Greats ── */}
      <section id="vision" className="py-[110px]" style={{ background: "#f5f7fa" }}>
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <ScrollReveal>
            <div className="mb-16">
              <span
                className="font-[family-name:var(--font-geist-mono)]"
                style={{
                  fontSize: 12.5,
                  fontWeight: 500,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "#506b9f",
                }}
              >
                Our Vision
              </span>
              <h2
                className="font-[family-name:var(--font-jakarta)] mt-4"
                style={{
                  fontSize: "clamp(38px, 5vw, 84px)",
                  lineHeight: 0.88,
                  letterSpacing: "-0.045em",
                  fontWeight: 900,
                  color: "#0a0a0a",
                }}
              >
                The Four Greats
              </h2>
              <div className="mt-6" style={{ borderBottom: "2px solid #0a0a0a" }} />
            </div>
          </ScrollReveal>

          <ScrollReveal>
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
            style={{ borderTop: "1px solid rgba(10,10,10,0.16)", borderLeft: "1px solid rgba(10,10,10,0.16)" }}
          >
            {[
              { num: "01", title: "Great Return", desc: "Living with expectancy for Christ\u2019s return.", accent: false },
              { num: "02", title: "Great Harvest", desc: "Reaching the world with the Gospel.", accent: true },
              { num: "03", title: "Great Unity", desc: "Bringing the Body of Christ together.", accent: false },
              { num: "04", title: "Great Breakthrough", desc: "Advancing God\u2019s Kingdom through prayer, faith, and the power of the Holy Spirit.", accent: false },
            ].map((item) => (
              <div
                key={item.num}
                className={`flex flex-col gap-4 p-8 md:p-10 ${item.accent ? "bg-[#0a0a0a] text-white" : "bg-white"}`}
                style={{ borderRight: "1px solid rgba(10,10,10,0.16)", borderBottom: "1px solid rgba(10,10,10,0.16)" }}
              >
                <span
                  className="font-[family-name:var(--font-geist-mono)]"
                  style={{
                    fontSize: 11.5,
                    fontWeight: 500,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: item.accent ? "#1ecdec" : "#506b9f",
                  }}
                >
                  {item.num}
                </span>
                <h3
                  className="font-[family-name:var(--font-jakarta)]"
                  style={{
                    fontWeight: 900,
                    fontSize: "clamp(24px, 2.6vw, 32px)",
                    lineHeight: 0.94,
                    letterSpacing: "-0.04em",
                    color: item.accent ? "white" : "#0a0a0a",
                  }}
                >
                  {item.title}
                </h3>
                <p
                  className="font-[family-name:var(--font-jakarta)]"
                  style={{ fontSize: 16, lineHeight: 1.65, color: item.accent ? "rgba(255,255,255,0.75)" : "#505870" }}
                >
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Win, Build, Multiply ── */}
      <section id="mission" className="py-[110px]" style={{ background: "#0a0a0a" }}>
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <ScrollReveal>
            <div className="mb-16">
              <span
                className="font-[family-name:var(--font-geist-mono)]"
                style={{
                  fontSize: 12.5,
                  fontWeight: 500,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "#1ecdec",
                }}
              >
                Our Mission
              </span>
              <h2
                className="font-[family-name:var(--font-jakarta)] text-white mt-4"
                style={{
                  fontSize: "clamp(38px, 5vw, 84px)",
                  lineHeight: 0.88,
                  letterSpacing: "-0.045em",
                  fontWeight: 900,
                }}
              >
                Win, Build, Multiply
              </h2>
              <div className="mt-6" style={{ borderBottom: "2px solid rgba(255,255,255,0.3)" }} />
            </div>
          </ScrollReveal>

          <div
            className="grid grid-cols-1"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 1,
              background: "rgba(255,255,255,0.22)",
              border: "1px solid rgba(255,255,255,0.22)",
            }}
          >
            <ScrollReveal delay={0}>
            <div style={{ background: "#0a0a0a", padding: "40px 32px 46px", minHeight: 300 }} className="h-full flex flex-col">
              <span
                className="font-[family-name:var(--font-geist-mono)]"
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "#1ecdec",
                  display: "block",
                  marginBottom: 16,
                }}
              >
                01
              </span>
              <h3
                className="font-[family-name:var(--font-jakarta)] text-white mb-5"
                style={{
                  fontWeight: 900,
                  fontSize: "clamp(34px, 3.4vw, 52px)",
                  lineHeight: 0.92,
                  letterSpacing: "-0.045em",
                }}
              >
                Win
              </h3>
              <p className="font-[family-name:var(--font-jakarta)]" style={{ fontSize: 16, lineHeight: 1.65, color: "rgba(255,255,255,0.85)" }}>
                Win people to Christ so that every person has the opportunity to know Jesus.
              </p>
            </div>
            </ScrollReveal>

            <ScrollReveal delay={100}>
            <div style={{ background: "#0a0a0a", padding: "40px 32px 46px", minHeight: 300 }} className="h-full flex flex-col">
              <span
                className="font-[family-name:var(--font-geist-mono)]"
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "#1ecdec",
                  display: "block",
                  marginBottom: 16,
                }}
              >
                02
              </span>
              <h3
                className="font-[family-name:var(--font-jakarta)] text-white mb-5"
                style={{
                  fontWeight: 900,
                  fontSize: "clamp(34px, 3.4vw, 52px)",
                  lineHeight: 0.92,
                  letterSpacing: "-0.045em",
                }}
              >
                Build
              </h3>
              <p className="font-[family-name:var(--font-jakarta)]" style={{ fontSize: 16, lineHeight: 1.65, color: "rgba(255,255,255,0.85)" }}>
                Build believers up in their faith, equipping them to grow in Christ and become faithful followers.
              </p>
            </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
            <div style={{ background: "#0a0a0a", padding: "40px 32px 46px", minHeight: 300 }} className="h-full flex flex-col">
              <span
                className="font-[family-name:var(--font-geist-mono)]"
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "#1ecdec",
                  display: "block",
                  marginBottom: 16,
                }}
              >
                03
              </span>
              <h3
                className="font-[family-name:var(--font-jakarta)] text-white mb-5"
                style={{
                  fontWeight: 900,
                  fontSize: "clamp(34px, 3.4vw, 52px)",
                  lineHeight: 0.92,
                  letterSpacing: "-0.045em",
                }}
              >
                Multiply
              </h3>
              <p className="font-[family-name:var(--font-jakarta)]" style={{ fontSize: 16, lineHeight: 1.65, color: "rgba(255,255,255,0.85)" }}>
                Develop leaders, plant ministries, strengthen churches, and reproduce disciple-makers who will impact future generations.
              </p>
            </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── Global Initiatives ── */}
      <section id="initiatives" className="py-[110px]" style={{ background: "#f5f7fa", color: "#0a0a0a" }}>
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <div
            className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] items-start gap-10 lg:gap-[72px]"
          >
            <ScrollReveal direction="left">
            <div>
              <span
                className="font-[family-name:var(--font-geist-mono)]"
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "#506b9f",
                }}
              >
                The Implementation
              </span>
              <h2
                className="font-[family-name:var(--font-jakarta)] mt-3 mb-4"
                style={{
                  fontSize: "clamp(38px, 5vw, 84px)",
                  lineHeight: 0.88,
                  letterSpacing: "-0.045em",
                  fontWeight: 900,
                  color: "#0a0a0a",
                }}
              >
                Global Initiatives
              </h2>
              <p
                className="font-[family-name:var(--font-jakarta)] mb-10 max-w-lg"
                style={{ fontSize: 17, lineHeight: 1.7, color: "#505870" }}
              >
                Through strategic global gatherings, leadership development,
                collaborative partnerships, and compassionate outreach, we seek
                to serve as a catalyst for a worldwide movement that prepares
                the Church for the greatest harvest in history.
              </p>

              <div>
                {[
                  { num: 1, title: "Harvest Summits", desc: "Gathering and mobilizing leaders.", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A8.966 8.966 0 013 12c0-1.777.514-3.434 1.401-4.832" /></svg> },
                  { num: 2, title: "International Leadership Institute", desc: "Equipping leaders for lasting Kingdom impact.", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" /></svg> },
                  { num: 3, title: "Fanning the Flame", desc: "Encouraging spiritual renewal and evangelistic momentum.", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.047 8.287 8.287 0 009 9.601a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18a3.75 3.75 0 00.495-7.468 5.99 5.99 0 00-1.925 3.547 5.975 5.975 0 01-2.133-1.001A3.75 3.75 0 0012 18z" /></svg> },
                  { num: 4, title: "Billion Soul Care", desc: "Demonstrating Christ\u2019s love through compassionate action.", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg> },
                  { num: 5, title: "Strategic Partnerships", desc: "Collaborating with churches, ministries, and networks to accelerate the Great Commission.", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.56a4.5 4.5 0 00-6.364-6.364L4.5 8.06" /></svg> },
                ].map((item) => (
                  <details
                    key={item.num}
                    className="group overflow-hidden"
                    style={{ borderTop: "2px solid #0a0a0a" }}
                    open
                  >
                    <summary
                      className="flex justify-between items-center cursor-pointer list-none [&::-webkit-details-marker]:hidden"
                      style={{ padding: "22px 16px" }}
                    >
                      <span className="font-[family-name:var(--font-jakarta)] flex items-center gap-4">
                        <span className="w-10 h-10 rounded-xl bg-[#0a0a0a]/8 text-[#0a0a0a] flex items-center justify-center shrink-0 group-open:bg-[#0a0a0a] group-open:text-white transition-colors">
                          {item.icon}
                        </span>
                        <span
                          style={{
                            fontWeight: 900,
                            fontSize: "clamp(19px, 1.9vw, 26px)",
                            letterSpacing: "-0.02em",
                            color: "#0a0a0a",
                          }}
                        >
                          {item.title}
                        </span>
                      </span>
                      <svg className="w-5 h-5 text-[#74777e] group-open:text-[#0a0a0a] group-open:rotate-180 transition-all shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="px-5 pb-5">
                      <div className="ml-14 pl-4 border-l-2 border-[#0a0a0a]/15">
                        <p className="font-[family-name:var(--font-jakarta)]" style={{ fontSize: 15, lineHeight: 1.6, color: "#505870" }}>
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
              <div className="relative rounded-md overflow-hidden" style={{ border: "2px solid #0a0a0a" }}>
                <img src="/global-initiatives.jpg" alt="Global Harvest Summit leaders gathered" className="w-full h-[620px] object-cover" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(10,10,10,0.7) 0%, transparent 40%)" }} />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-white p-6" style={{ borderLeft: "4px solid #1ecdec" }}>
                    <p className="font-[family-name:var(--font-jakarta)] text-lg leading-7 font-[900]" style={{ color: "#0a0a0a" }}>
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
      <section className="py-[130px] text-center" style={{ background: "#1ecdec", color: "#0a0a0a" }}>
        <ScrollReveal direction="none">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <div
            className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] items-center text-left gap-10 lg:gap-[72px]"
          >
            <div>
              <h2
                className="font-[family-name:var(--font-jakarta)]"
                style={{
                  fontWeight: 900,
                  fontSize: "clamp(42px, 5.6vw, 96px)",
                  lineHeight: 0.86,
                  letterSpacing: "-0.05em",
                  color: "#0a0a0a",
                }}
              >
                Gather for Vision. Scatter for Harvest. Unite for the Kingdom.
              </h2>
            </div>
            <div>
              <p className="font-[family-name:var(--font-jakarta)] text-lg leading-7 mb-10" style={{ color: "rgba(10,10,10,0.75)" }}>
                Whether you are a pastor, missionary, ministry leader, church
                member, or believer with a heart for the nations, we invite you to
                join us. Together, let us pray, serve, collaborate, and proclaim
                Christ so that every person has the opportunity to hear the Gospel.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/gatherings"
                  className="font-[family-name:var(--font-jakarta)] text-white text-center uppercase"
                  style={{
                    background: "#0a0a0a",
                    padding: "18px 32px",
                    fontSize: 14,
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                  }}
                >
                  Join the Movement Now
                </Link>
                <Link
                  href="/connect"
                  className="font-[family-name:var(--font-jakarta)] text-center uppercase"
                  style={{
                    border: "2px solid #0a0a0a",
                    color: "#0a0a0a",
                    padding: "18px 32px",
                    fontSize: 14,
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                  }}
                >
                  Partner With Us
                </Link>
              </div>
              <VideoDialogButton
                videoSrc="https://www.youtube.com/embed/EQ6zj85bxEA?autoplay=1"
                title="BSH Theme Song"
                className="inline-flex items-center gap-2 font-[family-name:var(--font-jakarta)] text-sm font-medium transition-colors mt-8 cursor-pointer text-[#0a0a0a] hover:text-[#0a0a0a]/70"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                Listen to the BSH Theme Song
              </VideoDialogButton>
            </div>
          </div>
        </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
