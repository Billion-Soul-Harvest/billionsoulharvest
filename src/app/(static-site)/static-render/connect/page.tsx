import Link from "next/link";
import { ScrollReveal } from "../components/scroll-reveal";
import { ContactDialog } from "../components/contact-dialog";
import { InlineContactForm } from "../components/inline-contact-form";
import { HeroSlideshow } from "../components/hero-slideshow";

export default function ConnectPage() {
  const sections = [
    {
      id: "partner",
      title: "Partner With Us",
      paragraphs: [
        "We welcome strategic partnerships with churches, ministries, mission organizations, Christian networks, educational institutions, and Kingdom leaders who share our passion for evangelism, discipleship, and multiplication.",
      ],
      cta: "Become a Partner",
      href: "/contact",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      id: "invite",
      title: "Invite BSH",
      paragraphs: [
        "Would you like Billion Soul Harvest to participate in your conference, church, leadership gathering, or ministry event?",
        "Our leadership team is available for speaking engagements, leadership training, strategic consultations, and partnership development around the world.",
      ],
      cta: "Request a Speaker",
      href: "/contact",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      ),
    },
    {
      id: "pray",
      title: "Pray With Us",
      paragraphs: [
        "Prayer is the foundation of everything we do.",
        "Join us in praying for global revival, the fulfillment of the Great Commission, and the unity of the Body of Christ as we prepare for the greatest harvest in history.",
      ],
      cta: "Join Our Prayer Network",
      href: "/contact",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
    {
      id: "support",
      title: "Support the Mission",
      paragraphs: [
        "Your generosity helps mobilize leaders, strengthen churches, equip evangelists, and advance strategic Kingdom initiatives around the world.",
        "Together, we can help accelerate the fulfillment of the Great Commission.",
      ],
      cta: "Give Today",
      href: "/contact",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: "stay-connected",
      title: "Stay Connected",
      paragraphs: [
        "Receive ministry updates, upcoming event announcements, prayer requests, and stories of what God is doing through Billion Soul Harvest around the world.",
      ],
      cta: "Subscribe to Our Newsletter",
      href: "/contact",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  return (
    <div>
      {/* Hero */}
      <header className="relative min-h-screen md:min-h-[85vh] flex flex-col justify-end overflow-hidden bg-[#0a0a0a]">
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
              Get Involved
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
            Join the{" "}
            <span className="text-[#1ecdec]">Movement</span>
          </h1>

          <div className="hidden md:block border-t border-[#1ecdec] pt-7">
            <p className="font-[family-name:var(--font-jakarta)] text-[15px] leading-[1.7] text-white/90 m-0 max-w-[52ch] text-pretty">
              Whether you want to partner, pray, give, or stay connected — there are many ways to be part of what God is doing through Billion Soul Harvest.
            </p>
          </div>
        </div>
      </header>

      {/* Ways to Connect — temporarily hidden
      <section className="py-20 md:py-[100px] bg-[#f9f9ff]">
        <div className="max-w-[900px] mx-auto px-4 md:px-8">
          <ScrollReveal>
            <div className="space-y-8">
              {sections.map((section, i) => (
                <div
                  key={section.id}
                  id={section.id}
                  className="bg-white rounded-2xl border border-[#b4c7ec]/30 p-8 md:p-10 hover:shadow-lg hover:border-[#00b8d4]/30 transition-all duration-300 scroll-mt-20"
                >
                  <div className="flex items-start gap-5">
                    <div className="w-14 h-14 rounded-xl bg-[#0d223f] flex items-center justify-center shrink-0 text-[#a9edff]">
                      {section.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-[family-name:var(--font-jakarta)] text-2xl md:text-3xl font-bold text-[#0d223f] mb-4 tracking-[-0.02em]">
                        {section.title}
                      </h2>
                      {section.paragraphs.map((p, j) => (
                        <p
                          key={j}
                          className="font-[family-name:var(--font-jakarta)] text-[17px] leading-8 text-[#2a3a50] mb-3 last:mb-0"
                        >
                          {p}
                        </p>
                      ))}
                      <Link
                        href={section.href}
                        className="inline-flex items-center gap-2 mt-6 bg-[#00b8d4] text-white px-6 py-2.5 rounded-lg text-sm font-semibold font-[family-name:var(--font-geist-sans)] hover:scale-105 transition-transform shadow-lg shadow-[#00b8d4]/20"
                      >
                        {section.cta} &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>
      */}

      {/* Contact Us */}
      <section
        className="bg-[#0a0a0a]"
        style={{
          paddingTop: "110px",
          paddingBottom: "120px",
          borderTop: "1px solid rgba(255,255,255,0.16)",
        }}
      >
        <div className="max-w-[1100px] mx-auto px-4 md:px-8">
          <ScrollReveal direction="none">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
                gap: "64px",
              }}
            >
              {/* Left Column */}
              <div style={{ display: "flex", flexDirection: "column", gap: "26px" }}>
                <span
                  className="font-[family-name:var(--font-geist-mono)]"
                  style={{
                    fontSize: "12.5px",
                    fontWeight: 500,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "#1ecdec",
                  }}
                >
                  Connect
                </span>
                <h2
                  className="font-[family-name:var(--font-jakarta)] uppercase text-white"
                  style={{
                    fontWeight: 900,
                    fontSize: "clamp(40px, 5.4vw, 92px)",
                    lineHeight: 0.86,
                    letterSpacing: "-0.055em",
                    margin: 0,
                  }}
                >
                  Contact Us
                </h2>
                <p
                  className="font-[family-name:var(--font-jakarta)] text-white"
                  style={{
                    fontWeight: 800,
                    fontSize: "clamp(22px, 2.2vw, 32px)",
                    lineHeight: 1.1,
                    letterSpacing: "-0.035em",
                    margin: 0,
                  }}
                >
                  We would love to hear from you.
                </p>
                <p
                  className="font-[family-name:var(--font-jakarta)]"
                  style={{
                    maxWidth: "52ch",
                    fontSize: "17px",
                    lineHeight: 1.72,
                    color: "rgba(255,255,255,0.85)",
                    margin: 0,
                  }}
                >
                  Whether you have a question, would like to partner with us, or
                  simply want to learn more about Billion Soul Harvest, our team is
                  here to help.
                </p>

                {/* Social Media Buttons */}
                <div className="flex flex-wrap" style={{ gap: "14px", marginTop: "8px" }}>
                  <a
                    href="https://www.facebook.com/BillionSoulHarvest/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-[family-name:var(--font-geist-mono)] text-white hover:bg-[#1ecdec] hover:border-[#1ecdec] hover:text-[#0a0a0a] transition-colors"
                    style={{
                      padding: "15px 26px",
                      border: "1px solid rgba(255,255,255,0.34)",
                      fontSize: "11.5px",
                      fontWeight: 500,
                      letterSpacing: "0.16em",
                      textDecoration: "none",
                      textTransform: "uppercase",
                    }}
                  >
                    Facebook
                  </a>
                  <a
                    href="https://www.instagram.com/billionsoul_/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-[family-name:var(--font-geist-mono)] text-white hover:bg-[#1ecdec] hover:border-[#1ecdec] hover:text-[#0a0a0a] transition-colors"
                    style={{
                      padding: "15px 26px",
                      border: "1px solid rgba(255,255,255,0.34)",
                      fontSize: "11.5px",
                      fontWeight: 500,
                      letterSpacing: "0.16em",
                      textDecoration: "none",
                      textTransform: "uppercase",
                    }}
                  >
                    Instagram
                  </a>
                  <a
                    href="https://www.youtube.com/@ghs2033"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-[family-name:var(--font-geist-mono)] text-white hover:bg-[#1ecdec] hover:border-[#1ecdec] hover:text-[#0a0a0a] transition-colors"
                    style={{
                      padding: "15px 26px",
                      border: "1px solid rgba(255,255,255,0.34)",
                      fontSize: "11.5px",
                      fontWeight: 500,
                      letterSpacing: "0.16em",
                      textDecoration: "none",
                      textTransform: "uppercase",
                    }}
                  >
                    YouTube
                  </a>
                </div>
              </div>

              {/* Right Column — Inline Contact Form */}
              <div>
                <InlineContactForm />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
