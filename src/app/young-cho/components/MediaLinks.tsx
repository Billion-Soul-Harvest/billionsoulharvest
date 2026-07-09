"use client";

import { Play, Globe, ArrowUpRight, ExternalLink } from "lucide-react";
import { mediaLinks } from "../data";

export default function MediaLinks() {
  return (
    <section id="media" className="py-24 bg-[#f0f3ff] relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00b8d4]/5 rounded-full filter blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-[family-name:var(--font-geist-sans)] tracking-widest uppercase text-[#00b8d4] font-semibold">
            External Channels
          </span>
          <h2 className="font-[family-name:var(--font-jakarta)] text-3xl md:text-4xl lg:text-5xl font-bold text-[#0d223f] tracking-tight mt-2 leading-tight">
            Connect & Watch <br />
            <span className="text-[#00b8d4] italic font-medium">
              Dr. Young Cho&apos;s Work
            </span>
          </h2>
          <div className="w-16 h-[2px] bg-[#00b8d4] mx-auto mt-6" />
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {mediaLinks.map((media, idx) => {
            const isYoutube = media.platform === "YOUTUBE";
            return (
              <a
                key={idx}
                href={media.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative bg-white rounded-2xl p-8 border border-[#b4c7ec]/20 shadow-sm hover:shadow-lg hover:border-[#00b8d4]/40 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <span
                      className={`px-3 py-1 rounded-full font-[family-name:var(--font-geist-sans)] text-[10px] uppercase font-bold tracking-widest ${
                        isYoutube
                          ? "bg-red-50 text-red-600"
                          : "bg-[#00b8d4]/10 text-[#006879]"
                      }`}
                    >
                      {media.platform}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-[#f0f3ff] text-[#44474d] flex items-center justify-center group-hover:bg-[#00b8d4] group-hover:text-white transition-all duration-300">
                      <ArrowUpRight className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 mb-6">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                        isYoutube
                          ? "bg-red-50 text-red-600"
                          : "bg-[#00b8d4]/10 text-[#006879]"
                      }`}
                    >
                      {isYoutube ? (
                        <Play className="w-8 h-8 fill-red-600/10" />
                      ) : (
                        <Globe className="w-8 h-8" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-[family-name:var(--font-jakarta)] text-xl font-bold text-[#0d223f] leading-none">
                        {media.label}
                      </h3>
                      <p className="text-[10px] font-[family-name:var(--font-geist-sans)] uppercase tracking-widest text-[#00b8d4] mt-1">
                        Official Resource
                      </p>
                    </div>
                  </div>

                  <p className="text-sm font-[family-name:var(--font-jakarta)] text-[#44474d] leading-relaxed mb-6">
                    {media.description}
                  </p>
                </div>

                <div className="flex items-center space-x-2 text-xs font-[family-name:var(--font-geist-sans)] font-bold text-[#006879] group-hover:text-[#00b8d4] transition-colors mt-auto">
                  <ExternalLink className="w-4 h-4" />
                  <span>
                    Visit {isYoutube ? "YouTube Channel" : "Official Portal"}
                  </span>
                </div>
              </a>
            );
          })}
        </div>

      </div>
    </section>
  );
}
