import Link from "next/link";
import { ScrollReveal } from "../../components/scroll-reveal";
import { HeroSlideshow } from "../../components/hero-slideshow";

export const revalidate = 3600;

export default async function TheBSHLogoPage() {
  return (
    <div className="scroll-smooth">
      {/* ── Section 1: Hero Banner ── */}
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
              The BSH Logo
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
            The Story Behind Our{" "}
            <span className="text-[#1ecdec]">Logo</span>
          </h1>

          <div className="hidden md:block border-t border-[#1ecdec] pt-7">
            <div className="grid grid-cols-1 md:grid-cols-[1.1fr_auto] gap-8 items-end">
              <p className="font-[family-name:var(--font-jakarta)] text-[15px] leading-[1.7] text-white/90 m-0 max-w-[52ch] text-pretty">
                Every Seed Matters. Every Soul Matters. Every Nation Matters.
                Discover the meaning behind the symbol that represents our global movement.
              </p>
              <div className="flex gap-3">
                <Link
                  href="/about/our-story"
                  className="bg-[#1ecdec] text-[#0a0a0a] px-8 py-[18px] text-[14px] font-[800] tracking-[0.08em] uppercase font-[family-name:var(--font-jakarta)] hover:bg-white transition-colors"
                >
                  Our Story
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

      {/* ── Section 2: Logo Explained Infographic ── */}
      <section className="py-[110px]" style={{ background: "#0a0a0a" }}>
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
                The BSH Logo
              </span>
              <h2
                className="font-[family-name:var(--font-jakarta)] text-white mt-4 uppercase"
                style={{
                  fontSize: "clamp(38px, 5vw, 84px)",
                  lineHeight: 0.88,
                  letterSpacing: "-0.045em",
                  fontWeight: 900,
                }}
              >
                Logo Explained
              </h2>
              <div className="mt-6" style={{ borderBottom: "2px solid rgba(255,255,255,0.3)" }} />
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div
              style={{
                background: "white",
                border: "1px solid rgba(255,255,255,0.22)",
                padding: 20,
              }}
            >
              <img
                src="/bsh-logo-explained.jpeg"
                alt="The BSH Logo Explained — 9 Seeds, 1 Harvest, Billions of Souls. Infographic showing the six meanings behind the BSH logo: 9 Zeroes representing Billions, Different Seeds for diversity, Sowing the Seeds, Adaptive Approach, Multiplication in Unity, and From One Seed to a Billion Souls."
                className="w-full h-auto"
              />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Section 3: The Story Behind Our Symbol ── */}
      <section className="py-[110px]" style={{ background: "#f5f7fa", color: "#0a0a0a" }}>
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <div
            className="grid gap-8 md:gap-0"
            style={{ gridTemplateColumns: "300px 1fr", columnGap: 64 }}
          >
            {/* Sidebar */}
            <div className="hidden md:block" style={{ position: "sticky", top: 110, alignSelf: "start" }}>
              <span
                className="font-[family-name:var(--font-geist-mono)]"
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "#506b9f",
                  display: "block",
                  marginBottom: 20,
                }}
              >
                From the Director
              </span>
              <Link href="https://youngcho.billionsoulharvest.org/" target="_blank" rel="noopener noreferrer" className="shrink-0">
                <img
                  src="/leaders/young-cho.jpg"
                  alt="Rev. Dr. Young Cho"
                  style={{
                    width: 132,
                    height: 132,
                    objectFit: "cover",
                    border: "2px solid #0a0a0a",
                  }}
                />
              </Link>
              <div className="mt-4">
                <Link
                  href="https://youngcho.billionsoulharvest.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-[family-name:var(--font-jakarta)] hover:text-[#1ecdec] transition-colors block"
                  style={{
                    fontWeight: 900,
                    fontSize: 22,
                    lineHeight: 1,
                    letterSpacing: "-0.03em",
                    color: "#0a0a0a",
                  }}
                >
                  Young Cho
                </Link>
                <p
                  className="font-[family-name:var(--font-jakarta)] mt-2"
                  style={{
                    fontSize: 14.5,
                    fontStyle: "italic",
                    color: "#505870",
                  }}
                >
                  Global Director
                </p>
                <p
                  className="font-[family-name:var(--font-jakarta)]"
                  style={{
                    fontSize: 14.5,
                    color: "#505870",
                  }}
                >
                  Billion Soul Harvest
                </p>
                <Link
                  href="https://youngcho.billionsoulharvest.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-[family-name:var(--font-geist-mono)] hover:underline mt-2 inline-block"
                  style={{
                    fontSize: 11.5,
                    letterSpacing: "0.04em",
                    color: "#506b9f",
                  }}
                >
                  youngcho.billionsoulharvest.org
                </Link>
              </div>
            </div>

            {/* Main content */}
            <div className="font-[family-name:var(--font-jakarta)] flex flex-col" style={{ maxWidth: "68ch", gap: 26 }}>
              <h2
                className="font-[family-name:var(--font-jakarta)]"
                style={{
                  fontWeight: 900,
                  fontSize: "clamp(36px, 4.6vw, 76px)",
                  lineHeight: 0.9,
                  letterSpacing: "-0.05em",
                  color: "#0a0a0a",
                }}
              >
                The Story Behind Our Symbol
              </h2>

              <p style={{ fontSize: 20, lineHeight: 1.6, color: "#3a3f54" }}>Welcome to Billion Soul Harvest.</p>
              <p style={{ fontSize: 17, lineHeight: 1.75, color: "#505870" }}>
                Thank you for visiting our website and taking the time to learn more about the
                vision God has entrusted to us. Before you explore our movement, I&apos;d like to
                share the story behind our logo, because it beautifully reflects the heart of who
                we are.
              </p>
              <p style={{ fontSize: 17, lineHeight: 1.75, color: "#505870" }}>
                At first glance, you will notice{" "}
                <strong style={{ color: "#0a0a0a" }}>nine unique seed-like shapes</strong>. Each
                resembles the number <strong style={{ color: "#0a0a0a" }}>zero</strong>, reminding
                us of the word <strong style={{ color: "#0a0a0a" }}>&ldquo;Billion.&rdquo;</strong>{" "}
                Yet these are much more than numbers. Every shape represents a soul created in the
                image of God&mdash;a person whom Christ loves and for whom He gave His life.
              </p>
              <p style={{ fontSize: 17, lineHeight: 1.75, color: "#505870" }}>
                No two seeds are identical. They symbolize the beautiful diversity of the nations,
                cultures, languages, generations, and communities that make up God&apos;s Kingdom.
                While the Gospel never changes, every mission field is unique, calling us to serve
                with wisdom, humility, and love.
              </p>
              <p style={{ fontSize: 17, lineHeight: 1.75, color: "#505870" }}>
                The logo also reminds us that every great harvest begins with faithful sowing.
                Before there can be a harvest, someone must plant the seed. Billion Soul Harvest
                exists to encourage and mobilize believers everywhere to faithfully sow the
                Gospel, trusting God to bring the increase.
              </p>
              <p style={{ fontSize: 17, lineHeight: 1.75, color: "#505870" }}>
                Finally, these individual seeds come together as one symbol. This reflects one of
                our deepest convictions:{" "}
                <strong style={{ color: "#0a0a0a" }}>
                  the Great Commission will only be fulfilled as the global Church works together
                  in unity.
                </strong>{" "}
                No ministry, denomination, or nation can finish the task alone. Together, we
                believe God is preparing a great harvest among every people and every nation
                before His return.
              </p>

              <p style={{ fontSize: 17, lineHeight: 1.75, color: "#505870" }}>Our prayer is simple:</p>

              <blockquote
                style={{
                  padding: "34px 36px",
                  background: "#0a0a0a",
                  color: "white",
                  borderRadius: 6,
                }}
              >
                <p
                  className="font-[family-name:var(--font-jakarta)]"
                  style={{
                    fontWeight: 900,
                    fontSize: "clamp(24px, 2.8vw, 40px)",
                    lineHeight: 1.06,
                    letterSpacing: "-0.04em",
                  }}
                >
                  Every Seed Matters. Every Soul Matters. Every Nation Matters.
                </p>
              </blockquote>

              <p style={{ fontSize: 17, lineHeight: 1.75, color: "#505870" }}>
                Thank you for joining us in this extraordinary journey. May this logo continually
                remind us that every act of faithful obedience, no matter how small, contributes
                to God&apos;s eternal harvest.
              </p>

              <p style={{ fontSize: 17, lineHeight: 1.75, color: "#505870" }}>For His glory,</p>

              {/* Author signature - mobile only */}
              <div className="flex items-center gap-4 md:hidden">
                <Link href="https://youngcho.billionsoulharvest.org/" target="_blank" rel="noopener noreferrer" className="shrink-0">
                  <img
                    src="/leaders/young-cho.jpg"
                    alt="Rev. Dr. Young Cho"
                    style={{
                      width: 56,
                      height: 56,
                      objectFit: "cover",
                      border: "2px solid #0a0a0a",
                    }}
                  />
                </Link>
                <div>
                  <Link
                    href="https://youngcho.billionsoulharvest.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-[family-name:var(--font-jakarta)] hover:text-[#1ecdec] transition-colors"
                    style={{
                      fontWeight: 900,
                      fontSize: 22,
                      lineHeight: 1,
                      letterSpacing: "-0.03em",
                      color: "#0a0a0a",
                    }}
                  >
                    Young Cho
                  </Link>
                  <p
                    className="font-[family-name:var(--font-jakarta)]"
                    style={{ fontSize: 14.5, fontStyle: "italic", color: "#505870" }}
                  >
                    Global Director
                  </p>
                  <p
                    className="font-[family-name:var(--font-jakarta)]"
                    style={{ fontSize: 14.5, color: "#505870" }}
                  >
                    Billion Soul Harvest
                  </p>
                  <Link
                    href="https://youngcho.billionsoulharvest.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-[family-name:var(--font-geist-mono)] hover:underline mt-1 inline-block"
                    style={{
                      fontSize: 11.5,
                      letterSpacing: "0.04em",
                      color: "#506b9f",
                    }}
                  >
                    youngcho.billionsoulharvest.org
                  </Link>
                </div>
              </div>

              {/* Trademark Notice */}
              <div style={{ borderTop: "2px solid #0a0a0a", paddingTop: 26, marginTop: 40 }}>
                <h3
                  className="font-[family-name:var(--font-jakarta)] uppercase"
                  style={{
                    fontSize: 14,
                    fontWeight: 900,
                    letterSpacing: "0.08em",
                    color: "#0a0a0a",
                    marginBottom: 12,
                  }}
                >
                  Trademark Notice
                </h3>
                <p className="font-[family-name:var(--font-jakarta)]" style={{ fontSize: 15, lineHeight: 1.65, color: "#505870" }}>
                  <strong style={{ color: "#0a0a0a" }}>Billion Soul Harvest&reg;</strong> and the{" "}
                  <strong style={{ color: "#0a0a0a" }}>BSH logo</strong> are officially registered
                  entities and protected trademarks in the Republic of Korea. Their use is reserved
                  for authorized ministries, partners, and official communications of the Billion
                  Soul Harvest movement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 4: The Four Greats ── */}
      <section className="py-[110px]" style={{ background: "#0d1520" }}>
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
                Our Vision
              </span>
              <h2
                className="font-[family-name:var(--font-jakarta)] mt-4 uppercase"
                style={{
                  fontSize: "clamp(38px, 5vw, 84px)",
                  lineHeight: 0.88,
                  letterSpacing: "-0.045em",
                  fontWeight: 900,
                  color: "white",
                }}
              >
                The Four Greats
              </h2>
              <div className="mt-6" style={{ borderBottom: "2px solid rgba(255,255,255,0.3)" }} />
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div
              className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2"
              style={{ gap: 1, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.15)" }}
            >
              <div className="md:col-span-2 md:row-span-1 bg-[#111b27] p-8">
                <span
                  className="font-[family-name:var(--font-geist-mono)]"
                  style={{
                    fontSize: 11.5,
                    fontWeight: 500,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "#1ecdec",
                    display: "block",
                    marginBottom: 12,
                  }}
                >
                  01
                </span>
                <h3
                  className="font-[family-name:var(--font-jakarta)] mb-3"
                  style={{
                    fontWeight: 900,
                    fontSize: "clamp(24px, 2.6vw, 28px)",
                    lineHeight: 0.94,
                    letterSpacing: "-0.04em",
                    color: "white",
                  }}
                >
                  Great Return
                </h3>
                <p className="font-[family-name:var(--font-jakarta)] text-base" style={{ color: "rgba(255,255,255,0.7)" }}>Living with expectancy for Christ&apos;s return.</p>
              </div>

              <div
                className="md:col-span-2 md:row-span-2 text-white p-8 flex flex-col justify-end relative overflow-hidden"
                style={{
                  background: "#0a0a0a",
                }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      "linear-gradient(to top, rgba(10,10,10,0.85) 20%, rgba(10,10,10,0.35) 100%), url('/great-harvest-bg.webp')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
                <div className="relative z-10">
                  <span
                    className="font-[family-name:var(--font-geist-mono)]"
                    style={{
                      fontSize: 11.5,
                      fontWeight: 500,
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      color: "#1ecdec",
                      display: "block",
                      marginBottom: 12,
                    }}
                  >
                    02
                  </span>
                  <h3
                    className="font-[family-name:var(--font-jakarta)] mb-4"
                    style={{
                      fontWeight: 900,
                      fontSize: "clamp(24px, 2.6vw, 28px)",
                      lineHeight: 0.94,
                      letterSpacing: "-0.04em",
                    }}
                  >
                    Great Harvest
                  </h3>
                  <p className="font-[family-name:var(--font-jakarta)] text-lg leading-7 text-white/80 max-w-md">Reaching the world with the Gospel.</p>
                  <Link
                    href="/gatherings"
                    className="mt-8 inline-flex items-center gap-2 text-sm font-[800] font-[family-name:var(--font-jakarta)] uppercase tracking-[0.08em]"
                    style={{ color: "#1ecdec" }}
                  >
                    LEARN MORE
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </div>

              <div className="md:col-span-1 md:row-span-1 bg-[#111b27] p-8">
                <span
                  className="font-[family-name:var(--font-geist-mono)]"
                  style={{
                    fontSize: 11.5,
                    fontWeight: 500,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "#1ecdec",
                    display: "block",
                    marginBottom: 12,
                  }}
                >
                  03
                </span>
                <h3
                  className="font-[family-name:var(--font-jakarta)] mb-3"
                  style={{
                    fontWeight: 900,
                    fontSize: "clamp(24px, 2.6vw, 28px)",
                    lineHeight: 0.94,
                    letterSpacing: "-0.04em",
                    color: "white",
                  }}
                >
                  Great Unity
                </h3>
                <p className="font-[family-name:var(--font-jakarta)] text-base" style={{ color: "rgba(255,255,255,0.7)" }}>Bringing the Body of Christ together.</p>
              </div>

              <div className="md:col-span-1 md:row-span-1 bg-[#111b27] p-8">
                <span
                  className="font-[family-name:var(--font-geist-mono)]"
                  style={{
                    fontSize: 11.5,
                    fontWeight: 500,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "#1ecdec",
                    display: "block",
                    marginBottom: 12,
                  }}
                >
                  04
                </span>
                <h3
                  className="font-[family-name:var(--font-jakarta)] mb-3"
                  style={{
                    fontWeight: 900,
                    fontSize: "clamp(24px, 2.6vw, 28px)",
                    lineHeight: 0.94,
                    letterSpacing: "-0.04em",
                    color: "white",
                  }}
                >
                  Great Breakthrough
                </h3>
                <p className="font-[family-name:var(--font-jakarta)] text-base" style={{ color: "rgba(255,255,255,0.7)" }}>
                  Advancing God&apos;s Kingdom through prayer, faith, and the power of the Holy Spirit.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
