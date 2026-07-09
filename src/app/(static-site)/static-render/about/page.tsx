import Link from "next/link";
import { ScrollReveal } from "../components/scroll-reveal";

export default function AboutPage() {
  const timeline = [
    {
      label: "The Great Commission",
      desc: "Matthew 28",
    },
    {
      label: "2,000 Years of Church History",
      desc: "The Gospel advancing through every generation",
    },
    {
      label: "Birth of Billion Soul Harvest Korea",
      desc: "A vision to unite the Body of Christ for the greatest harvest in history",
    },
    {
      label: "Launch of Global and National Summits",
      desc: "Gathering leaders across nations for vision, unity, and mobilization",
    },
    { label: "2020", desc: "Colorado Springs Global Summit" },
    { label: "2022", desc: "Colorado Springs Global Summit" },
    { label: "2023", desc: "Anyang, Korea Global Next Generation Summit" },
    { label: "2024", desc: "Pyeongchang Global Summit" },
    { label: "2025", desc: "Jeju Global Summit" },
    { label: "2026", desc: "Brazil Global Summit" },
    { label: "2033", desc: "One Billion Souls", highlight: true },
  ];

  const leaders = [
    {
      role: "Founder & Visionary",
      name: "Dr. James Hwang",
      photo: null,
      bio: "Dr. James Hwang is the Founder and Visionary of Billion Soul Harvest. With a lifelong passion for world evangelization and Kingdom collaboration, he established BSH to inspire and unite the global Church around the vision of seeing one billion souls reached with the Gospel by 2033.",
      link: null,
      linkLabel: null,
    },
    {
      role: "Global Director",
      name: "Rev. Dr. Young Cho",
      photo: "/leader-young-cho.jpg",
      bio: "Rev. Dr. Young Cho serves as the Global Director of Billion Soul Harvest, providing strategic leadership, developing international partnerships, and coordinating global initiatives that advance the mission of BSH across the nations.",
      link: "/young-cho",
      linkLabel: "View Portfolio",
    },
    {
      role: "Honorary Chairman",
      name: "Pastor Rick Warren",
      photo: "/leader-rick-warren.jpg",
      subtitle:
        "Founding Pastor, Saddleback Church \u00B7 Founder, FINISHERS and Daily Hope",
      bio: "Pastor Rick Warren serves as the Honorary Chairman of Billion Soul Harvest, encouraging the movement\u2019s vision of global collaboration and the fulfillment of the Great Commission.",
      link: null,
      linkLabel: null,
    },
  ];

  return (
    <div>
      {/* ── Hero ── */}
      <section id="our-story" className="relative bg-[#0d223f] text-white py-24 md:py-32 overflow-hidden scroll-mt-20">
        <img src="/about-hero-bg.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(13,34,63,0.95) 20%, rgba(13,34,63,0.7) 100%)" }} />
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 relative z-10">
          <span className="text-[#a9edff] text-xs font-semibold font-[family-name:var(--font-geist-sans)] uppercase tracking-widest">
            Our Story
          </span>
          <h1 className="font-[family-name:var(--font-jakarta)] text-4xl md:text-[56px] md:leading-[64px] font-bold mt-4 mb-6 tracking-[-0.02em]">
            A Vision Born for Such a Time as This
          </h1>
          <p className="font-[family-name:var(--font-jakarta)] text-lg md:text-xl leading-8 text-white/80 max-w-3xl">
            As the world approaches the year 2033&mdash;the 2,000th anniversary
            of Christ&apos;s death, resurrection, and the birth of the
            Church&mdash;we believe God is calling His people to a renewed
            commitment to the Great Commission.
          </p>
        </div>
      </section>

      {/* ── Our Story Content ── */}
      <section className="py-20 md:py-[100px] bg-[#f9f9ff]">
        <div className="max-w-[800px] mx-auto px-4 md:px-8">
          <ScrollReveal direction="none">
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
                a catalyst for Kingdom collaboration.
              </p>
              <p>
                Through global gatherings, leadership development, ministry
                partnerships, and strategic ministries, BSH exists to encourage,
                equip, and mobilize believers for evangelism, discipleship, and
                multiplication.
              </p>
              <p>
                Today, Billion Soul Harvest is a{" "}
                <strong className="text-[#0d223f]">
                  registered non-profit organization in the Republic of Korea
                </strong>
                , with its name and identity legally protected through registered
                trademarks and copyright. These legal foundations help preserve the
                integrity of the movement while supporting its continued growth and
                global ministry.
              </p>
              <p>Our vision is bold, but our calling is simple:</p>
              <blockquote className="border-l-4 border-[#00b8d4] pl-6 py-2 my-8 bg-[#e7f9fc] rounded-r-lg">
                <p className="font-[family-name:var(--font-jakarta)] text-xl md:text-2xl leading-9 font-semibold text-[#0d223f]">
                  To unite the Body of Christ and help accelerate the fulfillment
                  of the Great Commission&mdash;one soul, one church, one nation at
                  a time.
                </p>
              </blockquote>
              <p>
                The story of Billion Soul Harvest is still being written.
              </p>
              <p className="font-semibold text-[#0d223f]">
                We invite you to become part of it.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Our Journey Timeline ── */}
      <section id="our-journey" className="py-20 md:py-[100px] bg-[#0d223f] relative overflow-hidden scroll-mt-20">
        {/* Decorative background */}
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

          {/* Timeline */}
          <div className="relative max-w-3xl mx-auto">
            {/* Vertical line with glow */}
            <div className="absolute left-[19px] md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#00b8d4] via-[#a9edff]/40 to-[#00b8d4]" />
            <div className="absolute left-[17px] md:left-[calc(50%-2px)] top-0 bottom-0 w-[5px] bg-gradient-to-b from-[#00b8d4]/20 via-[#a9edff]/10 to-[#00b8d4]/20 blur-sm" />

            <div className="space-y-8 md:space-y-12">
              {timeline.map((item, i) => (
                <div
                  key={i}
                  className={`relative flex items-start gap-6 md:gap-0 ${
                    i % 2 === 0
                      ? "md:flex-row"
                      : "md:flex-row-reverse"
                  }`}
                >
                  {/* Dot */}
                  <div
                    className={`absolute left-[12px] md:left-1/2 md:-translate-x-1/2 top-1 z-10 w-[16px] h-[16px] rounded-full border-[3px] transition-all ${
                      item.highlight
                        ? "bg-[#00b8d4] border-[#00b8d4] shadow-lg shadow-[#00b8d4]/50"
                        : "bg-[#0d223f] border-[#00b8d4]/70"
                    }`}
                  />

                  {/* Content */}
                  <div className="ml-10 md:ml-0 md:w-[calc(50%-32px)]">
                    <div
                      className={`p-5 rounded-xl border backdrop-blur-sm transition-all duration-300 ${
                        item.highlight
                          ? "bg-[#00b8d4]/20 border-[#00b8d4]/50 shadow-lg shadow-[#00b8d4]/10"
                          : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-[#a9edff]/30"
                      }`}
                    >
                      <h4
                        className={`font-[family-name:var(--font-jakarta)] text-base font-bold ${
                          item.highlight ? "text-[#a9edff]" : "text-white"
                        }`}
                      >
                        {item.label}
                      </h4>
                      <p
                        className={`font-[family-name:var(--font-jakarta)] text-sm mt-1 ${
                          item.highlight
                            ? "text-white/90"
                            : "text-white/60"
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

      {/* ── Leadership ── */}
      <section id="our-leadership" className="py-20 md:py-[100px] bg-[#f0f3ff] scroll-mt-20">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="text-[#00b8d4] text-xs font-semibold font-[family-name:var(--font-geist-sans)] uppercase tracking-widest">
                Our Leadership
              </span>
              <h2 className="font-[family-name:var(--font-jakarta)] text-3xl md:text-[40px] md:leading-[48px] font-bold text-[#0d223f] mt-4 tracking-[-0.02em]">
                Our Leadership
              </h2>
              <p className="font-[family-name:var(--font-jakarta)] text-lg leading-7 text-[#44474d] mt-4 max-w-2xl mx-auto">
                Billion Soul Harvest is led by a diverse team of Christian leaders
                from around the world who are united by a shared commitment to the
                Great Commission.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100}>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
            {leaders.map((leader) => (
              <div
                key={leader.name}
                className="bg-white rounded-2xl border border-[#b4c7ec]/30 p-8 flex flex-col hover:shadow-lg hover:border-[#00b8d4]/30 transition-all duration-300"
              >
                {/* Avatar */}
                {leader.photo ? (
                  <img
                    src={leader.photo}
                    alt={leader.name}
                    className="w-20 h-20 rounded-full object-cover mb-6 border-2 border-[#b4c7ec]/30"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-[#0d223f] flex items-center justify-center mb-6">
                    <span className="font-[family-name:var(--font-jakarta)] text-2xl font-bold text-[#a9edff]">
                      {leader.name
                        .replace(/^(Dr\.|Rev\.|Pastor)\s*/g, "")
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                )}
                <span className="text-[#00b8d4] text-xs font-semibold font-[family-name:var(--font-geist-sans)] uppercase tracking-widest">
                  {leader.role}
                </span>
                <h3 className="font-[family-name:var(--font-jakarta)] text-xl font-bold text-[#0d223f] mt-2 mb-1">
                  {leader.name}
                </h3>
                {leader.subtitle && (
                  <p className="text-xs text-[#44474d] mb-3">
                    {leader.subtitle}
                  </p>
                )}
                <p className="font-[family-name:var(--font-jakarta)] text-sm leading-6 text-[#44474d] flex-1 mt-2">
                  {leader.bio}
                </p>
                {leader.link && (
                  <a
                    href={leader.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-1 text-[#00b8d4] text-sm font-semibold font-[family-name:var(--font-geist-sans)] hover:underline"
                  >
                    {leader.linkLabel} &rarr;
                  </a>
                )}
              </div>
            ))}
          </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Global Leadership Team ── */}
      <section className="py-20 md:py-[100px] bg-white">
        <ScrollReveal direction="none">
          <div className="max-w-[800px] mx-auto px-4 md:px-8 text-center">
            <h2 className="font-[family-name:var(--font-jakarta)] text-3xl md:text-[40px] md:leading-[48px] font-bold text-[#0d223f] tracking-[-0.02em]">
              Our Global Leadership Team
            </h2>
            <p className="font-[family-name:var(--font-jakarta)] text-lg leading-7 text-[#44474d] mt-4 max-w-2xl mx-auto">
              Billion Soul Harvest is supported by an expanding network of
              regional and national leaders who represent churches, ministries,
              denominations, mission organizations, and strategic partners across
              the world. Together, they provide leadership, foster collaboration,
              and help advance the vision of Billion Soul Harvest within their
              regions and spheres of influence.
            </p>
            <Link
              href="/leadership"
              className="mt-8 inline-flex items-center gap-2 bg-[#00b8d4] text-white px-8 py-3 rounded-lg text-sm font-semibold font-[family-name:var(--font-geist-sans)] hover:scale-105 transition-transform shadow-lg shadow-[#00b8d4]/20"
            >
              Meet Our Global Leaders &rarr;
            </Link>
          </div>
        </ScrollReveal>
      </section>

      {/* ── Advisory Council ── */}
      <section id="advisory-council" className="py-16 md:py-20 bg-[#f9f9ff] scroll-mt-20">
        <ScrollReveal direction="none">
          <div className="max-w-[800px] mx-auto px-4 md:px-8 text-center">
            <h2 className="font-[family-name:var(--font-jakarta)] text-2xl md:text-3xl font-bold text-[#0d223f] tracking-[-0.02em]">
              Advisory Council
            </h2>
            <p className="font-[family-name:var(--font-jakarta)] text-lg leading-7 text-[#44474d] mt-4">
              The Advisory Council consists of respected Christian leaders from
              around the world who provide wisdom, encouragement, and strategic
              guidance to the Billion Soul Harvest movement.
            </p>
            <p className="font-[family-name:var(--font-jakarta)] text-sm text-[#44474d]/70 italic mt-4">
              Advisory Council members will be announced as they are confirmed.
            </p>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
