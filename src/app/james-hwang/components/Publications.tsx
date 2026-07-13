"use client";

import { FileText, BookOpen, ArrowUpRight } from "lucide-react";
import { publicationLinks } from "../data";

export default function Publications() {
  const icons = [BookOpen, FileText];

  return (
    <section
      id="publications"
      className="py-24 bg-[#f9f9ff] relative overflow-hidden"
    >
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#00b8d4]/5 rounded-full filter blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-[family-name:var(--font-geist-sans)] tracking-widest uppercase text-[#00b8d4] font-semibold">
            Resources
          </span>
          <h2 className="font-[family-name:var(--font-jakarta)] text-3xl md:text-4xl lg:text-5xl font-bold text-[#0d223f] tracking-tight mt-2 leading-tight">
            <span className="text-[#00b8d4] italic font-medium">
              Literatures
            </span>
          </h2>
          <div className="w-16 h-[2px] bg-[#00b8d4] mx-auto mt-6" />
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {publicationLinks.map((pub, idx) => {
            const Icon = icons[idx] ?? BookOpen;
            return (
              <a
                key={idx}
                href={pub.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative bg-white rounded-2xl p-8 border border-[#b4c7ec]/20 shadow-sm hover:shadow-lg hover:border-[#00b8d4]/40 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-[#00b8d4]/10 text-[#006879] flex items-center justify-center">
                      <Icon className="w-8 h-8" />
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-[#f0f3ff] text-[#44474d] flex items-center justify-center group-hover:bg-[#00b8d4] group-hover:text-white transition-all duration-300">
                      <ArrowUpRight className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="font-[family-name:var(--font-jakarta)] text-xl font-bold text-[#0d223f] leading-snug mb-3">
                    {pub.title}
                  </h3>
                </div>

                <div className="flex items-center space-x-2 text-xs font-[family-name:var(--font-geist-sans)] font-bold text-[#006879] group-hover:text-[#00b8d4] transition-colors mt-6">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Open</span>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
