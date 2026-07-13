import Link from "next/link";
import { ScrollReveal } from "../../components/scroll-reveal";

export const revalidate = 3600;

export default async function TheBSHLogoPage() {
  return (
    <div className="scroll-smooth">
      {/* ── Section 1: Hero Banner ── */}
      <header className="relative min-h-[400px] md:min-h-[500px] flex items-center overflow-hidden">
        <img
          src="/hero-harvest.webp"
          alt="Billion Soul Harvest gathering with flags from many nations"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0 z-[1]"
          style={{
            background:
              "linear-gradient(to bottom, rgba(13,34,63,0.45), rgba(13,34,63,0.85))",
          }}
        />
        <div className="relative z-10 max-w-[1280px] mx-auto px-4 md:px-8 w-full" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>
          <div className="max-w-2xl">
            <span className="inline-block bg-[#65e2fe] text-[#006373] px-4 py-1 rounded-lg text-xs font-semibold font-[family-name:var(--font-geist-sans)] mb-6 uppercase tracking-wider">
              The BSH Logo
            </span>
            <h1 className="font-[family-name:var(--font-jakarta)] text-4xl md:text-[48px] md:leading-[56px] font-bold text-white mb-6 tracking-[-0.02em]">
              The Story Behind Our Logo
            </h1>
            <p className="font-[family-name:var(--font-jakarta)] text-lg leading-7 text-white/90">
              Every Seed Matters. Every Soul Matters. Every Nation Matters.
            </p>
          </div>
        </div>
      </header>

      {/* ── Section 2: Logo Explained Infographic ── */}
      <section className="py-20 md:py-[100px] bg-white">
        <div className="max-w-[900px] mx-auto px-4 md:px-8">
          <ScrollReveal>
            <img
              src="/bsh-logo-explained.jpeg"
              alt="The BSH Logo Explained — 9 Seeds, 1 Harvest, Billions of Souls. Infographic showing the six meanings behind the BSH logo: 9 Zeroes representing Billions, Different Seeds for diversity, Sowing the Seeds, Adaptive Approach, Multiplication in Unity, and From One Seed to a Billion Souls."
              className="w-full h-auto rounded-2xl shadow-lg"
            />
          </ScrollReveal>
        </div>
      </section>

      {/* ── Section 3: The Story Behind Our Symbol ── */}
      <section className="py-20 md:py-[100px] bg-[#f0f3ff]">
        <div className="max-w-[800px] mx-auto px-4 md:px-8">
          <ScrollReveal>
            <div className="mb-12">
              <h2 className="font-[family-name:var(--font-jakarta)] text-3xl md:text-[40px] md:leading-[48px] font-bold text-[#0d223f] tracking-[-0.02em]">
                The Story Behind Our Symbol
              </h2>
            </div>
          </ScrollReveal>

          <div className="space-y-6 font-[family-name:var(--font-jakarta)] text-[17px] leading-8 text-[#2a3a50]">
            <p>Welcome to Billion Soul Harvest.</p>
            <p>
              Thank you for visiting our website and taking the time to learn more about the
              vision God has entrusted to us. Before you explore our movement, I&apos;d like to
              share the story behind our logo, because it beautifully reflects the heart of who
              we are.
            </p>
            <p>
              At first glance, you will notice{" "}
              <strong className="text-[#0d223f]">nine unique seed-like shapes</strong>. Each
              resembles the number <strong className="text-[#0d223f]">zero</strong>, reminding
              us of the word <strong className="text-[#0d223f]">&ldquo;Billion.&rdquo;</strong>{" "}
              Yet these are much more than numbers. Every shape represents a soul created in the
              image of God&mdash;a person whom Christ loves and for whom He gave His life.
            </p>
            <p>
              No two seeds are identical. They symbolize the beautiful diversity of the nations,
              cultures, languages, generations, and communities that make up God&apos;s Kingdom.
              While the Gospel never changes, every mission field is unique, calling us to serve
              with wisdom, humility, and love.
            </p>
            <p>
              The logo also reminds us that every great harvest begins with faithful sowing.
              Before there can be a harvest, someone must plant the seed. Billion Soul Harvest
              exists to encourage and mobilize believers everywhere to faithfully sow the
              Gospel, trusting God to bring the increase.
            </p>
            <p>
              Finally, these individual seeds come together as one symbol. This reflects one of
              our deepest convictions:{" "}
              <strong className="text-[#0d223f]">
                the Great Commission will only be fulfilled as the global Church works together
                in unity.
              </strong>{" "}
              No ministry, denomination, or nation can finish the task alone. Together, we
              believe God is preparing a great harvest among every people and every nation
              before His return.
            </p>

            <p>Our prayer is simple:</p>

            <blockquote className="border-l-4 border-[#00b8d4] pl-6 py-2 my-8 bg-[#e7f9fc] rounded-r-lg">
              <p className="font-[family-name:var(--font-jakarta)] text-xl md:text-2xl leading-9 font-semibold text-[#0d223f]">
                Every Seed Matters. Every Soul Matters. Every Nation Matters.
              </p>
            </blockquote>

            <p>
              Thank you for joining us in this extraordinary journey. May this logo continually
              remind us that every act of faithful obedience, no matter how small, contributes
              to God&apos;s eternal harvest.
            </p>

            <p className="mt-8">For His glory,</p>

            {/* Author signature */}
            <div className="flex items-center gap-4 mt-4">
              <Link href="https://youngcho.billionsoulharvest.org/" target="_blank" rel="noopener noreferrer" className="shrink-0">
                <img
                  src="/leaders/young-cho.jpg"
                  alt="Rev. Dr. Young Cho"
                  className="w-14 h-14 rounded-full object-cover border-2 border-[#b4c7ec]/30"
                />
              </Link>
              <div>
                <Link
                  href="https://youngcho.billionsoulharvest.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-[family-name:var(--font-jakarta)] text-lg font-bold text-[#0d223f] hover:text-[#00b8d4] transition-colors"
                >
                  Young Cho
                </Link>
                <p className="font-[family-name:var(--font-jakarta)] text-sm text-[#44474d] italic">
                  Global Director
                </p>
                <p className="font-[family-name:var(--font-jakarta)] text-sm font-semibold text-[#0d223f]">
                  Billion Soul Harvest
                </p>
                <Link
                  href="https://youngcho.billionsoulharvest.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-[family-name:var(--font-jakarta)] text-xs text-[#00b8d4] hover:underline mt-1 inline-block"
                >
                  youngcho.billionsoulharvest.org
                </Link>
              </div>
            </div>
          </div>

          {/* Trademark Notice */}
          <div className="mt-16 pt-8 border-t border-[#b4c7ec]/30">
            <h3 className="font-[family-name:var(--font-jakarta)] text-sm font-bold text-[#0d223f] uppercase tracking-wider mb-3">
              Trademark Notice
            </h3>
            <p className="font-[family-name:var(--font-jakarta)] text-sm leading-6 text-[#44474d]">
              <strong className="text-[#0d223f]">Billion Soul Harvest&reg;</strong> and the{" "}
              <strong className="text-[#0d223f]">BSH logo</strong> are officially registered
              entities and protected trademarks in the Republic of Korea. Their use is reserved
              for authorized ministries, partners, and official communications of the Billion
              Soul Harvest movement.
            </p>
          </div>
        </div>
      </section>

      {/* ── Section 4: The Four Greats ── */}
      <section className="py-20 md:py-[120px] bg-[#f9f9ff]">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <ScrollReveal>
            <div className="mb-16">
              <h2 className="font-[family-name:var(--font-jakarta)] text-[28px] md:text-[32px] leading-10 font-semibold text-[#0d223f]">
                The Four Greats
              </h2>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-6">
              <div className="md:col-span-2 md:row-span-1 bg-white/70 backdrop-blur-sm border border-[#b4c7ec]/30 p-8 rounded-lg">
                <svg className="w-10 h-10 text-[#00b8d4] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                </svg>
                <h3 className="font-[family-name:var(--font-jakarta)] text-2xl font-semibold text-[#0d223f] mb-2">Great Return</h3>
                <p className="font-[family-name:var(--font-geist-sans)] text-base text-[#44474d]">Living with expectancy for Christ&apos;s return.</p>
              </div>

              <div className="md:col-span-2 md:row-span-2 bg-[#0d223f] text-white p-8 rounded-lg flex flex-col justify-end relative overflow-hidden" style={{ backgroundImage: "linear-gradient(to top, rgba(13,34,63,0.9) 20%, rgba(13,34,63,0.4) 100%), url('/great-harvest-bg.webp')", backgroundSize: "cover", backgroundPosition: "center" }}>
                <svg className="w-12 h-12 text-[#a9edff] mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
                <h3 className="font-[family-name:var(--font-jakarta)] text-[28px] md:text-[32px] leading-10 font-semibold mb-4">Great Harvest</h3>
                <p className="font-[family-name:var(--font-jakarta)] text-lg leading-7 text-white/80 max-w-md">Reaching the world with the Gospel.</p>
                <Link href="/gatherings" className="mt-8 inline-flex items-center gap-2 text-[#a9edff] text-sm font-semibold font-[family-name:var(--font-geist-sans)] hover:underline">
                  LEARN MORE
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>

              <div className="md:col-span-1 md:row-span-1 bg-white/70 backdrop-blur-sm border border-[#b4c7ec]/30 p-8 rounded-lg border-l-4 border-l-[#b4c7ec]">
                <svg className="w-10 h-10 text-[#b4c7ec] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
                </svg>
                <h3 className="font-[family-name:var(--font-jakarta)] text-2xl font-semibold text-[#0d223f] mb-2">Great Unity</h3>
                <p className="font-[family-name:var(--font-geist-sans)] text-base text-[#44474d]">Bringing the Body of Christ together.</p>
              </div>

              <div className="md:col-span-1 md:row-span-1 bg-white/70 backdrop-blur-sm border border-[#b4c7ec]/30 p-8 rounded-lg border-l-4 border-l-[#006879]">
                <svg className="w-10 h-10 text-[#006879] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
                <h3 className="font-[family-name:var(--font-jakarta)] text-2xl font-semibold text-[#0d223f] mb-2">Great Breakthrough</h3>
                <p className="font-[family-name:var(--font-geist-sans)] text-base text-[#44474d]">
                  Advancing God&apos;s Kingdom through prayer, faith, and the power of the Holy Spirit.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
