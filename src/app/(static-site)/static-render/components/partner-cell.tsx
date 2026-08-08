"use client";

import { useState } from "react";

export function PartnerCell({
  name,
  logo,
  dark,
  fill,
}: {
  name: string;
  logo: string;
  dark?: boolean;
  fill?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={`flex items-center justify-center px-[22px] py-[24px] min-h-[118px] transition-colors duration-300 ${
        dark ? "bg-[#0d223f] hover:bg-[#0a0a0a]" : "bg-white hover:bg-[#f5f7fa]"
      }`}
    >
      {failed ? (
        <span
          className={`font-[family-name:var(--font-jakarta)] text-xs font-semibold text-center leading-tight ${
            dark ? "text-white" : "text-[#0d223f]"
          }`}
        >
          {name}
        </span>
      ) : (
        <img
          src={logo}
          alt={name}
          className={`w-auto object-contain ${fill ? "max-h-[70px] max-w-full" : "max-h-[62px] max-w-full"}`}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
