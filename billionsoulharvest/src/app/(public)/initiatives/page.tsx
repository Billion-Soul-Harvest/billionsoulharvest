import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Initiatives — Billion Soul Harvest",
  description: "Discover the five global initiatives of Billion Soul Harvest.",
};

export default function InitiativesPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative py-28 sm:py-36 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1920&q=80"
          alt=""
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f2744]/85 via-[#0f2744]/75 to-[#0f2744]/90" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <p className="text-[#29BDD6] text-xs font-semibold tracking-widest uppercase mb-4">Our Strategy</p>
          <h1 className="font-[family-name:var(--font-heading)] text-4xl sm:text-6xl font-bold text-white mb-6">
            Our Global Initiatives
          </h1>
          <p className="text-lg text-gray-200/80 max-w-2xl mx-auto leading-relaxed">
            Five strategic initiatives working together to accelerate the fulfillment
            of the Great Commission through evangelism, discipleship, and multiplication.
          </p>
        </div>
      </section>

      {/* 1. Global & National Harvest Summits — white background */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#29BDD6]/10 rounded-full px-4 py-1.5 mb-4">
                <span className="text-[#D4A843] text-xs font-semibold">01</span>
              </div>
              <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-[#0f2744] mb-6">
                Global & National Harvest Summits
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  We bring Christian leaders together through both
                  <strong className="text-[#0f2744]"> Global Harvest Summits</strong> and <strong className="text-[#0f2744]">National Harvest Summits</strong> —
                  because the greatest harvest in history will require the greatest collaboration in history.
                </p>
              </div>
              <div className="mt-6 space-y-3">
                {[
                  "Inspire a renewed passion for the Great Commission",
                  "Unite Christian leaders across churches, ministries, and denominations",
                  "Equip leaders to evangelize, disciple, and multiply",
                  "Foster strategic partnerships for greater Kingdom impact",
                  "Mobilize the Church to reach every nation and every generation",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 text-gray-500 text-sm">
                    <svg className="w-5 h-5 text-[#29BDD6] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=960&q=80"
                alt="Global gathering of leaders"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. International Leadership Institute */}
      <section className="bg-[#0a1e38] py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden order-2 lg:order-1">
              <Image
                src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=960&q=80"
                alt="Leadership training and development"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a1e38]/50 to-transparent" />
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 bg-[#29BDD6]/10 rounded-full px-4 py-1.5 mb-4">
                <span className="text-[#D4A843] text-xs font-semibold">02</span>
              </div>
              <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-white mb-6">
                International Leadership Institute (ILI)
              </h2>
              <p className="text-gray-300 leading-relaxed mb-6">
                The leadership development and training ministry of BSH. ILI is built on the conviction
                that transformed leaders transform churches, and transformed churches transform communities and nations.
              </p>
              <div className="space-y-3">
                {[
                  { label: "Biblically Grounded", desc: "Rooted in God's Word" },
                  { label: "Spirit-Empowered", desc: "Led by the Holy Spirit" },
                  { label: "Kingdom-Minded", desc: "Committed to collaboration" },
                  { label: "Mission-Focused", desc: "Passionate about multiplication" },
                  { label: "Multiplying Leaders", desc: "Raising the next generation" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3 text-sm">
                    <svg className="w-5 h-5 text-[#29BDD6] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <span className="text-gray-300"><strong className="text-white">{item.label}</strong> — {item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Fanning the Flame — white background */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-[#29BDD6]/10 rounded-full px-4 py-1.5 mb-4">
              <span className="text-[#D4A843] text-xs font-semibold">03</span>
            </div>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl font-bold text-[#0f2744] mb-4">
              Fanning the Flame
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto italic">
              &ldquo;Fan into flame the gift of God&rdquo; — 2 Timothy 1:6
            </p>
          </div>

          {/* Three F's */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              {
                title: "Find",
                description: "We actively seek out anointed leaders, ministries, and Kingdom projects that demonstrate vision, integrity, and the potential for lasting Gospel impact.",
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                ),
              },
              {
                title: "Fuel",
                description: "We strategically invest in ministries and initiatives that align with the mission of BSH, providing the resources needed for leaders to fulfill God's calling.",
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                  </svg>
                ),
              },
              {
                title: "Finish",
                description: "We walk alongside leaders and ministries, encouraging long-term faithfulness so they can complete the work God has entrusted to them.",
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div key={item.title} className="bg-gray-50 border border-gray-100 rounded-2xl p-8 text-center hover:border-[#29BDD6]/30 hover:shadow-lg transition-all group">
                <div className="w-14 h-14 mx-auto mb-5 rounded-xl bg-[#29BDD6]/10 flex items-center justify-center text-[#29BDD6] group-hover:bg-[#29BDD6]/20 transition-colors">
                  {item.icon}
                </div>
                <h3 className="text-[#29BDD6] font-bold text-xl mb-3">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>

          {/* Two Tracks */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-6">
              <h3 className="text-[#0f2744] font-semibold mb-3">Kingdom Project Grants</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                We identify strategic Gospel initiatives around the world and provide financial support
                to ministries that demonstrate vision, accountability, and measurable Kingdom impact.
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-6">
              <h3 className="text-[#0f2744] font-semibold mb-3">Evangelist Sponsorship</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Through our One Account for One Evangelist initiative, partners can sponsor an evangelist
                with a monthly commitment of $100, enabling faithful servants to continue proclaiming Christ.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Billion Soul Care */}
      <section className="relative py-24 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1920&q=80"
          alt=""
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[#0a1e38]/90" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#29BDD6]/10 rounded-full px-4 py-1.5 mb-4">
                <span className="text-[#D4A843] text-xs font-semibold">04</span>
              </div>
              <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-white mb-6">
                Billion Soul Care
              </h2>
              <p className="text-gray-300 leading-relaxed mb-8">
                The compassion and mercy ministry of BSH. We believe the Gospel calls us not only to proclaim
                the Good News but also to care for those who are hurting.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Disaster Relief", icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                    </svg>
                  )},
                  { label: "Children & Families", icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                    </svg>
                  )},
                  { label: "Community Development", icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" />
                    </svg>
                  )},
                  { label: "Compassion Partnerships", icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.193-5.192a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                    </svg>
                  )},
                ].map((item) => (
                  <div key={item.label} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 text-center">
                    <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-[#29BDD6]/10 flex items-center justify-center text-[#29BDD6]">
                      {item.icon}
                    </div>
                    <p className="text-white text-sm font-medium">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-center">
              <p className="text-[#D4A843] font-semibold text-lg">
                Sharing the Gospel. Serving with Compassion. Transforming Lives.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Strategic Partnerships — white background */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=960&q=80"
                alt="Strategic collaboration"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 bg-[#29BDD6]/10 rounded-full px-4 py-1.5 mb-4">
                <span className="text-[#D4A843] text-xs font-semibold">05</span>
              </div>
              <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-[#0f2744] mb-6">
                Strategic Partnerships
              </h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                Rather than creating another organization, our desire is to strengthen what God is already doing
                by connecting people, sharing resources, and mobilizing the Church toward a common mission.
              </p>
              <div className="space-y-3">
                {[
                  "Advance the Great Commission together",
                  "Strengthen unity across the Body of Christ",
                  "Encourage strategic collaboration rather than competition",
                  "Share resources, ideas, and best practices",
                  "Mobilize leaders and ministries for greater Kingdom impact",
                  "Inspire the next generation to engage in God's global mission",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 text-gray-500 text-sm">
                    <svg className="w-5 h-5 text-[#29BDD6] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {item}
                  </div>
                ))}
              </div>
              <p className="text-[#D4A843] font-semibold mt-8">
                One Mission. One Kingdom. One Harvest.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
