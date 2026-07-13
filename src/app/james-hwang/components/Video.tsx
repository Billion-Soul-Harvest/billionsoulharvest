"use client";

import { Play } from "lucide-react";
import { videoUrl, videoTitle } from "../data";

export default function Video() {
  return (
    <section id="video" className="py-24 bg-[#f9f9ff] relative overflow-hidden">
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#00b8d4]/5 rounded-full filter blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-[family-name:var(--font-geist-sans)] tracking-widest uppercase text-[#00b8d4] font-semibold">
            Featured Video
          </span>
          <h2 className="font-[family-name:var(--font-jakarta)] text-3xl md:text-4xl lg:text-5xl font-bold text-[#0d223f] tracking-tight mt-2 leading-tight">
            <span className="text-[#00b8d4] italic font-medium">Watch</span>
          </h2>
          <div className="w-16 h-[2px] bg-[#00b8d4] mx-auto mt-6" />
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl border border-[#b4c7ec]/20 shadow-md overflow-hidden">
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
              <iframe
                className="absolute inset-0 w-full h-full"
                src={videoUrl}
                title={videoTitle}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
            <div className="p-6 flex items-center space-x-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <Play className="w-5 h-5 text-red-600 fill-red-600/10" />
              </div>
              <p className="font-[family-name:var(--font-jakarta)] text-sm font-medium text-[#0d223f] leading-snug">
                {videoTitle}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
