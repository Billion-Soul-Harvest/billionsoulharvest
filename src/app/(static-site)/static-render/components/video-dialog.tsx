"use client";

import { useState, type ReactNode } from "react";

interface VideoDialogButtonProps {
  videoSrc?: string;
  title?: string;
  className?: string;
  children?: ReactNode;
}

export function VideoDialogButton({
  videoSrc = "https://www.youtube.com/embed/MI1lLGzz8Yc?autoplay=1&list=PLdpxR1zIM1Imjv5FVb2L-SchuheE4egFB",
  title = "Billion Soul Harvest",
  className = "border-2 border-white text-white px-10 py-4 rounded-lg text-sm font-semibold font-[family-name:var(--font-geist-sans)] hover:bg-white/10 transition-all",
  children = "Watch Our Story",
}: VideoDialogButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={className}
      >
        {children}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl mx-4 aspect-video"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white transition-colors"
              aria-label="Close video"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <iframe
              src={open ? videoSrc : undefined}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  );
}
