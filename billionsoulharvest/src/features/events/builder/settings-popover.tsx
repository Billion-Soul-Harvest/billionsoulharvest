"use client";

import React, { useEffect, useRef } from "react";

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  settings: React.ElementType<any>;
  position: { top: number; left: number };
  onClose: () => void;
}

export function SettingsPopover({ settings, position, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        // Don't close if clicking the toolbar gear icon
        const target = e.target as HTMLElement;
        if (target.closest("[title='Settings']")) return;
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute z-50 bg-white rounded-lg shadow-xl border border-gray-200 w-72 max-h-[400px] overflow-y-auto"
      style={{
        top: `${position.top + 48}px`,
        left: `${position.left}px`,
        transform: "translateX(-50%)",
      }}
    >
      <div className="p-3 border-b border-gray-100 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Settings</span>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="p-4">
        {React.createElement(settings)}
      </div>
    </div>
  );
}
