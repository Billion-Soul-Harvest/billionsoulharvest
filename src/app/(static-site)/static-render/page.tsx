import Link from "next/link";
import { HeroSlideshow } from "./components/hero-slideshow";
import { ScrollReveal } from "./components/scroll-reveal";
import { PartnerCell } from "./components/partner-cell";
import { Marquee } from "./components/marquee";
import { InlineContactForm } from "./components/inline-contact-form";

export const revalidate = 3600;

const PARTNERS = [
  { name: "Alpha", logo: "/partners/alpha.png" },
  { name: "America Prays", logo: "/partners/america-prays.png" },
  { name: "World Prays", logo: "/partners/world-prays.png" },
  { name: "Assemblies of God", logo: "/partners/assemblies-of-god.jpg" },
  { name: "GACX", logo: "/partners/gacx.webp", dark: true },
  { name: "GO Movement", logo: "/partners/go-movement.svg" },
  { name: "JC 2033", logo: "/partners/jc2033.svg", dark: true },
  { name: "Baptist World Alliance", logo: "/partners/baptist-world-alliance.jpg" },
  { name: "Billion Soul Harvest", logo: "/partners/billion-soul-harvest.png" },
  { name: "Call2All", logo: "/partners/call2all.png" },
  { name: "Lausanne Movement", logo: "/partners/lausanne.svg" },
  { name: "Luis Palau Association", logo: "/partners/luis-palau.jpg", fill: true },
  { name: "Movement.org", logo: "/partners/movement-org.png", dark: true },
  { name: "Church of God", logo: "/partners/church-of-god.png" },
  { name: "Come and See", logo: "/partners/come-and-see.png", fill: true },
  { name: "Century 21", logo: "/partners/century-21.png", fill: true },
  { name: "Every Home for Christ", logo: "/partners/every-home-for-christ.png" },
  { name: "OneHope", logo: "/partners/onehope.png" },
  { name: "ORU", logo: "/partners/oru.png" },
  { name: "PAOC", logo: "/partners/paoc.png" },
  { name: "Pentecostal World Fellowship", logo: "/partners/pentecostal-world-fellowship.png" },
  { name: "Every Tribe Every Nation", logo: "/partners/every-tribe-every-nation.png" },
  { name: "Finishing the Task", logo: "/partners/finishing-the-task.svg", dark: true },
  { name: "Global 2033", logo: "/partners/global-2033.png" },
  { name: "The Park Church", logo: "/partners/the-park-church.jpg" },
  { name: "WEA", logo: "/partners/wea.jpg" },
  { name: "YouVersion", logo: "/partners/youversion.webp" },
  { name: "Jesus Film Project", logo: "/partners/jesus-film-project.jpeg" },
  { name: "Cru", logo: "/partners/cru.png" },
] as { name: string; logo: string; dark?: boolean; fill?: boolean }[];

export default function HomePage() {
  return (
    <div className="scroll-smooth bg-[#0a0a0a]">
      {/* ── Hero ── */}
      <header className="relative min-h-[92vh] flex flex-col justify-end overflow-hidden">
        <HeroSlideshow />

        {/* Bottom fade only — keeps the photograph legible */}
        <div
          className="absolute inset-0 z-[1]"
          style={{
            background:
              "linear-gradient(to top, #0a0a0a 2%, rgba(10,10,10,0.7) 35%, rgba(10,10,10,0.15) 70%, transparent 100%)",
          }}
        />

        <div className="relative z-10 px-4 md:px-10 pt-[210px] pb-14 flex flex-col gap-7">
          <div className="flex items-center">
            <span className="inline-block bg-[#0a1928]/80 border border-[#1ecdec]/50 rounded-full px-6 py-2.5 font-[family-name:var(--font-geist-mono)] text-[12px] font-medium tracking-[0.2em] uppercase text-[#1ecdec]">
              One Billion Souls by 2033
            </span>
          </div>

          <h1
            className="font-[family-name:var(--font-jakarta)] font-[900] text-white uppercase m-0 md:max-w-[50%]"
            style={{
              fontSize: "clamp(32px, 4.5vw, 76px)",
              lineHeight: 0.88,
              letterSpacing: "-0.05em",
              textShadow: "0 4px 40px rgba(10,10,10,0.55)",
            }}
          >
            Mobilizing the Global Church for One Billion Souls by{" "}
            <span className="text-[#1ecdec]">2033</span>
          </h1>

          <div className="hidden md:grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-8 lg:gap-14 items-end border-t-2 border-white/[0.32] pt-[30px]">
            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/about#our-story"
                  className="bg-[#1ecdec] text-[#0a0a0a] px-8 py-[18px] text-[14px] font-extrabold tracking-[0.08em] uppercase font-[family-name:var(--font-jakarta)] hover:bg-white transition-colors"
                >
                  Discover the Vision
                </Link>
                <Link
                  href="/connect"
                  className="border-2 border-white/50 text-white px-8 py-[18px] text-[14px] font-extrabold tracking-[0.08em] uppercase font-[family-name:var(--font-jakarta)] hover:bg-white hover:text-[#0a0a0a] transition-colors"
                >
                  Join the Movement
                </Link>
              </div>
            </div>
            <p className="font-[family-name:var(--font-jakarta)] text-[16.5px] leading-[1.7] text-white/90 m-0 max-w-[54ch] text-pretty">
              Billion Soul Harvest is a global movement calling the Church to unite in
              prayer, evangelism, discipleship, leadership development, and strategic
              collaboration for the fulfillment of the Great Commission.
            </p>
          </div>
        </div>

        <Marquee items={["Every Believer", "Every Church", "Every Nation", "Every Soul"]} />
      </header>

      {/* ── 2033 Endorsing Partners ── */}
      <section className="py-[110px] bg-[#f5f7fa]">
        <div className="max-w-[1360px] mx-auto px-4 md:px-10 flex flex-col gap-11">
          <ScrollReveal>
            <div className="flex flex-wrap items-end justify-between gap-5 border-b-2 border-[#0a0a0a] pb-[24px]">
              <h2
                className="font-[family-name:var(--font-jakarta)] font-[900] text-[#0a0a0a] uppercase m-0"
                style={{
                  fontSize: "clamp(36px, 4.8vw, 80px)",
                  lineHeight: 0.88,
                  letterSpacing: "-0.045em",
                }}
              >
                2033 Endorsing Partners
              </h2>
              <p className="font-[family-name:var(--font-geist-mono)] text-[12.5px] font-medium tracking-[0.16em] uppercase text-[#506b9f] m-0">
                One Mission. Many Voices. A Billion Souls.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <div
              className="grid gap-[1px] bg-[#0a0a0a]/20 border border-[#0a0a0a]/20"
              style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}
            >
              {PARTNERS.map((p) => (
                <PartnerCell key={p.name} {...p} />
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Contact Us ── */}
      <section className="py-[120px] bg-[#0a0a0a] border-t border-white/5">
        <ScrollReveal direction="none">
          <div className="max-w-[1360px] mx-auto px-4 md:px-10 grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-14 lg:gap-[80px] items-start">
            <div className="flex flex-col gap-6">
              <p className="font-[family-name:var(--font-geist-mono)] text-[12px] font-medium tracking-[0.2em] uppercase text-[#1ecdec] m-0">
                Get in Touch
              </p>
              <h2
                className="font-[family-name:var(--font-jakarta)] font-[900] text-white uppercase m-0"
                style={{
                  fontSize: "clamp(44px, 6vw, 104px)",
                  lineHeight: 0.86,
                  letterSpacing: "-0.05em",
                }}
              >
                Contact Us
              </h2>
              <p
                className="font-[family-name:var(--font-jakarta)] font-extrabold text-white m-0"
                style={{
                  fontSize: "clamp(20px, 2.2vw, 30px)",
                  lineHeight: 1.15,
                  letterSpacing: "-0.025em",
                }}
              >
                We would love to hear from you.
              </p>
              <p className="font-[family-name:var(--font-jakarta)] text-[17px] leading-[1.7] text-white/90 m-0 max-w-[54ch] text-pretty">
                Whether you have a question, would like to partner with us, or simply want
                to learn more about Billion Soul Harvest, our team is here to help.
              </p>
              <div className="flex flex-wrap gap-3 mt-2">
                {[
                  ["Facebook", "https://www.facebook.com/BillionSoulHarvest/"],
                  ["Instagram", "https://www.instagram.com/billionsoul_/"],
                  ["YouTube", "https://www.youtube.com/@ghs2033"],
                ].map(([label, href]) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="border-2 border-white/35 text-white px-[24px] py-[14px] font-[family-name:var(--font-geist-mono)] text-[12px] font-medium tracking-[0.12em] uppercase hover:bg-[#1ecdec] hover:border-[#1ecdec] hover:text-[#0a0a0a] transition-colors"
                  >
                    {label}
                  </a>
                ))}
              </div>
            </div>

            <InlineContactForm />
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
