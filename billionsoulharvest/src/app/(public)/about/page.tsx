import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About — Billion Soul Harvest",
  description: "Learn about the vision, mission, and history of Billion Soul Harvest.",
};

const leaders = [
  {
    name: "Dr. James Hwang",
    title: "Founder & Visionary",
    bio: "Dr. James Hwang is the Founder and Visionary of Billion Soul Harvest. With a lifelong passion for world evangelization and Kingdom collaboration, he established BSH to inspire and unite the global Church around the vision of seeing one billion souls reached with the Gospel by 2033.",
    initials: "JH",
  },
  {
    name: "Rev. Dr. Young Cho",
    title: "Global Director",
    bio: "Rev. Dr. Young Cho serves as the Global Director of Billion Soul Harvest, providing strategic leadership, developing international partnerships, and coordinating global initiatives that advance the mission of BSH across the nations.",
    initials: "YC",
  },
  {
    name: "Pastor Rick Warren",
    title: "Honorary Chairman",
    bio: "Founding Pastor, Saddleback Church. Founder, FINISHERS and Daily Hope. Pastor Rick Warren serves as the Honorary Chairman of Billion Soul Harvest, encouraging the movement's vision of global collaboration and the fulfillment of the Great Commission.",
    initials: "RW",
  },
];

const timeline = [
  { year: "Matthew 28", label: "The Great Commission", highlight: true },
  { year: "2,000 Years", label: "The Gospel advancing through every generation", highlight: false },
  { year: "", label: "Birth of Billion Soul Harvest Korea", highlight: true },
  { year: "2020", label: "Colorado Springs Global Summit", highlight: false },
  { year: "2022", label: "Colorado Springs Global Summit", highlight: false },
  { year: "2023", label: "Anyang, Korea Global Next Generation Summit", highlight: false },
  { year: "2024", label: "Pyeongchang Global Summit", highlight: false },
  { year: "2025", label: "Jeju Global Summit", highlight: false },
  { year: "2026", label: "Brazil Global Summit", highlight: true },
  { year: "2033", label: "One Billion Souls", highlight: true },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero with background image */}
      <section className="relative py-28 sm:py-36 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1920&q=80"
          alt=""
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f2744]/85 via-[#0f2744]/75 to-[#0f2744]/90" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <p className="text-[#29BDD6] text-xs font-semibold tracking-widest uppercase mb-4">About Us</p>
          <h1 className="font-[family-name:var(--font-heading)] text-4xl sm:text-6xl font-bold text-white mb-6">
            A Vision Born for<br />Such a Time as This
          </h1>
          <p className="text-lg text-gray-200/80 max-w-2xl mx-auto leading-relaxed">
            Uniting the Body of Christ for the greatest harvest in history.
          </p>
        </div>
      </section>

      {/* Our Story — white background */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <p className="text-[#D4A843] text-xs font-semibold tracking-widest uppercase mb-3">Our Story</p>
              <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-[#0f2744] mb-6">
                The Greatest Harvest Requires the Greatest Unity
              </h2>
              <div className="space-y-5 text-gray-700 leading-relaxed">
                <p>
                  As the world approaches the year 2033 — the 2,000th anniversary of Christ&apos;s death,
                  resurrection, and the birth of the Church — we believe God is calling His people to a renewed
                  commitment to the Great Commission.
                </p>
                <p>
                  Billion Soul Harvest was born from a simple yet compelling conviction: <strong className="text-[#0f2744]">the greatest harvest in
                  history will require the greatest unity in history.</strong>
                </p>
                <p className="text-gray-500">
                  No single church, denomination, ministry, or mission organization can fulfill the Great
                  Commission alone. But together, through prayer, humility, collaboration, and the power of the
                  Holy Spirit, the Body of Christ can make an unprecedented impact for the Kingdom of God.
                </p>
                <p className="text-gray-500">
                  From its beginning, Billion Soul Harvest has sought to bring Christian leaders together across
                  nations, generations, and traditions — not to build another organization, but to serve as a
                  catalyst for Kingdom collaboration.
                </p>
              </div>
            </div>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl lg:mt-12">
              <Image
                src="https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=960&q=80"
                alt="Leaders gathered in unity"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Quote block */}
          <div className="mt-16 text-center max-w-3xl mx-auto">
            <div className="border-l-4 border-[#D4A843] pl-6 py-4 text-left">
              <p className="text-[#0f2744] font-medium text-xl italic leading-relaxed">
                &ldquo;To unite the Body of Christ and help accelerate the fulfillment of the Great Commission —
                one soul, one church, one nation at a time.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Journey Timeline */}
      <section className="bg-[#0a1e38] py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[#D4A843] text-xs font-semibold tracking-widest uppercase mb-3">Our Journey</p>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl font-bold text-white">
              From Commission to Harvest
            </h2>
          </div>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-[#29BDD6]/40 via-[#29BDD6]/20 to-[#29BDD6]/40" />
            <div className="space-y-6">
              {timeline.map((item, i) => (
                <div key={i} className="relative flex items-start gap-6 ml-0">
                  {/* Dot */}
                  <div className={`absolute left-6 w-3 h-3 rounded-full -translate-x-1/2 mt-1.5 ring-4 ring-[#0a1e38] ${item.highlight ? "bg-[#29BDD6]" : "bg-white/30"}`} />
                  {/* Content */}
                  <div className="ml-12 pb-2">
                    {item.year && (
                      <p className={`font-bold text-sm mb-1 ${item.highlight ? "text-[#29BDD6]" : "text-white/60"}`}>{item.year}</p>
                    )}
                    <p className="text-gray-300 text-sm leading-relaxed">{item.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Leadership — white background */}
      <section className="bg-white py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[#D4A843] text-xs font-semibold tracking-widest uppercase mb-3">Our Leadership</p>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl font-bold text-[#0f2744] mb-4">
              Led by a Global Vision
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Billion Soul Harvest is led by a diverse team of Christian leaders from around the world
              who are united by a shared commitment to the Great Commission.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {leaders.map((leader) => (
              <div
                key={leader.name}
                className="bg-gray-50 border border-gray-100 rounded-2xl p-8 text-center hover:border-[#29BDD6]/30 hover:shadow-lg transition-all"
              >
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#29BDD6]/20 to-[#29BDD6]/5 flex items-center justify-center mx-auto mb-5 ring-2 ring-[#29BDD6]/20">
                  <span className="text-[#29BDD6] font-bold text-2xl">{leader.initials}</span>
                </div>
                <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[#0f2744] mb-1">
                  {leader.name}
                </h3>
                <p className="text-[#29BDD6] text-sm font-medium mb-4">{leader.title}</p>
                <p className="text-gray-500 text-sm leading-relaxed">{leader.bio}</p>
              </div>
            ))}
          </div>

          {/* Global Leadership Team + Advisory Council */}
          <div className="grid md:grid-cols-2 gap-6 mt-10">
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-8">
              <div className="w-12 h-12 mb-4 rounded-xl bg-[#29BDD6]/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-[#29BDD6]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
              <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold text-[#0f2744] mb-3">
                Global Leadership Team
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                BSH is supported by an expanding network of regional and national leaders
                who represent churches, ministries, denominations, mission organizations, and strategic
                partners across the world.
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-8">
              <div className="w-12 h-12 mb-4 rounded-xl bg-[#29BDD6]/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-[#29BDD6]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold text-[#0f2744] mb-3">
                Advisory Council
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                The Advisory Council consists of respected Christian leaders from around the world who
                provide wisdom, encouragement, and strategic guidance to the BSH movement.
              </p>
              <p className="text-gray-400 text-xs mt-3 italic">
                Members will be announced as they are confirmed.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
