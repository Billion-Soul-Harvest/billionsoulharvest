"use client";

import { useEffect, useState } from "react";

const images = [
  "/hero-harvest.webp",
  "/about-hero-bg.jpg",
  "/initiatives-hero-bg.webp",
  "/connect-hero-bg.webp",
  "/media-hero-bg.webp",
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
