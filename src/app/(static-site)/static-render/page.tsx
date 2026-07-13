import Link from "next/link";
import { HeroSlideshow } from "./components/hero-slideshow";
import { ScrollReveal } from "./components/scroll-reveal";
import { PartnerLogo } from "./components/partner-logo";

export const revalidate = 3600;

export default function HomePage() {
  return (
    <div className="scroll-smooth">
      {/* ── Hero Section ── */}
      <header className="relative min-h-[100vh] flex items-center overflow-hidden">
        <HeroSlideshow />
        <div
          className="absolute inset-0 z-[1]"
          style={{
            background:
              "linear-gradient(to bottom, rgba(13,34,63,0.45), rgba(13,34,63,0.8))",
          }}
        />
        <div
          className="relative z-10 max-w-[1280px] mx-auto px-4 md:px-8 w-full"
          style={{ textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}
        >
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-[family-name:var(--font-jakarta)] text-4xl md:text-[56px] md:leading-[64px] font-bold text-white mb-6 tracking-[-0.02em]">
              Billion Soul Harvest
            </h1>
            <p className="font-[family-name:var(--font-jakarta)] text-xl md:text-2xl leading-9 text-[#a9edff] font-semibold mb-6">
              Mobilizing the Global Church for One Billion Souls by 2033
            </p>
            <p className="font-[family-name:var(--font-jakarta)] text-lg leading-8 text-white/85 mb-4 max-w-2xl mx-auto">
              Billion Soul Harvest is a global movement calling the Church to
              unite in prayer, evangelism, discipleship, leadership development,
              and strategic collaboration for the fulfillment of the Great
              Commission.
            </p>
            <p className="font-[family-name:var(--font-jakarta)] text-base leading-7 text-white/70 italic mb-10">
              Every Believer. Every Church. Every Nation. Every Soul.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/about#our-story"
                className="bg-[#00b8d4] text-white px-10 py-4 rounded-lg text-sm font-semibold font-[family-name:var(--font-geist-sans)] hover:bg-[#006879] transition-all inline-flex items-center gap-2"
              >
                Discover the Vision
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
              <Link
                href="/connect"
                className="border-2 border-white text-white px-10 py-4 rounded-lg text-sm font-semibold font-[family-name:var(--font-geist-sans)] hover:bg-white/10 transition-all"
              >
                Join the Movement
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ── 2033 Endorsing Partners ── */}
      <section className="py-20 md:py-[100px] bg-white">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <ScrollReveal>
            <div className="text-center mb-4">
              <h2 className="font-[family-name:var(--font-jakarta)] text-3xl md:text-[40px] md:leading-[48px] font-bold text-[#0d223f] tracking-[-0.02em]">
                2033 Endorsing Partners
              </h2>
              <p className="font-[family-name:var(--font-jakarta)] text-lg text-[#44474d] mt-4">
                One Mission. Many Voices. A Billion Souls.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100}>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-4 mt-12">
            {([
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
            ] as { name: string; logo: string; dark?: boolean; iconWithText?: boolean; fill?: boolean }[]).map((partner) => (
              <PartnerLogo key={partner.name} name={partner.name} logo={partner.logo} dark={partner.dark} iconWithText={partner.iconWithText} fill={partner.fill} />
            ))}
          </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Contact Us ── */}
      <section className="py-20 md:py-[120px] bg-[#f9f9ff]">
        <ScrollReveal direction="none">
        <div className="max-w-3xl mx-auto px-4 md:px-8 text-center">
          <h2 className="font-[family-name:var(--font-jakarta)] text-3xl md:text-[40px] md:leading-[48px] font-bold text-[#0d223f] tracking-[-0.02em] mb-4">
            Contact Us
          </h2>
          <p className="font-[family-name:var(--font-jakarta)] text-lg text-[#44474d] mb-2">
            We would love to hear from you.
          </p>
          <p className="font-[family-name:var(--font-jakarta)] text-lg leading-8 text-[#44474d] mb-10">
            Whether you have a question, would like to partner with us, or simply want to
            learn more about Billion Soul Harvest, our team is here to help.
          </p>
          <Link
            href="/connect"
            className="inline-flex items-center gap-2 bg-[#00b8d4] text-white px-12 py-5 rounded-lg text-base font-semibold font-[family-name:var(--font-geist-sans)] hover:bg-[#006879] transition-all shadow-lg shadow-[#00b8d4]/30"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            Contact Us
          </Link>
        </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
