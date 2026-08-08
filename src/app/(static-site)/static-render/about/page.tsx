import Link from "next/link";
import { ScrollReveal } from "../components/scroll-reveal";
import { HeroSlideshow } from "../components/hero-slideshow";

export const revalidate = 3600;

export default async function AboutPage() {
  return (
    <div className="scroll-smooth">
      {/* ── Hero ── */}
      <header
        id="about"
        className="relative min-h-screen md:min-h-[85vh] flex flex-col justify-end overflow-hidden bg-[#0a0a0a]"
      >
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
              Established for 2033
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
            What is Billion Soul{" "}
            <span className="text-[#1ecdec]">Harvest?</span>
          </h1>

          <div className="hidden md:block border-t border-[#1ecdec] pt-7">
            <div className="grid grid-cols-1 md:grid-cols-[1.1fr_auto] gap-8 items-end">
              <p className="font-[family-name:var(--font-jakarta)] text-[15px] leading-[1.7] text-white/90 m-0 max-w-[52ch] text-pretty">
                <strong>Billion Soul Harvest (BSH)</strong> is a global movement
                uniting churches, ministries, mission organizations, and
                Christian leaders around a shared vision:{" "}
                <strong>
                  to help catalyze the greatest harvest of souls in history as
                  we approach the year 2033
                </strong>{" "}
                — the 2,000th anniversary of the death, resurrection, and the
                birth of the Church.
              </p>
              <div className="flex gap-3">
                <Link
                  href="/gatherings"
                  className="bg-[#1ecdec] text-[#0a0a0a] px-8 py-[18px] text-[14px] font-[800] tracking-[0.08em] uppercase font-[family-name:var(--font-jakarta)] hover:bg-white transition-colors"
                >
                  Join the Movement
                </Link>
                <Link
                  href="https://www.youtube.com/@ghs2033"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-2 border-white/50 text-white px-8 py-[18px] text-[14px] font-[800] tracking-[0.08em] uppercase font-[family-name:var(--font-jakarta)] hover:bg-white hover:text-[#0a0a0a] transition-colors"
                >
                  Watch Our Story
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Mission & Vision ── */}
      <section className="py-20 md:py-[100px] bg-[#e8ecf1]">
        <div className="max-w-[1360px] mx-auto px-4 md:px-10">
          <ScrollReveal>
            <div className="grid md:grid-cols-2 border border-[#0a0a0a]">
              <div className="bg-white p-10 md:p-14 flex flex-col gap-5">
                <p className="font-[family-name:var(--font-geist-mono)] text-[11px] font-medium tracking-[0.2em] uppercase text-[#1ecdec] m-0">
                  Our Mission
                </p>
                <h2
                  className="font-[family-name:var(--font-jakarta)] font-[900] text-[#0a0a0a] uppercase m-0"
                  style={{
                    fontSize: "clamp(28px, 3.5vw, 48px)",
                    lineHeight: 0.92,
                    letterSpacing: "-0.04em",
                  }}
                >
                  Our Mission
                </h2>
                <p className="font-[family-name:var(--font-jakarta)] text-[16px] leading-[1.7] text-[#444] m-0 text-pretty">
                  To unite and mobilize the global Church for evangelism,
                  discipleship, prayer, and kingdom collaboration toward a
                  Billion Soul Harvest by 2033.
                </p>
              </div>
              <div className="bg-[#0d1b2a] p-10 md:p-14 flex flex-col gap-5">
                <p className="font-[family-name:var(--font-geist-mono)] text-[11px] font-medium tracking-[0.2em] uppercase text-[#1ecdec] m-0">
                  Our Vision
                </p>
                <h2
                  className="font-[family-name:var(--font-jakarta)] font-[900] text-white uppercase m-0"
                  style={{
                    fontSize: "clamp(28px, 3.5vw, 48px)",
                    lineHeight: 0.92,
                    letterSpacing: "-0.04em",
                  }}
                >
                  Every Single Soul Matters.
                </h2>
                <p className="font-[family-name:var(--font-jakarta)] text-[16px] leading-[1.7] text-white/80 m-0 text-pretty">
                  To see every nation equipped, every believer mobilized, and
                  every community reached with the Gospel.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── What We Do ── */}
      <section className="py-20 md:py-[110px] bg-[#0d1520]">
        <div className="max-w-[1360px] mx-auto px-4 md:px-10">
          <ScrollReveal>
            <div className="mb-4">
              <h2
                className="font-[family-name:var(--font-jakarta)] font-[900] text-white uppercase m-0"
                style={{
                  fontSize: "clamp(36px, 4.8vw, 80px)",
                  lineHeight: 0.88,
                  letterSpacing: "-0.045em",
                }}
              >
                What We Do
              </h2>
              <div className="h-0.5 bg-[#1ecdec] mt-6" />
              <p className="font-[family-name:var(--font-geist-mono)] text-[12.5px] font-medium tracking-[0.16em] uppercase text-[#1ecdec] m-0 mt-4 text-right">
                Five Ways We Work
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <div className="border border-white/15 grid grid-cols-2 md:grid-cols-4 mt-8">
              {[
                {
                  title: "Unite the Church",
                  desc: "Building relationships across denominations, ministries, and nations.",
                },
                {
                  title: "Equip Leaders",
                  desc: "Training pastors and leaders through the BSH International Leadership Institute.",
                },
                {
                  title: "Mobilize Prayer",
                  desc: "Calling believers to strategic prayer for revival and harvest.",
                },
                {
                  title: "Accelerate Disciple Making",
                  desc: "Helping churches multiply disciples and disciple-makers.",
                },
              ].map((card, i) => (
                <div
                  key={card.title}
                  className={`bg-[#111b27] p-7 flex flex-col gap-4 ${
                    i < 3 ? "border-r border-white/15" : ""
                  }`}
                >
                  <p className="font-[family-name:var(--font-geist-mono)] text-[11px] font-medium tracking-[0.2em] uppercase text-[#1ecdec] m-0">
                    0{i + 1}
                  </p>
                  <h3
                    className="font-[family-name:var(--font-jakarta)] font-[800] text-white uppercase m-0 border-b border-white/20 pb-3"
                    style={{
                      fontSize: "clamp(18px, 1.8vw, 24px)",
                      lineHeight: 1.05,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {card.title}
                  </h3>
                  <p className="font-[family-name:var(--font-jakarta)] text-[14px] leading-[1.65] text-white/70 m-0">
                    {card.desc}
                  </p>
                </div>
              ))}
            </div>
            {/* Bottom row: 5th card + grey fill */}
            <div className="border border-t-0 border-white/15 grid grid-cols-2 md:grid-cols-4">
              <div className="bg-[#111b27] p-7 flex flex-col gap-4 border-r border-white/15">
                <p className="font-[family-name:var(--font-geist-mono)] text-[11px] font-medium tracking-[0.2em] uppercase text-[#1ecdec] m-0">
                  05
                </p>
                <h3
                  className="font-[family-name:var(--font-jakarta)] font-[800] text-white uppercase m-0 border-b border-white/20 pb-3"
                  style={{
                    fontSize: "clamp(18px, 1.8vw, 24px)",
                    lineHeight: 1.05,
                    letterSpacing: "-0.02em",
                  }}
                >
                  Catalyze Global Collaboration
                </h3>
                <p className="font-[family-name:var(--font-jakarta)] text-[14px] leading-[1.65] text-white/70 m-0">
                  Connecting ministries to accomplish more together than any one organization could alone.
                </p>
              </div>
              <div className="md:col-span-3 bg-[#2a3444]" />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── One Movement CTA ── */}
      <section className="py-20 md:py-[120px] bg-[#1ecdec]">
        <div className="max-w-[1360px] mx-auto px-4 md:px-10 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-14 items-center">
          <ScrollReveal>
            <h2
              className="font-[family-name:var(--font-jakarta)] font-[900] text-[#0a0a0a] uppercase m-0"
              style={{
                fontSize: "clamp(40px, 5.5vw, 96px)",
                lineHeight: 0.88,
                letterSpacing: "-0.045em",
              }}
            >
              One Movement.
              <br />
              One Mandate.
              <br />
              2033.
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={100}>
            <div className="flex flex-col gap-6">
              <p className="font-[family-name:var(--font-jakarta)] text-base md:text-[17px] leading-[1.7] text-[#0a0a0a]/85 m-0 max-w-[54ch] text-pretty">
                Billion Soul Harvest is not another organization. It is a table
                — where churches, ministries, and mission agencies bring what
                they already have and align it toward the same year.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/gatherings"
                  className="bg-[#0a0a0a] text-white px-8 py-[18px] text-[14px] font-[800] tracking-[0.08em] uppercase font-[family-name:var(--font-jakarta)] hover:bg-[#1a1a1a] transition-colors"
                >
                  Join the Movement
                </Link>
                <Link
                  href="/about/our-story"
                  className="border-2 border-[#0a0a0a] text-[#0a0a0a] px-8 py-[18px] text-[14px] font-[800] tracking-[0.08em] uppercase font-[family-name:var(--font-jakarta)] hover:bg-[#0a0a0a] hover:text-white transition-colors"
                >
                  Read Our Story
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
