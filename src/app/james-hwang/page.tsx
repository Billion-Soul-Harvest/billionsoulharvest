"use client";

import { useState, useEffect } from "react";
import Hero from "./components/Hero";
import Bio from "./components/Bio";
import Publications from "./components/Publications";
import MediaLinks from "./components/MediaLinks";

export default function JamesHwangPage() {
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const sections = ["hero", "bio", "publications", "media"];
    const observers = sections.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(id);
          }
        },
        { rootMargin: "-30% 0px -60% 0px" }
      );

      observer.observe(el);
      return { el, observer };
    });

    return () => {
      observers.forEach((obs) => {
        if (obs) {
          obs.observer.unobserve(obs.el);
        }
      });
    };
  }, []);

  return (
    <div className="bg-[#f9f9ff] min-h-screen text-[#0a1c34] font-[family-name:var(--font-jakarta)] selection:bg-[#00b8d4]/25 selection:text-[#0d223f]">
      <Hero />
      <Bio />
      <Publications />
      <MediaLinks />
    </div>
  );
}
