"use client";

import { useEffect, useState } from "react";

const images = [
  "/hero/home/initiatives-hero-bg.webp",
  "/hero/home/media-hero-bg.webp",
  "/hero/home/ghs-stage-1.jpg",
  "/hero/home/ghs-stage-2.jpg",
  "/hero/home/ghs-stage-3.jpg",
  "/hero/home/ghs-stage-4.jpg",
];

const INTERVAL = 6000; // 6 seconds per image

export function HeroSlideshow() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, INTERVAL);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          className="absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-[1500ms] ease-in-out"
          style={{ opacity: i === current ? 1 : 0 }}
        />
      ))}
    </>
  );
}
