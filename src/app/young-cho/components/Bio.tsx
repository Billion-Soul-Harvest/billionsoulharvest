"use client";

import { Compass, Sparkles, BookOpen, Heart, Globe } from "lucide-react";
import { biographicalNote, thumbnailImage } from "../data";

export default function Bio() {
  const stats = [
    { value: "30+", label: "Years in Ministry", icon: Sparkles },
    { value: "100+", label: "Nations Visited", icon: Globe },
    { value: "2033", label: "Great Commission Vision", icon: Compass },
  ];

  return (
    <section id="bio" className="py-24 bg-[#f0f3ff] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#00b8d4]/5 rounded-full filter blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-[family-name:var(--font-geist-sans)] tracking-widest uppercase text-[#00b8d4] font-semibold">
            Biographical Note
          </span>
          <h2 className="font-[family-name:var(--font-jakarta)] text-3xl md:text-4xl lg:text-5xl font-bold text-[#0d223f] tracking-tight mt-2 leading-tight">
            A Lifetime Devoted to the <br className="hidden sm:inline" />
            <span className="text-[#00b8d4] italic font-medium">
              Great Commission
            </span>
          </h2>
          <div className="w-16 h-[2px] bg-[#00b8d4] mx-auto mt-6" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-28">
            <div className="bg-white rounded-2xl p-8 border border-[#b4c7ec]/20 shadow-md flex flex-col items-center text-center">
              <div className="relative w-48 h-48 rounded-2xl overflow-hidden mb-6 border-2 border-[#00b8d4]/20 shadow-sm">
                <img
                  src={thumbnailImage}
                  alt="Presentation Thumbnail"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-[family-name:var(--font-jakarta)] text-xl font-bold text-[#0d223f]">
                Rev. Dr. Young Cho
              </h3>
              <p className="text-xs font-[family-name:var(--font-geist-sans)] text-[#00b8d4] tracking-widest uppercase mt-1 mb-6 font-semibold">
                Global Director, BSH
              </p>

              <div className="w-full h-[1px] bg-[#f0f3ff] mb-6" />

              <p className="font-[family-name:var(--font-jakarta)] italic text-[#44474d] text-sm leading-relaxed">
                &ldquo;Connecting global leadership networks to coordinate, empower,
                and support cross-continental church growth and spiritual
                awakening.&rdquo;
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
              {stats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={i}
                    className="bg-white rounded-2xl p-6 border border-[#b4c7ec]/20 shadow-sm flex items-center space-x-4"
                  >
                    <div className="p-3 bg-[#00b8d4]/10 rounded-xl">
                      <Icon className="w-5 h-5 text-[#00b8d4]" />
                    </div>
                    <div>
                      <h4 className="font-[family-name:var(--font-jakarta)] text-xl font-bold text-[#0d223f] leading-none mb-1">
                        {stat.value}
                      </h4>
                      <p className="text-xs font-[family-name:var(--font-jakarta)] text-[#44474d] font-medium leading-none">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-8 bg-white rounded-2xl p-8 md:p-10 border border-[#b4c7ec]/20 shadow-md space-y-6 md:space-y-8">
            <div className="flex items-center space-x-3">
              <BookOpen className="w-6 h-6 text-[#00b8d4]" />
              <h3 className="font-[family-name:var(--font-jakarta)] text-2xl font-bold text-[#0d223f]">
                The Life and Mission
              </h3>
            </div>

            <div className="space-y-6 text-[#44474d] leading-relaxed font-[family-name:var(--font-jakarta)] text-base">
              {biographicalNote.map((para, idx) => {
                if (idx === 0) {
                  return (
                    <p
                      key={idx}
                      className="relative first-letter:text-5xl first-letter:font-[family-name:var(--font-jakarta)] first-letter:font-bold first-letter:text-[#0d223f] first-letter:mr-3 first-letter:float-left first-letter:leading-[0.8] pt-2"
                    >
                      {para}
                    </p>
                  );
                }

                return (
                  <p
                    key={idx}
                    className="border-l-2 border-[#f0f3ff] pl-4 md:pl-6"
                  >
                    {para}
                  </p>
                );
              })}
            </div>

            <div className="pt-6 border-t border-[#f0f3ff] grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-[#00b8d4]/10 rounded-lg mt-1">
                  <Heart className="w-4 h-4 text-[#00b8d4]" />
                </div>
                <div>
                  <h4 className="text-sm font-[family-name:var(--font-jakarta)] font-bold text-[#0d223f]">
                    Holistic Child Sponsorship
                  </h4>
                  <p className="text-xs text-[#44474d] leading-relaxed mt-1">
                    Actively partners with Compassion International to advocate
                    for vulnerable children&apos;s welfare globally.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-[#00b8d4]/10 rounded-lg mt-1">
                  <Globe className="w-4 h-4 text-[#00b8d4]" />
                </div>
                <div>
                  <h4 className="text-sm font-[family-name:var(--font-jakarta)] font-bold text-[#0d223f]">
                    Strategic Partnerships
                  </h4>
                  <p className="text-xs text-[#44474d] leading-relaxed mt-1">
                    Connects local assemblies, academic faculty boards, and world
                    networks to forge long-term alliances.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
