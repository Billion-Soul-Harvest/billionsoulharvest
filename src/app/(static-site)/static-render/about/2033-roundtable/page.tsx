import Link from "next/link";
import { ScrollReveal } from "../../components/scroll-reveal";

export const revalidate = 3600;

export default async function RoundtablePage() {
  return (
    <div className="scroll-smooth">
      {/* ── Hero Image ── */}
      <div className="w-full">
        <img
          src="/roundtable-hero-bg.png"
          alt="2033 NY Roundtable Partners"
          className="w-full h-auto"
        />
      </div>

      {/* ── Intro ── */}
      <section className="py-20 md:py-[100px] bg-white">
        <div className="max-w-[800px] mx-auto px-4 md:px-8">
          <div className="space-y-6 font-[family-name:var(--font-jakarta)] text-[17px] leading-8 text-[#2a3a50]">
            <p>
              Momentum continues to build across the Billion Soul Harvest movement as global
              Christian leaders gather to strengthen collaboration, seek God&rsquo;s direction, and
              accelerate the fulfillment of the Great Commission before 2033.
            </p>
            <p>
              The BSH 2033 Roundtable brings together pastors, denominational leaders, evangelists,
              mission organizations, prayer movements, churches, marketplace leaders, and ministry
              networks from around the world with one shared purpose:{" "}
              <strong className="text-[#0d223f]">
                to unite the Body of Christ for a Billion Soul Harvest.
              </strong>
            </p>
          </div>
        </div>
      </section>

      {/* ── A Shared Vision for 2033 ── */}
      <section className="py-20 md:py-[100px] bg-[#f0f3ff]">
        <div className="max-w-[800px] mx-auto px-4 md:px-8">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="font-[family-name:var(--font-jakarta)] text-3xl md:text-[40px] md:leading-[48px] font-bold text-[#0d223f] mt-4 tracking-[-0.02em]">
                A Shared Vision for 2033
              </h2>
            </div>
          </ScrollReveal>
          <div className="space-y-6 font-[family-name:var(--font-jakarta)] text-[17px] leading-8 text-[#2a3a50]">
            <p>Billion Soul Harvest is united around a simple yet compelling vision:</p>
            <blockquote className="border-l-4 border-[#00b8d4] pl-6 py-2 my-8 bg-[#e7f9fc] rounded-r-lg">
              <p className="font-[family-name:var(--font-jakarta)] text-xl md:text-2xl leading-9 font-semibold text-[#0d223f]">
                Mobilizing every believer, strengthening every church, and reaching every nation
                for a Billion Soul Harvest by 2033.
              </p>
            </blockquote>
            <p>
              As we approach the 2,000th anniversary of the resurrection of Jesus Christ, we believe
              this is a historic window for the global Church to work together as never before. No
              single ministry, denomination, or nation can accomplish this alone. It will require
              unprecedented prayer, unity, evangelism, discipleship, leadership multiplication, and
              kingdom collaboration.
            </p>
          </div>
        </div>
      </section>

      {/* ── Strategic Priorities ── */}
      <section className="py-20 md:py-[100px] bg-white">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="font-[family-name:var(--font-jakarta)] text-3xl md:text-[40px] md:leading-[48px] font-bold text-[#0d223f] mt-4 tracking-[-0.02em]">
                Strategic Priorities
              </h2>
              <p className="font-[family-name:var(--font-jakarta)] text-lg leading-8 text-[#44474d] mt-6 max-w-2xl mx-auto">
                Through the BSH 2033 Roundtable, leaders are committing to practical actions that
                advance the global harvest together.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Mobilize Prayer",
                desc: "Unite millions of believers in strategic, Spirit-led prayer for revival, laborers, and a global harvest.",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                ),
              },
              {
                title: "Equip Every Believer",
                desc: "Encourage and train believers to confidently share the Gospel and make disciples wherever God has placed them.",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                ),
              },
              {
                title: "Strengthen Local Churches",
                desc: "Provide churches with practical resources, leadership development, and disciple-making tools that multiply ministry.",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21m-3.75 3H21" />
                  </svg>
                ),
              },
              {
                title: "Develop Kingdom Leaders",
                desc: "Raise up a new generation of humble, holy, and Spirit-filled leaders through the BSH International Leadership Institute and regional leadership initiatives.",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                  </svg>
                ),
              },
              {
                title: "Foster Kingdom Collaboration",
                desc: "Create trusted relationships among churches, ministries, denominations, mission organizations, and marketplace leaders, moving beyond isolated efforts toward collective Kingdom impact.",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.56a4.5 4.5 0 00-6.364-6.364L4.5 8.06" />
                  </svg>
                ),
              },
            ].map((card, i) => (
              <ScrollReveal key={card.title} delay={i * 80}>
                <div className="bg-[#f9f9ff] rounded-2xl border border-[#b4c7ec]/30 p-8 hover:shadow-lg hover:border-[#00b8d4]/30 hover:scale-105 transition-all duration-300 h-full">
                  <div className="w-12 h-12 rounded-xl bg-[#e7f8ff] flex items-center justify-center text-[#00b8d4] mb-5">
                    {card.icon}
                  </div>
                  <h3 className="font-[family-name:var(--font-jakarta)] text-lg font-bold text-[#0d223f] mb-3">
                    {card.title}
                  </h3>
                  <p className="font-[family-name:var(--font-jakarta)] text-sm leading-6 text-[#44474d]">
                    {card.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Expanding the Movement ── */}
      <section className="py-20 md:py-[100px] bg-[#f0f3ff]">
        <div className="max-w-[800px] mx-auto px-4 md:px-8">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="font-[family-name:var(--font-jakarta)] text-3xl md:text-[40px] md:leading-[48px] font-bold text-[#0d223f] tracking-[-0.02em]">
                Expanding the Movement
              </h2>
            </div>
          </ScrollReveal>
          <div className="space-y-6 font-[family-name:var(--font-jakarta)] text-[17px] leading-8 text-[#2a3a50]">
            <p>
              The BSH 2033 Roundtable seeks to establish national and regional collaborative
              platforms across every continent, empowering local leaders to develop strategies
              appropriate for their own culture and context while remaining connected to a shared
              global vision.
            </p>
            <p>
              These gatherings are not designed to build another organization, but to strengthen
              relationships, encourage cooperation, and help the global Church accomplish more
              together than any one ministry could accomplish alone.
            </p>
          </div>
        </div>
      </section>

      {/* ── Why This Matters ── */}
      <section className="bg-[#0d223f] text-white py-20 md:py-[100px] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00b8d4]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#a9edff]/5 rounded-full blur-[100px]" />

        <div className="max-w-[800px] mx-auto px-4 md:px-8 relative z-10">
          <ScrollReveal direction="none">
            <div className="text-center mb-12">
              <h2 className="font-[family-name:var(--font-jakarta)] text-3xl md:text-[40px] md:leading-[48px] font-bold text-white tracking-[-0.02em]">
                Why This Matters
              </h2>
            </div>
          </ScrollReveal>
          <div className="space-y-6 font-[family-name:var(--font-jakarta)] text-[17px] leading-8 text-white/80">
            <p>
              The world has never been more connected, yet billions of people still need the hope of
              Jesus Christ. We believe God is inviting His Church into an unprecedented season of
              unity, prayer, and harvest.
            </p>
            <p>
              Billion Soul Harvest exists to serve this movement&mdash;not by replacing existing
              ministries, but by connecting, encouraging, and mobilizing them toward a common
              mission.
            </p>
            <p>
              Together, we believe that{" "}
              <strong className="text-[#a9edff]">Every Single Soul Matters</strong>, and together
              we can help accelerate the fulfillment of the Great Commission in our generation.
            </p>
          </div>
        </div>
      </section>

      {/* ── Join the Movement CTA ── */}
      <section className="py-20 md:py-[120px] bg-[#0d223f] text-white text-center border-t border-white/10">
        <ScrollReveal direction="none">
          <div className="max-w-4xl mx-auto px-4 md:px-8">
            <h2 className="font-[family-name:var(--font-jakarta)] text-[28px] md:text-[32px] leading-10 font-semibold text-[#a9edff] mb-4">
              Join the Movement
            </h2>
            <p className="font-[family-name:var(--font-jakarta)] text-lg leading-7 text-white/80 mb-12">
              Whether you are a pastor, ministry leader, missionary, business leader, prayer leader,
              or believer with a heart for the nations, there is a place for you in the Billion Soul
              Harvest movement. Together, let us pray together, serve together, multiply disciples
              together, and believe God for a Billion Soul Harvest by 2033.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/gatherings"
                className="bg-[#00b8d4] text-white px-12 py-5 rounded-lg text-sm font-semibold font-[family-name:var(--font-geist-sans)] hover:scale-105 transition-all shadow-xl shadow-[#00b8d4]/40 uppercase tracking-widest"
              >
                Join the Movement Now
              </Link>
              <Link
                href="/connect"
                className="bg-white text-[#0d223f] px-12 py-5 rounded-lg text-sm font-semibold font-[family-name:var(--font-geist-sans)] hover:bg-[#dee8ff] transition-all uppercase tracking-widest"
              >
                Partner With Us
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
