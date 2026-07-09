"use client";

import { motion } from "motion/react";
import { Globe, ArrowDown } from "lucide-react";
import { presentationSubtitle, portraitImage } from "../data";

export default function Hero() {
  const handleScrollToBio = () => {
    const element = document.getElementById("bio");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="hero"
      className="relative min-h-[85vh] bg-[#f9f9ff] flex flex-col justify-between pt-16 pb-12 overflow-hidden"
    >
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00b8d4]/10 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-[#0d223f]/5 rounded-full filter blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center my-auto w-full relative z-10">
        <div className="lg:col-span-7 flex flex-col justify-center space-y-6 md:space-y-8 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#0d223f]/5 border border-[#0d223f]/10 self-center lg:self-start text-xs font-[family-name:var(--font-geist-sans)] tracking-widest uppercase text-[#0d223f] font-semibold"
          >
            <Globe className="w-3.5 h-3.5 text-[#00b8d4]" />
            <span>Accelerating World Evangelization</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-[family-name:var(--font-jakarta)] text-4xl md:text-5xl lg:text-6xl font-bold text-[#0d223f] tracking-tight leading-[1.1]"
          >
            Everyone can{" "}
            <span className="text-[#00b8d4] italic font-medium">reach</span>{" "}
            someone. <br className="hidden md:inline" />
            Together we can{" "}
            <span className="relative inline-block text-[#00b8d4]">
              reach the world!
              <span className="absolute left-0 bottom-0.5 w-full h-[6px] bg-[#a9edff]/50 -z-10 rounded-full" />
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-base md:text-lg lg:text-xl font-[family-name:var(--font-jakarta)] text-[#44474d] font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0"
          >
            {presentationSubtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4"
          >
            <button
              onClick={handleScrollToBio}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#00b8d4] text-white font-semibold font-[family-name:var(--font-geist-sans)] shadow-lg shadow-[#00b8d4]/20 hover:scale-105 transition-transform"
            >
              Explore Profile
            </button>
            <button
              onClick={() =>
                document
                  .getElementById("slides")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white border border-[#b4c7ec]/30 text-[#0d223f] hover:bg-[#f0f3ff] font-medium font-[family-name:var(--font-geist-sans)] transition-all"
            >
              View Slide Deck
            </button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="lg:col-span-5 flex justify-center w-full"
        >
          <div className="relative w-full max-w-[400px] aspect-[4/5] rounded-[32px] bg-[#f0f3ff] shadow-xl overflow-hidden group border-4 border-white">
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d223f]/80 via-transparent to-transparent opacity-60 z-10 transition-opacity duration-300 group-hover:opacity-70" />

            <img
              src={portraitImage}
              alt="Dr. Young Cho Portrait"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
            />

            <div className="absolute bottom-6 left-6 right-6 z-20 flex flex-col space-y-1 text-white">
              <span className="text-[10px] font-[family-name:var(--font-geist-sans)] tracking-widest uppercase text-[#a9edff] font-bold">
                Director & Pastor
              </span>
              <h2 className="font-[family-name:var(--font-jakarta)] text-2xl font-semibold">
                Rev. Dr. Young Cho
              </h2>
              <p className="text-xs text-white/80 font-[family-name:var(--font-jakarta)]">
                Active in over 100 nations worldwide.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <div
        className="flex flex-col items-center justify-center text-[#0a1c34]/40 pt-8 cursor-pointer relative z-10"
        onClick={handleScrollToBio}
      >
        <span className="text-xs font-[family-name:var(--font-geist-sans)] tracking-widest uppercase mb-1">
          Scroll Down
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          <ArrowDown className="w-5 h-5 text-[#00b8d4]" />
        </motion.div>
      </div>
    </section>
  );
}
