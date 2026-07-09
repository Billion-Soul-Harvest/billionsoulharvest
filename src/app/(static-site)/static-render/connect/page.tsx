import Link from "next/link";
import { ScrollReveal } from "../components/scroll-reveal";

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
      <section className="relative bg-[#0d223f] text-white py-24 md:py-32 overflow-hidden">
        <img
          src="/connect-hero-bg.webp"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(13,34,63,0.95) 20%, rgba(13,34,63,0.7) 100%)",
          }}
        />
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 relative z-10">
          <span className="text-[#a9edff] text-xs font-semibold font-[family-name:var(--font-geist-sans)] uppercase tracking-widest">
            Connect
          </span>
          <h1 className="font-[family-name:var(--font-jakarta)] text-4xl md:text-[56px] md:leading-[64px] font-bold mt-4 mb-6 tracking-[-0.02em]">
            Join the Movement
          </h1>
          <p className="font-[family-name:var(--font-jakarta)] text-lg md:text-xl leading-8 text-white/80 max-w-3xl">
            The Great Commission is too great for any one church, ministry, or
            nation to fulfill alone. We believe God is calling His people to work
            together in unity for the greatest harvest in history.
          </p>
          <p className="font-[family-name:var(--font-jakarta)] text-lg md:text-xl leading-8 text-white/80 max-w-3xl mt-4">
            Whether you are a pastor, missionary, ministry leader, church,
            organization, or believer with a heart for the nations, we invite you
            to become part of the Billion Soul Harvest movement.
          </p>
        </div>
      </section>

      {/* Ways to Connect */}
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

      {/* Contact Us */}
      <section className="py-20 md:py-[100px] bg-white">
        <div className="max-w-[900px] mx-auto px-4 md:px-8 text-center">
          <ScrollReveal direction="none">
            <h2 className="font-[family-name:var(--font-jakarta)] text-3xl md:text-[40px] md:leading-[48px] font-bold text-[#0d223f] tracking-[-0.02em]">
              Contact Us
            </h2>
            <p className="font-[family-name:var(--font-jakarta)] text-lg leading-8 text-[#2a3a50] mt-4">
              We would love to hear from you.
            </p>
            <p className="font-[family-name:var(--font-jakarta)] text-lg leading-8 text-[#2a3a50] mt-2 max-w-2xl mx-auto">
              Whether you have a question, would like to partner with us, or
              simply want to learn more about Billion Soul Harvest, our team is
              here to help.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="mailto:info@billionsoulharvest.org"
                className="inline-flex items-center gap-2 bg-[#0d223f] text-white px-8 py-3 rounded-lg text-sm font-semibold font-[family-name:var(--font-geist-sans)] hover:scale-105 transition-transform shadow-lg"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                info@billionsoulharvest.org
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-[#00b8d4] text-white px-8 py-3 rounded-lg text-sm font-semibold font-[family-name:var(--font-geist-sans)] hover:scale-105 transition-transform shadow-lg shadow-[#00b8d4]/20"
              >
                Contact Form &rarr;
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
