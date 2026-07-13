import { honoraryChairmen, coChairs, LeaderAvatar } from "../shared";
import { ScrollReveal } from "../../components/scroll-reveal";

export const revalidate = 3600;

export default async function GlobalLeadersPage() {
  return (
    <div className="scroll-smooth">
      {/* ── Hero ── */}
      <header className="relative min-h-[400px] md:min-h-[500px] flex items-center overflow-hidden">
        <img
          src="/initiatives-collab.webp"
          alt="Global leaders gathering"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0 z-[1]"
          style={{
            background:
              "linear-gradient(to bottom, rgba(13,34,63,0.45), rgba(13,34,63,0.8))",
          }}
        />
        <div className="relative z-10 max-w-[1280px] mx-auto px-4 md:px-8 w-full" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>
          <div className="max-w-2xl">
            <span className="inline-block bg-[#65e2fe] text-[#006373] px-4 py-1 rounded-lg text-xs font-semibold font-[family-name:var(--font-geist-sans)] mb-6 uppercase tracking-wider">
              Leadership
            </span>
            <h1 className="font-[family-name:var(--font-jakarta)] text-4xl md:text-[48px] md:leading-[56px] font-bold text-white mb-6 tracking-normal">
              Global Leaders
            </h1>
            <p className="font-[family-name:var(--font-jakarta)] text-lg leading-7 text-white/90">
              Billion Soul Harvest is led by a diverse team of Christian leaders from around the
              world, united by a shared commitment to the Great Commission.
            </p>
          </div>
        </div>
      </header>

      {/* ── Our DNA: Holy, Humble, Hidden ── */}
      <section id="our-dna" className="bg-[#0d223f] text-white py-20 md:py-[120px] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00b8d4]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#a9edff]/5 rounded-full blur-[100px]" />

        <div className="max-w-[1280px] mx-auto px-4 md:px-8 relative z-10">
          <ScrollReveal direction="none">
            <div className="text-center mb-16">
              <h2 className="font-[family-name:var(--font-jakarta)] text-4xl md:text-[48px] md:leading-[56px] font-bold text-white tracking-normal">
                Our DNA: Holy, Humble, Hidden
              </h2>
            </div>
          </ScrollReveal>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                num: "01",
                title: "Holy",
                desc: "Living lives fully devoted to God.",
                icon: (
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                  </svg>
                ),
              },
              {
                num: "02",
                title: "Humble",
                desc: "Serving others with the spirit of Christ.",
                icon: (
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                ),
              },
              {
                num: "03",
                title: "Hidden",
                desc: "Seeking God\u2019s glory above our own recognition.",
                icon: (
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div
                key={item.num}
                className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-10 hover:bg-white/10 hover:border-[#a9edff]/30 transition-all duration-300"
              >
                <div className="text-6xl font-[family-name:var(--font-jakarta)] text-[#a9edff]/10 italic absolute top-4 right-6">
                  {item.num}
                </div>
                <div className="text-[#a9edff] mb-5">
                  {item.icon}
                </div>
                <h4 className="font-[family-name:var(--font-jakarta)] text-2xl font-semibold text-white mb-3">
                  {item.title}
                </h4>
                <p className="font-[family-name:var(--font-jakarta)] text-lg leading-7 text-white/70">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Global Leaders Grid ── */}
      <section className="py-20 md:py-[100px] bg-[#f0f3ff]">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="font-[family-name:var(--font-jakarta)] text-3xl md:text-[40px] md:leading-[48px] font-bold text-[#0d223f] tracking-normal">
              Global Honorary Chairmen
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {honoraryChairmen.filter((p) => p.role === "Honorary Chairman").map((person) => (
              <div key={person.name} className="text-center bg-white rounded-2xl p-6 border border-[#b4c7ec]/30 hover:shadow-lg hover:border-[#00b8d4]/30 hover:scale-105 transition-all duration-300">
                <LeaderAvatar name={person.name} photo={person.photo} size="md" />
                <h4 className="font-[family-name:var(--font-jakarta)] text-base font-bold text-[#0d223f] leading-tight mt-4">
                  {person.name}
                </h4>
                <p className="font-[family-name:var(--font-geist-sans)] text-sm text-[#44474d] mt-1.5 leading-snug">
                  {person.org}
                </p>
              </div>
            ))}
          </div>

          <div id="co-chairs" className="text-center mt-20 mb-16 scroll-mt-20">
            <h2 className="font-[family-name:var(--font-jakarta)] text-3xl md:text-[40px] md:leading-[48px] font-bold text-[#0d223f] tracking-normal">
              Global Leaders
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {coChairs.map((person) => (
              <div key={`${person.name}-${person.org}`} className="text-center bg-white rounded-2xl p-6 border border-[#b4c7ec]/30 hover:shadow-lg hover:border-[#00b8d4]/30 hover:scale-105 transition-all duration-300">
                <LeaderAvatar name={person.name} photo={person.photo} size="md" />
                <h4 className="font-[family-name:var(--font-jakarta)] text-base font-bold text-[#0d223f] leading-tight mt-4">
                  {person.name}
                </h4>
                <p className="font-[family-name:var(--font-geist-sans)] text-sm text-[#44474d] mt-1.5 leading-snug">
                  {person.org}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
