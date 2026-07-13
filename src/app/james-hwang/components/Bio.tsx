"use client";

import { BookOpen } from "lucide-react";
import { biographicalNote, portraitImage } from "../data";

export default function Bio() {
  return (
    <section id="bio" className="py-24 bg-[#f0f3ff] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#00b8d4]/5 rounded-full filter blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-[family-name:var(--font-geist-sans)] tracking-widest uppercase text-[#00b8d4] font-semibold">
            Biographical Note
          </span>
          <h2 className="font-[family-name:var(--font-jakarta)] text-3xl md:text-4xl lg:text-5xl font-bold text-[#0d223f] tracking-tight mt-2 leading-tight">
            Dr. James Hwang&apos;s{" "}
            <br className="hidden sm:inline" />
            <span className="text-[#00b8d4] italic font-medium">Bio</span>
          </h2>
          <div className="w-16 h-[2px] bg-[#00b8d4] mx-auto mt-6" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-4 lg:sticky lg:top-28">
            <div className="bg-white rounded-2xl p-8 border border-[#b4c7ec]/20 shadow-md flex flex-col items-center text-center">
              <div className="relative w-48 h-48 rounded-2xl overflow-hidden mb-6 border-2 border-[#00b8d4]/20 shadow-sm">
                <img
                  src={portraitImage}
                  alt="Dr. James Hwang"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-[family-name:var(--font-jakarta)] text-xl font-bold text-[#0d223f]">
                Dr. James Hwang
              </h3>
              <p className="text-xs font-[family-name:var(--font-geist-sans)] text-[#00b8d4] tracking-widest uppercase mt-1 font-semibold">
                Global Chairman, BSH
              </p>
            </div>
          </div>

          <div className="lg:col-span-8 bg-white rounded-2xl p-8 md:p-10 border border-[#b4c7ec]/20 shadow-md space-y-6 md:space-y-8">
            <div className="flex items-center space-x-3">
              <BookOpen className="w-6 h-6 text-[#00b8d4]" />
              <h3 className="font-[family-name:var(--font-jakarta)] text-2xl font-bold text-[#0d223f]">
                Brief Version
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
          </div>
        </div>
      </div>
    </section>
  );
}
