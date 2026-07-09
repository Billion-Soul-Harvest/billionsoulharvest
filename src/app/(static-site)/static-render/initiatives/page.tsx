import Link from "next/link";
import { ScrollReveal } from "../components/scroll-reveal";

const summitBullets = [
  "Inspire a renewed passion for the Great Commission.",
  "Unite Christian leaders across churches, ministries, and denominations.",
  "Equip leaders to evangelize, disciple, and multiply.",
  "Foster strategic partnerships for greater Kingdom impact.",
  "Mobilize the Church to reach every nation and every generation.",
];

const iliTraits = [
  {
    label: "Biblically Grounded",
    desc: "Rooted in God\u2019s Word and faithful to Christ.",
  },
  {
    label: "Spirit-Empowered",
    desc: "Led by the Holy Spirit in life and ministry.",
  },
  {
    label: "Kingdom-Minded",
    desc: "Committed to collaboration across the Body of Christ.",
  },
  {
    label: "Mission-Focused",
    desc: "Passionate about evangelism, discipleship, and multiplication.",
  },
  {
    label: "Multiplying Leaders",
    desc: "Investing in others to raise the next generation of disciple-makers.",
  },
];

const threeFs = [
  {
    title: "Find",
    desc: "We actively seek out anointed leaders, ministries, and Kingdom projects that demonstrate vision, integrity, and the potential for lasting Gospel impact. Every proposal is carefully reviewed through a prayerful due diligence process and evaluated by qualified committees to ensure faithful stewardship.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    ),
  },
  {
    title: "Fuel",
    desc: "Once approved, we strategically invest in ministries and initiatives that align with the mission of Billion Soul Harvest. Our desire is not simply to fund projects, but to fuel Kingdom multiplication by providing the resources needed for leaders to fulfill God\u2019s calling.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
      </svg>
    ),
  },
  {
    title: "Finish",
    desc: "We walk alongside leaders and ministries, encouraging long-term faithfulness so they can complete the work God has entrusted to them and leave a lasting Kingdom legacy.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
      </svg>
    ),
  },
];

const careAreas = [
  {
    label: "Disaster Relief",
    desc: "Responding to natural disasters and humanitarian crises.",
  },
  {
    label: "Children & Families",
    desc: "Supporting vulnerable children and strengthening families through strategic partnerships.",
  },
  {
    label: "Community Development",
    desc: "Encouraging sustainable solutions that bring hope and dignity.",
  },
  {
    label: "Compassion Partnerships",
    desc: "Working alongside churches and ministry organizations to extend Christ\u2019s love through practical service.",
  },
];

const partnerBullets = [
  "Advance the Great Commission together.",
  "Strengthen unity across the Body of Christ.",
  "Encourage strategic collaboration rather than competition.",
  "Share resources, ideas, and best practices.",
  "Mobilize leaders and ministries for greater Kingdom impact.",
  "Inspire the next generation to engage in God\u2019s global mission.",
];

export default function InitiativesPage() {
  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative bg-[#0d223f] text-white py-24 md:py-32 overflow-hidden">
        <img src="/initiatives-hero-bg.webp" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(13,34,63,0.95) 20%, rgba(13,34,63,0.7) 100%)" }} />
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 relative z-10">
          <span className="text-[#a9edff] text-xs font-semibold font-[family-name:var(--font-geist-sans)] uppercase tracking-widest">
            Our Ministries
          </span>
          <h1 className="font-[family-name:var(--font-jakarta)] text-4xl md:text-[56px] md:leading-[64px] font-bold mt-4 mb-6 tracking-[-0.02em]">
            Initiatives
          </h1>
        </div>
      </section>

      {/* ── 1. Global & National Harvest Summits ── */}
      <section
        id="summits"
        className="py-20 md:py-[100px] bg-[#f9f9ff] scroll-mt-20"
      >
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            {/* Left — content */}
            <ScrollReveal direction="left">
            <div>
              <span className="text-[#00b8d4] text-xs font-semibold font-[family-name:var(--font-geist-sans)] uppercase tracking-widest">
                Initiative 01
              </span>
              <h2 className="font-[family-name:var(--font-jakarta)] text-3xl md:text-[40px] md:leading-[48px] font-bold text-[#0d223f] mt-3 mb-6 tracking-[-0.02em]">
                Global &amp; National Harvest Summits
              </h2>
              <div className="space-y-4 font-[family-name:var(--font-jakarta)] text-[17px] leading-8 text-[#2a3a50]">
                <p>
                  Billion Soul Harvest believes that the greatest harvest in
                  history will require the greatest collaboration in history.
                  That is why we bring Christian leaders together through both{" "}
                  <strong className="text-[#0d223f]">
                    Global Harvest Summits
                  </strong>{" "}
                  and{" "}
                  <strong className="text-[#0d223f]">
                    National Harvest Summits
                  </strong>
                  .
                </p>
                <p>
                  <strong className="text-[#0d223f]">
                    Global Harvest Summits
                  </strong>{" "}
                  unite pastors, ministry leaders, missionaries, churches, and
                  Kingdom partners from many nations to seek God&apos;s
                  direction, strengthen relationships, and inspire worldwide
                  collaboration for the fulfillment of the Great Commission.
                </p>
                <p>
                  <strong className="text-[#0d223f]">
                    National Harvest Summits
                  </strong>{" "}
                  carry that same vision into individual countries, equipping and
                  mobilizing local churches and leaders to work together in
                  reaching their own communities and nation with the Gospel.
                </p>
              </div>
            </div>
            </ScrollReveal>

            {/* Right — why we gather + bullets */}
            <ScrollReveal direction="right" delay={200}>
            <div>
              <div className="bg-white rounded-2xl border border-[#b4c7ec]/30 p-8">
                <h3 className="font-[family-name:var(--font-jakarta)] text-lg font-bold text-[#0d223f] mb-3">
                  Why do we gather?
                </h3>
                <p className="font-[family-name:var(--font-jakarta)] text-[15px] leading-7 text-[#2a3a50] mb-6">
                  Because we believe that when the Body of Christ comes together
                  in worship, prayer, unity, and shared vision, God releases
                  fresh passion, greater collaboration, and renewed momentum for
                  His mission.
                </p>
                <p className="font-[family-name:var(--font-jakarta)] text-[15px] leading-7 text-[#2a3a50] mb-4">
                  Our summits are more than conferences&mdash;they are catalytic
                  gatherings designed to:
                </p>
                <ul className="space-y-3">
                  {summitBullets.map((b) => (
                    <li key={b} className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-[#00b8d4] shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="font-[family-name:var(--font-jakarta)] text-sm text-[#2a3a50]">
                        {b}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <blockquote className="border-l-4 border-[#00b8d4] pl-6 py-3 mt-8 bg-[#e7f9fc] rounded-r-lg">
                <p className="font-[family-name:var(--font-jakarta)] text-base font-semibold text-[#0d223f]">
                  Every summit has one purpose: to gather God&apos;s people for
                  vision so they can return to their communities, churches, and
                  nations ready to make disciples and advance God&apos;s Kingdom.
                </p>
              </blockquote>

              <p className="font-[family-name:var(--font-jakarta)] text-lg font-bold text-[#0d223f] mt-6">
                Gather for Vision. Scatter for Harvest. Unite for the Kingdom.
              </p>
            </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── 2. International Leadership Institute ── */}
      <section
        id="ili"
        className="py-20 md:py-[100px] bg-[#0d223f] text-white relative overflow-hidden scroll-mt-20"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#00b8d4]/5 rounded-full blur-[160px]" />
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 relative z-10">
          <ScrollReveal direction="none">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <span className="text-[#a9edff] text-xs font-semibold font-[family-name:var(--font-geist-sans)] uppercase tracking-widest">
              Initiative 02
            </span>
            <h2 className="font-[family-name:var(--font-jakarta)] text-3xl md:text-[40px] md:leading-[48px] font-bold mt-3 mb-6 tracking-[-0.02em]">
              International Leadership Institute (ILI)
            </h2>
            <p className="font-[family-name:var(--font-jakarta)] text-lg leading-8 text-white/80">
              The International Leadership Institute (ILI) is the leadership
              development and training ministry of Billion Soul Harvest. It
              exists to equip pastors, evangelists, missionaries, ministry
              leaders, and emerging leaders to fulfill the Great Commission
              through biblical leadership, evangelism, discipleship, and
              multiplication.
            </p>
          </div>
          </ScrollReveal>

          <p className="font-[family-name:var(--font-jakarta)] text-base leading-7 text-white/70 text-center max-w-2xl mx-auto mb-6">
            While Global and National Harvest Summits inspire and mobilize the
            Church, the International Leadership Institute provides practical
            training that equips leaders to return to their churches,
            ministries, and communities with greater vision, skills, and Kingdom
            effectiveness.
          </p>
          <p className="font-[family-name:var(--font-jakarta)] text-base leading-7 text-white/70 text-center max-w-2xl mx-auto mb-12">
            ILI is built on the conviction that transformed leaders transform
            churches, and transformed churches transform communities and
            nations.
          </p>

          {/* Trait cards */}
          <ScrollReveal delay={100}>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
            {iliTraits.map((t) => (
              <div
                key={t.label}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 hover:border-[#a9edff]/30 transition-all duration-300"
              >
                <h4 className="font-[family-name:var(--font-jakarta)] text-base font-bold text-white mb-2">
                  {t.label}
                </h4>
                <p className="font-[family-name:var(--font-jakarta)] text-sm text-white/60">
                  {t.desc}
                </p>
              </div>
            ))}
          </div>
          </ScrollReveal>

          <div className="text-center mt-12">
            <p className="font-[family-name:var(--font-jakarta)] text-base text-white/70 max-w-2xl mx-auto mb-6">
              Our goal is not simply to train better leaders, but to raise
              Kingdom leaders who will multiply their influence and help prepare
              the Church for the greatest harvest in history.
            </p>
            <p className="font-[family-name:var(--font-jakarta)] text-lg font-bold text-[#a9edff]">
              Equipping Leaders. Multiplying Disciple-Makers. Advancing the
              Great Commission.
            </p>
          </div>
        </div>
      </section>

      {/* ── 3. Fanning the Flame ── */}
      <section
        id="fanning-the-flame"
        className="py-20 md:py-[100px] bg-white scroll-mt-20"
      >
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <ScrollReveal>
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="text-[#00b8d4] text-xs font-semibold font-[family-name:var(--font-geist-sans)] uppercase tracking-widest">
              Initiative 03
            </span>
            <h2 className="font-[family-name:var(--font-jakarta)] text-3xl md:text-[40px] md:leading-[48px] font-bold text-[#0d223f] mt-3 mb-6 tracking-[-0.02em]">
              Fanning the Flame
            </h2>
            <p className="font-[family-name:var(--font-jakarta)] text-lg leading-8 text-[#2a3a50]">
              <strong className="text-[#0d223f]">Fanning the Flame</strong> is
              the strategic funding and mobilization ministry of Billion Soul
              Harvest. Its purpose is to identify, strengthen, and sustain
              Kingdom initiatives that have the potential to make a significant
              impact for the Great Commission.
            </p>
            <p className="font-[family-name:var(--font-jakarta)] text-base leading-7 text-[#44474d] mt-4">
              Inspired by God&apos;s call to &ldquo;fan into flame the gift of
              God&rdquo; (2 Timothy 1:6), this ministry exists to help ignite
              vision, empower leaders, and accelerate Gospel-centered ministry
              around the world.
            </p>
          </div>
          </ScrollReveal>

          {/* Three F's */}
          <ScrollReveal delay={100}>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16">
            {threeFs.map((f) => (
              <div
                key={f.title}
                className="text-center bg-[#f9f9ff] rounded-2xl border border-[#b4c7ec]/30 p-8 hover:shadow-lg hover:border-[#00b8d4]/30 transition-all duration-300"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#0d223f] text-[#a9edff] mb-5">
                  {f.icon}
                </div>
                <h3 className="font-[family-name:var(--font-jakarta)] text-xl font-bold text-[#0d223f] mb-3">
                  {f.title}
                </h3>
                <p className="font-[family-name:var(--font-jakarta)] text-sm leading-6 text-[#44474d]">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
          </ScrollReveal>

          {/* Two Strategic Tracks */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-[#f0f3ff] rounded-2xl border border-[#b4c7ec]/30 p-8">
              <h3 className="font-[family-name:var(--font-jakarta)] text-lg font-bold text-[#0d223f] mb-3">
                Kingdom Project Grants
              </h3>
              <p className="font-[family-name:var(--font-jakarta)] text-sm leading-6 text-[#44474d]">
                Through a thoughtful application and review process, we identify
                strategic Gospel initiatives around the world and provide
                financial support to ministries that demonstrate vision,
                accountability, and measurable Kingdom impact.
              </p>
            </div>
            <div className="bg-[#f0f3ff] rounded-2xl border border-[#b4c7ec]/30 p-8">
              <h3 className="font-[family-name:var(--font-jakarta)] text-lg font-bold text-[#0d223f] mb-3">
                Evangelist Sponsorship
              </h3>
              <p className="font-[family-name:var(--font-jakarta)] text-sm leading-6 text-[#44474d] mb-4">
                We believe every evangelist should have the opportunity to focus
                on sharing the Gospel without being hindered by a lack of basic
                support.
              </p>
              <p className="font-[family-name:var(--font-jakarta)] text-sm leading-6 text-[#44474d]">
                Through our{" "}
                <strong className="text-[#0d223f]">
                  One Account for One Evangelist
                </strong>{" "}
                initiative, individuals, churches, and ministry partners can
                sponsor an evangelist with a monthly commitment of{" "}
                <strong className="text-[#0d223f]">$100</strong>. Each
                sponsorship provides practical encouragement and financial
                support, enabling faithful servants to continue proclaiming
                Christ and making disciples in their communities and beyond.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="font-[family-name:var(--font-jakarta)] text-base text-[#44474d] max-w-2xl mx-auto mb-4">
              Together, we are not simply funding ministry&mdash;we are{" "}
              <strong className="text-[#0d223f]">finding</strong>,{" "}
              <strong className="text-[#0d223f]">fueling</strong>, and{" "}
              <strong className="text-[#0d223f]">finishing</strong> the work of
              the Great Commission.
            </p>
            <p className="font-[family-name:var(--font-jakarta)] text-lg font-bold text-[#0d223f]">
              Find the Vision. Fuel the Mission. Finish the Great Commission.
            </p>
          </div>
        </div>
      </section>

      {/* ── 4. Billion Soul Care ── */}
      <section
        id="billion-soul-care"
        className="py-20 md:py-[100px] bg-[#f0f3ff] scroll-mt-20"
      >
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <ScrollReveal>
          <div className="max-w-3xl mx-auto text-center mb-12">
            <span className="text-[#00b8d4] text-xs font-semibold font-[family-name:var(--font-geist-sans)] uppercase tracking-widest">
              Initiative 04
            </span>
            <h2 className="font-[family-name:var(--font-jakarta)] text-3xl md:text-[40px] md:leading-[48px] font-bold text-[#0d223f] mt-3 mb-6 tracking-[-0.02em]">
              Billion Soul Care
            </h2>
            <p className="font-[family-name:var(--font-jakarta)] text-lg leading-8 text-[#2a3a50]">
              <strong className="text-[#0d223f]">Billion Soul Care</strong> is
              the compassion and mercy ministry of Billion Soul Harvest. It
              exists to demonstrate the love of Christ through practical care,
              humanitarian assistance, and strategic partnerships that bring hope
              to people in need.
            </p>
            <p className="font-[family-name:var(--font-jakarta)] text-base leading-7 text-[#44474d] mt-4">
              We believe the Gospel calls us not only to proclaim the Good News
              but also to care for those who are hurting. Through acts of
              compassion, we seek to reflect the heart of Jesus while opening
              doors for the transforming power of the Gospel.
            </p>
            <p className="font-[family-name:var(--font-jakarta)] text-base leading-7 text-[#44474d] mt-4">
              Billion Soul Care partners with churches, ministries, and trusted
              organizations to respond to both urgent needs and long-term
              community development. Rather than duplicating existing efforts, we
              seek to strengthen and support those already serving faithfully on
              the front lines.
            </p>
          </div>
          </ScrollReveal>

          {/* Areas of focus */}
          <ScrollReveal delay={100}>
          <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto mb-12">
            {careAreas.map((a) => (
              <div
                key={a.label}
                className="bg-white rounded-xl border border-[#b4c7ec]/30 p-6 hover:shadow-md hover:border-[#00b8d4]/30 transition-all duration-300"
              >
                <h4 className="font-[family-name:var(--font-jakarta)] text-base font-bold text-[#0d223f] mb-2">
                  {a.label}
                </h4>
                <p className="font-[family-name:var(--font-jakarta)] text-sm leading-6 text-[#44474d]">
                  {a.desc}
                </p>
              </div>
            ))}
          </div>
          </ScrollReveal>

          <div className="text-center">
            <p className="font-[family-name:var(--font-jakarta)] text-base text-[#44474d] max-w-2xl mx-auto mb-4">
              Every act of compassion is an opportunity to demonstrate
              God&apos;s love and point people to the hope found in Jesus
              Christ.
            </p>
            <p className="font-[family-name:var(--font-jakarta)] text-lg font-bold text-[#0d223f]">
              Sharing the Gospel. Serving with Compassion. Transforming Lives.
            </p>
          </div>
        </div>
      </section>

      {/* ── 5. Strategic Partnerships ── */}
      <section
        id="strategic-partnerships"
        className="py-20 md:py-[100px] bg-[#0d223f] text-white relative overflow-hidden scroll-mt-20"
      >
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#00b8d4]/5 rounded-full blur-[140px]" />
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 relative z-10">
          <ScrollReveal direction="none">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <span className="text-[#a9edff] text-xs font-semibold font-[family-name:var(--font-geist-sans)] uppercase tracking-widest">
              Initiative 05
            </span>
            <h2 className="font-[family-name:var(--font-jakarta)] text-3xl md:text-[40px] md:leading-[48px] font-bold mt-3 mb-6 tracking-[-0.02em]">
              Strategic Partnerships
            </h2>
            <p className="font-[family-name:var(--font-jakarta)] text-lg leading-8 text-white/80">
              At Billion Soul Harvest, we believe that the fulfillment of the
              Great Commission will require unprecedented collaboration across
              the Body of Christ.
            </p>
            <p className="font-[family-name:var(--font-jakarta)] text-base leading-7 text-white/60 mt-4">
              No single church, denomination, ministry, mission organization, or
              network can accomplish this mission alone. But together, through
              humility, trust, and a shared commitment to God&apos;s Kingdom, we
              can make a far greater impact.
            </p>
            <p className="font-[family-name:var(--font-jakarta)] text-base leading-7 text-white/60 mt-4">
              Strategic Partnerships is the collaborative ministry of Billion
              Soul Harvest. We exist to build meaningful relationships with
              churches, ministries, mission organizations, Christian networks,
              educational institutions, and Kingdom leaders who share a passion
              for evangelism, discipleship, and multiplication.
            </p>
            <p className="font-[family-name:var(--font-jakarta)] text-base leading-7 text-white/60 mt-4">
              Rather than creating another organization, our desire is to
              strengthen what God is already doing by connecting people, sharing
              resources, encouraging collaboration, and mobilizing the Church
              toward a common mission.
            </p>
          </div>
          </ScrollReveal>

          {/* Partner bullets */}
          <ScrollReveal delay={100}>
          <div className="max-w-2xl mx-auto mb-12">
            <h3 className="font-[family-name:var(--font-jakarta)] text-lg font-bold text-white mb-6 text-center">
              We Partner To:
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {partnerBullets.map((b) => (
                <div
                  key={b}
                  className="flex items-start gap-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4"
                >
                  <svg
                    className="w-5 h-5 text-[#00b8d4] shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="font-[family-name:var(--font-jakarta)] text-sm text-white/80">
                    {b}
                  </span>
                </div>
              ))}
            </div>
          </div>
          </ScrollReveal>

          <div className="text-center">
            <p className="font-[family-name:var(--font-jakarta)] text-base text-white/70 max-w-2xl mx-auto mb-4">
              Whether through Global Harvest Summits, the International
              Leadership Institute, Fanning the Flame, Billion Soul Care, or
              collaborative ministry initiatives, we believe every partnership
              has the potential to multiply the reach of the Gospel.
            </p>
            <p className="font-[family-name:var(--font-jakarta)] text-lg font-semibold text-white mb-2">
              Together, we can accomplish far more than any one ministry could
              ever achieve alone.
            </p>
            <p className="font-[family-name:var(--font-jakarta)] text-xl font-bold text-[#a9edff]">
              One Mission. One Kingdom. One Harvest.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
