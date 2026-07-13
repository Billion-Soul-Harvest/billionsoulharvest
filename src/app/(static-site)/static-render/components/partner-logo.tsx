"use client";

import { useState } from "react";

export function PartnerLogo({ name, logo, dark, iconWithText, fill }: { name: string; logo: string; dark?: boolean; iconWithText?: boolean; fill?: boolean }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={`rounded-xl border p-4 flex items-center justify-center h-24 hover:shadow-lg hover:scale-105 hover:-translate-y-1 transition-all duration-300 cursor-pointer ${
      dark
        ? "bg-[#0d223f] border-[#0d223f]/20 hover:border-[#00b8d4]/50 hover:shadow-[#00b8d4]/10"
        : "bg-[#f9f9ff] border-[#b4c7ec]/20 hover:border-[#00b8d4]/50 hover:shadow-[#00b8d4]/10"
    }`}>
      {failed ? (
        <span className="text-xs font-semibold text-[#0d223f] text-center leading-tight font-[family-name:var(--font-jakarta)]">
          {name}
        </span>
      ) : iconWithText ? (
        <div className="flex items-center gap-2">
          <img
            src={logo}
            alt={name}
            className="h-8 w-8 object-contain"
            onError={() => setFailed(true)}
          />
          <span className="text-[10px] font-bold text-[#0d223f] text-center leading-tight font-[family-name:var(--font-jakarta)]">
            {name}
          </span>
        </div>
      ) : (
        <img
          src={logo}
          alt={name}
          className={fill ? "max-h-full max-w-full object-contain" : "max-h-16 max-w-full object-contain"}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
