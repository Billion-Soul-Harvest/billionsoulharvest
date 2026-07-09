"use client";

import { GraduationCap, Award, CheckCircle } from "lucide-react";
import { educationItems } from "../data";

export default function Education() {
  return (
    <section
      id="education"
      className="py-24 bg-[#f0f3ff] relative overflow-hidden"
    >
      <div className="absolute top-1/2 left-full -translate-x-1/2 w-[300px] h-[300px] bg-[#00b8d4]/5 rounded-full filter blur-[80px]" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-[family-name:var(--font-geist-sans)] tracking-widest uppercase text-[#00b8d4] font-semibold">
            Academic Background
          </span>
          <h2 className="font-[family-name:var(--font-jakarta)] text-3xl md:text-4xl lg:text-5xl font-bold text-[#0d223f] tracking-tight mt-2 leading-tight">
            Distinguished Education &{" "}
            <br />
            <span className="text-[#00b8d4] italic font-medium">
              Theological Pedigree
            </span>
          </h2>
          <div className="w-16 h-[2px] bg-[#00b8d4] mx-auto mt-6" />
        </div>

        <div className="max-w-4xl mx-auto relative pl-6 sm:pl-0">
          <div className="absolute left-6 sm:left-1/2 top-0 bottom-0 w-[2px] bg-[#b4c7ec]/20 -translate-x-1/2" />

          <div className="space-y-12">
            {educationItems.map((item, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div
                  key={idx}
                  className={`relative flex flex-col sm:flex-row items-stretch ${
                    isEven ? "sm:flex-row-reverse" : ""
                  }`}
                >
                  <div className="absolute left-6 sm:left-1/2 w-10 h-10 rounded-full bg-white border-2 border-[#00b8d4] flex items-center justify-center -translate-x-1/2 z-20 shadow-sm">
                    <GraduationCap className="w-5 h-5 text-[#006879]" />
                  </div>

                  <div className="hidden sm:block w-1/2" />

                  <div className="w-full sm:w-1/2 pl-12 sm:pl-0 sm:px-12">
                    <div className="bg-white rounded-xl p-6 md:p-8 border border-[#b4c7ec]/20 shadow-sm hover:shadow-md transition-shadow relative">
                      <div className="absolute top-6 right-6">
                        <CheckCircle className="w-5 h-5 text-[#00b8d4]" />
                      </div>

                      <span className="text-xs font-[family-name:var(--font-geist-sans)] tracking-widest text-[#00b8d4] uppercase font-semibold">
                        Degree Program
                      </span>
                      <h3 className="font-[family-name:var(--font-jakarta)] text-xl font-bold text-[#0d223f] mt-1 mb-2">
                        {item.degree}
                      </h3>

                      <div className="w-8 h-[1px] bg-[#00b8d4]/30 my-4" />

                      <p className="text-sm font-[family-name:var(--font-jakarta)] text-[#44474d] leading-relaxed font-semibold">
                        {item.institution}
                      </p>

                      <p className="text-xs text-[#44474d]/60 font-[family-name:var(--font-jakarta)] mt-2">
                        *Fully accredited advanced academic degree representing
                        theological and behavioral mastery.
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="max-w-3xl mx-auto mt-20 p-6 bg-white border border-[#b4c7ec]/20 rounded-xl flex flex-col sm:flex-row items-center sm:space-x-4 space-y-4 sm:space-y-0 shadow-sm">
          <div className="p-3.5 bg-[#00b8d4]/10 rounded-full">
            <Award className="w-6 h-6 text-[#00b8d4]" />
          </div>
          <div className="text-center sm:text-left">
            <h4 className="font-[family-name:var(--font-jakarta)] text-base font-bold text-[#0d223f]">
              Doctorate in Leadership
            </h4>
            <p className="text-xs text-[#44474d] mt-1 font-[family-name:var(--font-jakarta)]">
              Dr. Young Cho&apos;s academic thesis is focused on cross-cultural
              leadership training models and international organizational
              collaboration in faith-based NGO contexts.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
