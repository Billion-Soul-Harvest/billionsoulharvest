import Link from "next/link";
import { HeroSlideshow } from "../components/hero-slideshow";
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
              Our Ministries
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
            Our{" "}
            <span className="text-[#1ecdec]">Initiatives</span>
          </h1>

          <div className="hidden md:block border-t border-[#1ecdec] pt-7">
            <p className="font-[family-name:var(--font-jakarta)] text-[15px] leading-[1.7] text-white/90 m-0 max-w-[52ch] text-pretty">
              Billion Soul Harvest advances the Great Commission through five key ministry initiatives — each designed to equip, mobilize, and multiply.
            </p>
          </div>
        </div>
      </header>

      {/* ── 1. Global & National Harvest Summits ── */}
      <section
        id="summits"
        className="py-[110px] scroll-mt-20"
        style={{ background: "#f5f7fa", color: "#0a0a0a" }}
      >
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            {/* Left — content */}
            <ScrollReveal direction="left">
            <div>
              <span className="font-[family-name:var(--font-geist-mono)] text-[12.5px] font-[500] uppercase" style={{ letterSpacing: "0.16em", color: "#506b9f" }}>
                Initiative 01
              </span>
              <h2 className="font-[family-name:var(--font-jakarta)] font-[900] uppercase mt-5 pb-5" style={{ fontSize: "clamp(36px, 4.8vw, 80px)", lineHeight: "0.88", letterSpacing: "-0.045em", borderBottom: "2px solid #0a0a0a" }}>
                Global &amp; National Harvest Summits
              </h2>
              <div className="mt-8 space-y-4 font-[family-name:var(--font-jakarta)]" style={{ fontSize: "17.5px", lineHeight: "1.72", color: "#505870" }}>
                <p>
                  Billion Soul Harvest believes that the greatest harvest in
                  history will require the greatest collaboration in history.
                  That is why we bring Christian leaders together through both{" "}
                  <strong className="text-[#0a0a0a]">
                    Global Harvest Summits
                  </strong>{" "}
                  and{" "}
                  <strong className="text-[#0a0a0a]">
                    National Harvest Summits
                  </strong>
                  .
                </p>
                <p>
                  <strong className="text-[#0a0a0a]">
                    Global Harvest Summits
                  </strong>{" "}
                  unite pastors, ministry leaders, missionaries, churches, and
                  Kingdom partners from many nations to seek God&apos;s
                  direction, strengthen relationships, and inspire worldwide
                  collaboration for the fulfillment of the Great Commission.
                </p>
                <p>
                  <strong className="text-[#0a0a0a]">
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
              <div className="bg-white p-8" style={{ border: "1px solid rgba(10,10,10,0.16)" }}>
                <h3 className="font-[family-name:var(--font-jakarta)] font-[900] uppercase mb-3" style={{ fontSize: "26px", lineHeight: "1", letterSpacing: "-0.035em" }}>
                  Why do we gather?
                </h3>
                <p className="font-[family-name:var(--font-jakarta)] mb-6" style={{ fontSize: "17.5px", lineHeight: "1.72", color: "#505870" }}>
                  Because we believe that when the Body of Christ comes together
                  in worship, prayer, unity, and shared vision, God releases
                  fresh passion, greater collaboration, and renewed momentum for
                  His mission.
                </p>
                <p className="font-[family-name:var(--font-jakarta)] mb-4" style={{ fontSize: "17.5px", lineHeight: "1.72", color: "#505870" }}>
                  Our summits are more than conferences&mdash;they are catalytic
                  gatherings designed to:
                </p>
                <ul className="space-y-3">
                  {summitBullets.map((b, i) => (
                    <li key={b} className="flex items-start gap-3">
                      <span className="font-[family-name:var(--font-geist-mono)] text-[11px] font-[500] text-[#1ecdec] shrink-0 mt-[3px]">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="font-[family-name:var(--font-jakarta)] text-sm text-[#505870]">
                        {b}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <blockquote className="mt-8" style={{ padding: "26px 30px", background: "#0a0a0a", color: "white", borderLeft: "6px solid #1ecdec", fontSize: "19px", lineHeight: "1.5", fontWeight: 700 }}>
                <p className="font-[family-name:var(--font-jakarta)]">
                  Every summit has one purpose: to gather God&apos;s people for
                  vision so they can return to their communities, churches, and
                  nations ready to make disciples and advance God&apos;s Kingdom.
                </p>
              </blockquote>

              <p className="font-[family-name:var(--font-jakarta)] font-[900] text-[#0a0a0a] mt-6" style={{ fontSize: "26px", lineHeight: "1", letterSpacing: "-0.035em" }}>
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
        className="py-[110px] text-white relative overflow-hidden scroll-mt-20"
        style={{ background: "#0a0a0a" }}
      >
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 relative z-10">
          <ScrollReveal direction="none">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <span className="font-[family-name:var(--font-geist-mono)] text-[#1ecdec] text-[12.5px] font-[500] uppercase" style={{ letterSpacing: "0.16em" }}>
              Initiative 02
            </span>
            <h2 className="font-[family-name:var(--font-jakarta)] font-[900] uppercase text-white mt-5 pb-5" style={{ fontSize: "clamp(36px, 4.8vw, 80px)", lineHeight: "0.88", letterSpacing: "-0.045em", borderBottom: "2px solid rgba(255,255,255,0.3)" }}>
              International Leadership Institute (ILI)
            </h2>
            <p className="font-[family-name:var(--font-jakarta)] mt-8" style={{ fontSize: "17px", lineHeight: "1.65", color: "rgba(255,255,255,0.85)" }}>
              The International Leadership Institute (ILI) is the leadership
              development and training ministry of Billion Soul Harvest. It
              exists to equip pastors, evangelists, missionaries, ministry
              leaders, and emerging leaders to fulfill the Great Commission
              through biblical leadership, evangelism, discipleship, and
              multiplication.
            </p>
          </div>
          </ScrollReveal>

          <p className="font-[family-name:var(--font-jakarta)] text-center max-w-2xl mx-auto mb-6" style={{ fontSize: "16px", lineHeight: "1.65", color: "rgba(255,255,255,0.85)" }}>
            While Global and National Harvest Summits inspire and mobilize the
            Church, the International Leadership Institute provides practical
            training that equips leaders to return to their churches,
            ministries, and communities with greater vision, skills, and Kingdom
            effectiveness.
          </p>
          <p className="font-[family-name:var(--font-jakarta)] text-center max-w-2xl mx-auto mb-12" style={{ fontSize: "16px", lineHeight: "1.65", color: "rgba(255,255,255,0.85)" }}>
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
                className="p-6"
                style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.16)" }}
              >
                <span className="font-[family-name:var(--font-geist-mono)] text-[11px] text-[#1ecdec] block mb-2" style={{ letterSpacing: "0.12em" }}>
                  {t.label}
                </span>
                <h4 className="font-[family-name:var(--font-jakarta)] font-[900] text-white mb-2" style={{ fontSize: "21px", lineHeight: "1", letterSpacing: "-0.035em" }}>
                  {t.label}
                </h4>
                <p className="font-[family-name:var(--font-jakarta)]" style={{ fontSize: "15px", lineHeight: "1.6", color: "rgba(255,255,255,0.82)" }}>
                  {t.desc}
                </p>
              </div>
            ))}
          </div>
          </ScrollReveal>

          <div className="text-center mt-12">
            <p className="font-[family-name:var(--font-jakarta)] max-w-2xl mx-auto mb-6" style={{ fontSize: "16px", lineHeight: "1.65", color: "rgba(255,255,255,0.85)" }}>
              Our goal is not simply to train better leaders, but to raise
              Kingdom leaders who will multiply their influence and help prepare
              the Church for the greatest harvest in history.
            </p>
            <p className="font-[family-name:var(--font-jakarta)] text-lg font-bold text-[#1ecdec]">
              Equipping Leaders. Multiplying Disciple-Makers. Advancing the
              Great Commission.
            </p>
          </div>
        </div>
      </section>

      {/* ── 3. Fanning the Flame ── */}
      <section
        id="fanning-the-flame"
        className="py-[110px] scroll-mt-20"
        style={{ background: "#f5f7fa", color: "#0a0a0a" }}
      >
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <ScrollReveal>
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="font-[family-name:var(--font-geist-mono)] text-[12.5px] font-[500] uppercase" style={{ letterSpacing: "0.16em", color: "#506b9f" }}>
              Initiative 03
            </span>
            <h2 className="font-[family-name:var(--font-jakarta)] font-[900] uppercase mt-5 pb-5" style={{ fontSize: "clamp(36px, 4.8vw, 80px)", lineHeight: "0.88", letterSpacing: "-0.045em", borderBottom: "2px solid #0a0a0a" }}>
              Fanning the Flame
            </h2>
            <p className="font-[family-name:var(--font-jakarta)] mt-8" style={{ fontSize: "17.5px", lineHeight: "1.72", color: "#505870" }}>
              <strong className="text-[#0a0a0a]">Fanning the Flame</strong> is
              the strategic funding and mobilization ministry of Billion Soul
              Harvest. Its purpose is to identify, strengthen, and sustain
              Kingdom initiatives that have the potential to make a significant
              impact for the Great Commission.
            </p>
            <p className="font-[family-name:var(--font-jakarta)] mt-4" style={{ fontSize: "17.5px", lineHeight: "1.72", color: "#505870" }}>
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
                className="bg-white p-8"
                style={{ border: "1px solid rgba(10,10,10,0.18)" }}
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#0a0a0a] text-[#1ecdec] mb-5">
                  {f.icon}
                </div>
                <h3 className="font-[family-name:var(--font-jakarta)] font-[900] uppercase mb-3" style={{ fontSize: "26px", lineHeight: "1", letterSpacing: "-0.035em" }}>
                  {f.title}
                </h3>
                <p className="font-[family-name:var(--font-jakarta)]" style={{ fontSize: "17.5px", lineHeight: "1.72", color: "#505870" }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
          </ScrollReveal>

          {/* Two Strategic Tracks */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div style={{ background: "#0a0a0a", color: "white", padding: "36px 34px 40px" }}>
              <h3 className="font-[family-name:var(--font-jakarta)] font-[900] uppercase text-white mb-3" style={{ fontSize: "26px", lineHeight: "1", letterSpacing: "-0.035em" }}>
                Kingdom Project Grants
              </h3>
              <p className="font-[family-name:var(--font-jakarta)]" style={{ fontSize: "15px", lineHeight: "1.6", color: "rgba(255,255,255,0.82)" }}>
                Through a thoughtful application and review process, we identify
                strategic Gospel initiatives around the world and provide
                financial support to ministries that demonstrate vision,
                accountability, and measurable Kingdom impact.
              </p>
            </div>
            <div style={{ background: "#1ecdec", color: "#0a0a0a", padding: "36px 34px 40px" }}>
              <h3 className="font-[family-name:var(--font-jakarta)] font-[900] uppercase mb-3" style={{ fontSize: "26px", lineHeight: "1", letterSpacing: "-0.035em", color: "#0a0a0a" }}>
                Evangelist Sponsorship
              </h3>
              <p className="font-[family-name:var(--font-jakarta)] mb-4" style={{ fontSize: "15px", lineHeight: "1.6", color: "#0a0a0a" }}>
                We believe every evangelist should have the opportunity to focus
                on sharing the Gospel without being hindered by a lack of basic
                support.
              </p>
              <p className="font-[family-name:var(--font-jakarta)]" style={{ fontSize: "15px", lineHeight: "1.6", color: "#0a0a0a" }}>
                Through our{" "}
                <strong>
                  One Account for One Evangelist
                </strong>{" "}
                initiative, individuals, churches, and ministry partners can
                sponsor an evangelist with a monthly commitment of{" "}
                <strong>$100</strong>. Each
                sponsorship provides practical encouragement and financial
                support, enabling faithful servants to continue proclaiming
                Christ and making disciples in their communities and beyond.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="font-[family-name:var(--font-jakarta)] max-w-2xl mx-auto mb-4" style={{ fontSize: "17.5px", lineHeight: "1.72", color: "#505870" }}>
              Together, we are not simply funding ministry&mdash;we are{" "}
              <strong className="text-[#0a0a0a]">finding</strong>,{" "}
              <strong className="text-[#0a0a0a]">fueling</strong>, and{" "}
              <strong className="text-[#0a0a0a]">finishing</strong> the work of
              the Great Commission.
            </p>
            <p className="font-[family-name:var(--font-jakarta)] font-[900] uppercase" style={{ fontSize: "26px", lineHeight: "1", letterSpacing: "-0.035em" }}>
              Find the Vision. Fuel the Mission. Finish the Great Commission.
            </p>
          </div>
        </div>
      </section>

      {/* ── 4. Billion Soul Care ── */}
      <section
        id="billion-soul-care"
        className="py-[110px] scroll-mt-20"
        style={{ background: "#0a0a0a" }}
      >
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <ScrollReveal>
          <div className="max-w-3xl mx-auto text-center mb-12">
            <span className="font-[family-name:var(--font-geist-mono)] text-[#1ecdec] text-[12.5px] font-[500] uppercase" style={{ letterSpacing: "0.16em" }}>
              Initiative 04
            </span>
            <h2 className="font-[family-name:var(--font-jakarta)] font-[900] uppercase text-white mt-5 pb-5" style={{ fontSize: "clamp(36px, 4.8vw, 80px)", lineHeight: "0.88", letterSpacing: "-0.045em", borderBottom: "2px solid rgba(255,255,255,0.3)" }}>
              Billion Soul Care
            </h2>
            <p className="font-[family-name:var(--font-jakarta)] mt-8" style={{ fontSize: "17px", lineHeight: "1.65", color: "rgba(255,255,255,0.85)" }}>
              <strong className="text-white">Billion Soul Care</strong> is
              the compassion and mercy ministry of Billion Soul Harvest. It
              exists to demonstrate the love of Christ through practical care,
              humanitarian assistance, and strategic partnerships that bring hope
              to people in need.
            </p>
            <p className="font-[family-name:var(--font-jakarta)] mt-4" style={{ fontSize: "16px", lineHeight: "1.65", color: "rgba(255,255,255,0.85)" }}>
              We believe the Gospel calls us not only to proclaim the Good News
              but also to care for those who are hurting. Through acts of
              compassion, we seek to reflect the heart of Jesus while opening
              doors for the transforming power of the Gospel.
            </p>
            <p className="font-[family-name:var(--font-jakarta)] mt-4" style={{ fontSize: "16px", lineHeight: "1.65", color: "rgba(255,255,255,0.85)" }}>
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
          <div className="max-w-4xl mx-auto mb-12">
            {careAreas.map((a, i) => (
              <div
                key={a.label}
                className="grid grid-cols-1 md:grid-cols-[90px_minmax(260px,1fr)_2fr] gap-4 md:gap-8 items-start border-t border-white/[0.22] py-[30px]"
              >
                <span className="font-[family-name:var(--font-geist-mono)] text-[12px] text-[#1ecdec]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h4 className="font-[family-name:var(--font-jakarta)] font-[900] uppercase text-white" style={{ fontSize: "clamp(24px, 2.2vw, 34px)", lineHeight: "0.98", letterSpacing: "-0.04em" }}>
                  {a.label}
                </h4>
                <p className="font-[family-name:var(--font-jakarta)]" style={{ fontSize: "16.5px", lineHeight: "1.65", color: "rgba(255,255,255,0.85)" }}>
                  {a.desc}
                </p>
              </div>
            ))}
          </div>
          </ScrollReveal>

          <div className="text-center">
            <p className="font-[family-name:var(--font-jakarta)] max-w-2xl mx-auto mb-4" style={{ fontSize: "16px", lineHeight: "1.65", color: "rgba(255,255,255,0.85)" }}>
              Every act of compassion is an opportunity to demonstrate
              God&apos;s love and point people to the hope found in Jesus
              Christ.
            </p>
            <p className="font-[family-name:var(--font-jakarta)] text-lg font-bold text-[#1ecdec]">
              Sharing the Gospel. Serving with Compassion. Transforming Lives.
            </p>
          </div>
        </div>
      </section>

      {/* ── 5. Strategic Partnerships ── */}
      <section
        id="strategic-partnerships"
        className="py-[110px] scroll-mt-20"
        style={{ background: "#f5f7fa", color: "#0a0a0a" }}
      >
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 relative z-10">
          <ScrollReveal direction="none">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <span className="font-[family-name:var(--font-geist-mono)] text-[12.5px] font-[500] uppercase" style={{ letterSpacing: "0.16em", color: "#506b9f" }}>
              Initiative 05
            </span>
            <h2 className="font-[family-name:var(--font-jakarta)] font-[900] uppercase mt-5 pb-5" style={{ fontSize: "clamp(36px, 4.8vw, 80px)", lineHeight: "0.88", letterSpacing: "-0.045em", borderBottom: "2px solid #0a0a0a" }}>
              Strategic Partnerships
            </h2>
            <p className="font-[family-name:var(--font-jakarta)] mt-8" style={{ fontSize: "17.5px", lineHeight: "1.72", color: "#505870" }}>
              At Billion Soul Harvest, we believe that the fulfillment of the
              Great Commission will require unprecedented collaboration across
              the Body of Christ.
            </p>
            <p className="font-[family-name:var(--font-jakarta)] mt-4" style={{ fontSize: "17.5px", lineHeight: "1.72", color: "#505870" }}>
              No single church, denomination, ministry, mission organization, or
              network can accomplish this mission alone. But together, through
              humility, trust, and a shared commitment to God&apos;s Kingdom, we
              can make a far greater impact.
            </p>
            <p className="font-[family-name:var(--font-jakarta)] mt-4" style={{ fontSize: "17.5px", lineHeight: "1.72", color: "#505870" }}>
              Strategic Partnerships is the collaborative ministry of Billion
              Soul Harvest. We exist to build meaningful relationships with
              churches, ministries, mission organizations, Christian networks,
              educational institutions, and Kingdom leaders who share a passion
              for evangelism, discipleship, and multiplication.
            </p>
            <p className="font-[family-name:var(--font-jakarta)] mt-4" style={{ fontSize: "17.5px", lineHeight: "1.72", color: "#505870" }}>
              Rather than creating another organization, our desire is to
              strengthen what God is already doing by connecting people, sharing
              resources, encouraging collaboration, and mobilizing the Church
              toward a common mission.
            </p>
          </div>
          </ScrollReveal>

          {/* Partner bullets */}
          <ScrollReveal delay={100}>
          <div className="max-w-3xl mx-auto mb-12">
            <h3 className="font-[family-name:var(--font-jakarta)] font-[900] uppercase mb-8 text-center" style={{ fontSize: "26px", lineHeight: "1", letterSpacing: "-0.035em" }}>
              We Partner To:
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", borderLeft: "1px solid rgba(10,10,10,0.18)", borderTop: "1px solid rgba(10,10,10,0.18)" }}>
              {partnerBullets.map((b, i) => (
                <div
                  key={b}
                  className="bg-white"
                  style={{
                    borderRight: "1px solid rgba(10,10,10,0.18)",
                    borderBottom: "1px solid rgba(10,10,10,0.18)",
                    padding: "28px 26px",
                    display: "grid",
                    gridTemplateColumns: "48px 1fr",
                    gap: "16px",
                    alignItems: "start",
                  }}
                >
                  <span className="font-[family-name:var(--font-geist-mono)] text-[11px] font-[500]" style={{ color: "#506b9f" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-[family-name:var(--font-jakarta)] font-[800]" style={{ fontSize: "18px", lineHeight: "1.32", letterSpacing: "-0.025em" }}>
                    {b}
                  </span>
                </div>
              ))}
            </div>
          </div>
          </ScrollReveal>

          <div className="text-center">
            <p className="font-[family-name:var(--font-jakarta)] max-w-2xl mx-auto mb-4" style={{ fontSize: "17.5px", lineHeight: "1.72", color: "#505870" }}>
              Whether through Global Harvest Summits, the International
              Leadership Institute, Fanning the Flame, Billion Soul Care, or
              collaborative ministry initiatives, we believe every partnership
              has the potential to multiply the reach of the Gospel.
            </p>
            <p className="font-[family-name:var(--font-jakarta)] font-[800] mb-2" style={{ fontSize: "17.5px", lineHeight: "1.72", color: "#0a0a0a" }}>
              Together, we can accomplish far more than any one ministry could
              ever achieve alone.
            </p>
            <p className="font-[family-name:var(--font-jakarta)] font-[900] uppercase" style={{ fontSize: "26px", lineHeight: "1", letterSpacing: "-0.035em" }}>
              One Mission. One Kingdom. One Harvest.
            </p>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-[130px] text-center" style={{ background: "#1ecdec", color: "#0a0a0a" }}>
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <h2 className="font-[family-name:var(--font-jakarta)] font-[900] uppercase" style={{ fontSize: "clamp(44px, 7vw, 116px)", lineHeight: "0.84", letterSpacing: "-0.055em" }}>
            Join the Harvest
          </h2>
          <div className="mt-10">
            <Link
              href="/static-render/contact"
              className="inline-block font-[family-name:var(--font-jakarta)] text-[14px] font-[800] text-white"
              style={{ padding: "20px 34px", background: "#0a0a0a", letterSpacing: "0.08em" }}
            >
              GET INVOLVED
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
