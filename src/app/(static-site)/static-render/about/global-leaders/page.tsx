import { honoraryChairmen, coChairs, LeaderAvatar } from "../shared";
import { ScrollReveal } from "../../components/scroll-reveal";
import { HeroSlideshow } from "../../components/hero-slideshow";
import Link from "next/link";

export const revalidate = 3600;

export default async function GlobalLeadersPage() {
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
              Leadership
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
            Global{" "}
            <span className="text-[#1ecdec]">Leaders</span>
          </h1>

          <div className="hidden md:block border-t border-[#1ecdec] pt-7">
            <div className="grid grid-cols-1 md:grid-cols-[1.1fr_auto] gap-8 items-end">
              <p className="font-[family-name:var(--font-jakarta)] text-[15px] leading-[1.7] text-white/90 m-0 max-w-[52ch] text-pretty">
                Billion Soul Harvest is led by a diverse team of Christian leaders from around the
                world, united by a shared commitment to the Great Commission.
              </p>
              <div className="flex gap-3">
                <Link
                  href="/about/our-story"
                  className="bg-[#1ecdec] text-[#0a0a0a] px-8 py-[18px] text-[14px] font-[800] tracking-[0.08em] uppercase font-[family-name:var(--font-jakarta)] hover:bg-white transition-colors"
                >
                  Our Story
                </Link>
                <Link
                  href="/about/the-bsh-logo"
                  className="border-2 border-white/50 text-white px-8 py-[18px] text-[14px] font-[800] tracking-[0.08em] uppercase font-[family-name:var(--font-jakarta)] hover:bg-white hover:text-[#0a0a0a] transition-colors"
                >
                  The BSH Logo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Our DNA: Holy, Humble, Hidden ── */}
      <section
        id="our-dna"
        className="text-white relative overflow-hidden"
        style={{ background: "#0a0a0a", padding: "110px 0" }}
      >
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 relative z-10">
          <ScrollReveal direction="none">
            <div className="mb-16">
              <p
                className="font-[family-name:var(--font-geist-mono)] uppercase mb-5"
                style={{
                  fontSize: "12.5px",
                  fontWeight: 500,
                  letterSpacing: "0.16em",
                  color: "#1ecdec",
                }}
              >
                Leadership
              </p>
              <h2
                className="font-[900] uppercase text-white"
                style={{
                  maxWidth: "18ch",
                  fontSize: "clamp(38px, 5vw, 84px)",
                  lineHeight: "0.88",
                  letterSpacing: "-0.045em",
                }}
              >
                Our DNA: Holy, Humble, Hidden
              </h2>
              <div
                className="mt-8"
                style={{ borderBottom: "2px solid rgba(255,255,255,0.3)" }}
              />
            </div>
          </ScrollReveal>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "1px",
              background: "rgba(255,255,255,0.22)",
              border: "1px solid rgba(255,255,255,0.22)",
            }}
          >
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
                style={{
                  background: "#0a0a0a",
                  padding: "40px 32px 48px",
                  minHeight: "280px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <p
                  className="font-[family-name:var(--font-geist-mono)] uppercase"
                  style={{
                    fontSize: "12px",
                    fontWeight: 500,
                    letterSpacing: "0.16em",
                    color: "#1ecdec",
                  }}
                >
                  {item.num}
                </p>
                <div style={{ color: "#1ecdec" }}>
                  {item.icon}
                </div>
                <h4
                  className="font-[900] uppercase text-white"
                  style={{
                    fontSize: "clamp(34px, 3.4vw, 52px)",
                    lineHeight: "0.92",
                    letterSpacing: "-0.045em",
                  }}
                >
                  {item.title}
                </h4>
                <p
                  style={{
                    fontSize: "16.5px",
                    lineHeight: "1.6",
                    color: "rgba(255,255,255,0.85)",
                  }}
                >
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Global Honorary Chairmen ── */}
      <section
        style={{ background: "#f5f7fa", color: "#0a0a0a", padding: "110px 0" }}
      >
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <div className="mb-16">
            <p
              className="font-[family-name:var(--font-geist-mono)] uppercase mb-5"
              style={{
                fontSize: "12.5px",
                fontWeight: 500,
                letterSpacing: "0.16em",
                color: "#506b9f",
              }}
            >
              Honorary Chairmen
            </p>
            <h2
              className="font-[900] uppercase"
              style={{
                fontSize: "clamp(34px, 4.4vw, 74px)",
                lineHeight: "0.88",
                letterSpacing: "-0.045em",
                color: "#0a0a0a",
              }}
            >
              Global Honorary Chairmen
            </h2>
            <div
              className="mt-8"
              style={{ borderBottom: "2px solid #0a0a0a" }}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "24px",
            }}
          >
            {honoraryChairmen.filter((p) => p.role === "Honorary Chairman").map((person, i) => (
              <div
                key={person.name}
                className="relative overflow-hidden"
                style={{ aspectRatio: "4/5", background: "#262d48" }}
              >
                {person.photo && (
                  <img
                    src={person.photo}
                    alt={person.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, #0a0a0a 4%, rgba(10,10,10,0.72) 30%, rgba(10,10,10,0.06) 62%, transparent 100%)",
                  }}
                />
                <span
                  className="absolute top-0 left-0 font-[family-name:var(--font-geist-mono)] uppercase"
                  style={{
                    padding: "6px 10px",
                    background: "#1ecdec",
                    color: "#0a0a0a",
                    fontSize: "11px",
                    fontWeight: 500,
                    letterSpacing: "0.14em",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div
                  className="absolute bottom-0 left-0 right-0"
                  style={{
                    padding: "26px 24px 28px",
                    color: "white",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <h4
                    className="font-[900] uppercase"
                    style={{
                      fontSize: "clamp(22px, 2vw, 30px)",
                      lineHeight: "0.98",
                      letterSpacing: "-0.035em",
                    }}
                  >
                    {person.name}
                  </h4>
                  <p
                    className="font-[family-name:var(--font-geist-mono)]"
                    style={{
                      fontSize: "12px",
                      lineHeight: "1.45",
                      letterSpacing: "0.06em",
                      color: "#1ecdec",
                    }}
                  >
                    {person.org}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Global Leaders List ── */}
        </div>
      </section>

      <section
        id="co-chairs"
        className="scroll-mt-20"
        style={{ background: "#262d48", padding: "110px 0" }}
      >
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <div className="mb-16">
            <p
              className="font-[family-name:var(--font-geist-mono)] uppercase mb-5"
              style={{
                fontSize: "12.5px",
                fontWeight: 500,
                letterSpacing: "0.16em",
                color: "#1ecdec",
              }}
            >
              Leadership
            </p>
            <h2
              className="font-[900] uppercase text-white"
              style={{
                fontSize: "clamp(34px, 4.4vw, 74px)",
                lineHeight: "0.88",
                letterSpacing: "-0.045em",
              }}
            >
              Global Leaders
            </h2>
            <div
              className="mt-8"
              style={{ borderBottom: "2px solid rgba(255,255,255,0.3)" }}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(440px, 1fr))",
              columnGap: "56px",
            }}
          >
            {coChairs.map((person, i) => (
              <div
                key={`${person.name}-${person.org}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "20px 76px 1fr auto",
                  alignItems: "center",
                  padding: "16px 4px",
                  borderBottom: "1px solid rgba(255,255,255,0.16)",
                  gap: "16px",
                }}
              >
                <span
                  className="font-[family-name:var(--font-geist-mono)]"
                  style={{
                    fontSize: "10.5px",
                    letterSpacing: "0.08em",
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                {person.photo ? (
                  <img
                    src={person.photo}
                    alt={person.name}
                    className="rounded-full object-cover"
                    style={{ width: "76px", height: "76px" }}
                  />
                ) : (
                  <LeaderAvatar name={person.name} photo={person.photo} size="md" />
                )}
                <div>
                  <h4
                    className="font-[800] uppercase text-white"
                    style={{
                      fontSize: "16px",
                      lineHeight: "1.15",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {person.name}
                  </h4>
                </div>
                <p
                  className="font-[family-name:var(--font-geist-mono)] text-right"
                  style={{
                    fontSize: "11.5px",
                    lineHeight: "1.4",
                    letterSpacing: "0.04em",
                    color: "#1ecdec",
                  }}
                >
                  {person.org}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
