"use client";

import { useEffect, useRef, useState } from "react";

interface ScrollRevealProps {
  animation: string;
  children: React.ReactNode;
}

export function ScrollReveal({ animation, children }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={visible ? `sr-visible sr-${animation}` : "sr-hidden"}
      style={{ width: "100%" }}
    >
      {children}
    </div>
  );
}
