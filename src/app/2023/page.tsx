export default function Page2023() {
  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-gradient-to-br from-[#0d223f] via-[#132d4f] to-[#0a1b33]">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Glowing orbs */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-[#00b8d4]/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#00b8d4]/10 rounded-full blur-[120px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#a9edff]/5 rounded-full blur-[80px]" />

      <div className="relative z-10 text-center max-w-2xl px-6">
        {/* Construction icon */}
        <div className="mb-8 flex justify-center">
          <svg
            width="120"
            height="120"
            viewBox="0 0 120 120"
            fill="none"
            className="drop-shadow-2xl"
          >
            {/* Crane */}
            <rect x="20" y="70" width="6" height="40" rx="1" fill="#00b8d4" />
            <rect x="20" y="65" width="60" height="6" rx="1" fill="#00b8d4" />
            <rect x="74" y="65" width="3" height="20" rx="1" fill="#a9edff" />
            <rect x="70" y="82" width="11" height="8" rx="2" fill="#00b8d4" opacity="0.8" />
            {/* Building frame */}
            <rect x="50" y="50" width="50" height="60" rx="2" fill="none" stroke="#a9edff" strokeWidth="2" strokeDasharray="6 3" opacity="0.4" />
            <rect x="58" y="60" width="12" height="12" rx="1" fill="#00b8d4" opacity="0.3" />
            <rect x="78" y="60" width="12" height="12" rx="1" fill="#00b8d4" opacity="0.2" />
            <rect x="58" y="80" width="12" height="12" rx="1" fill="#00b8d4" opacity="0.2" />
            <rect x="78" y="80" width="12" height="12" rx="1" fill="#00b8d4" opacity="0.3" />
            <rect x="58" y="96" width="12" height="14" rx="1" fill="#00b8d4" opacity="0.15" />
            <rect x="78" y="96" width="12" height="14" rx="1" fill="#00b8d4" opacity="0.15" />
            {/* Ground line */}
            <line x1="10" y1="110" x2="110" y2="110" stroke="#a9edff" strokeWidth="2" opacity="0.3" />
            {/* Accent stripes */}
            <rect x="10" y="106" width="100" height="4" rx="1" fill="url(#caution)" />
            <defs>
              <pattern id="caution" x="0" y="0" width="8" height="4" patternUnits="userSpaceOnUse">
                <rect width="4" height="4" fill="#00b8d4" />
                <rect x="4" width="4" height="4" fill="#0d223f" />
              </pattern>
            </defs>
          </svg>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-[#00b8d4]/10 border border-[#00b8d4]/25 text-[#a9edff] text-sm font-medium font-[family-name:var(--font-jakarta)] tracking-wide uppercase">
          <span className="w-2 h-2 rounded-full bg-[#00b8d4] animate-pulse" />
          Under Construction
        </div>

        <h1 className="font-[family-name:var(--font-jakarta)] text-5xl md:text-6xl font-bold text-white tracking-[-0.02em] mb-4">
          BSH <span className="text-[#00b8d4]">2023</span>
        </h1>

        <p className="font-[family-name:var(--font-jakarta)] text-xl text-[#a9edff] font-semibold mb-4">
          We&apos;re building something special.
        </p>
        <p className="font-[family-name:var(--font-jakarta)] text-lg leading-8 text-white/70 mb-10 max-w-md mx-auto">
          The Billion Soul Harvest 2023 archive page is currently under
          construction. Stay tuned for photos, videos, and highlights from the
          event.
        </p>

        {/* Progress bar */}
        <div className="max-w-xs mx-auto mb-10">
          <div className="flex justify-between text-xs text-white/40 font-[family-name:var(--font-jakarta)] mb-2">
            <span>Progress</span>
            <span>Coming Soon</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#00b8d4] to-[#a9edff] rounded-full animate-pulse"
              style={{ width: "15%" }}
            />
          </div>
        </div>

        <a
          href="https://billionsoulharvest.org"
          className="inline-flex items-center gap-2 bg-[#00b8d4] text-white px-10 py-4 rounded-lg text-sm font-semibold font-[family-name:var(--font-geist-sans)] hover:bg-[#006879] transition-all shadow-lg shadow-[#00b8d4]/30"
        >
          Visit Main Site
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </a>
      </div>
    </div>
  );
}
