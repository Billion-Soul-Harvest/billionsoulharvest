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
        {/* Construction scene illustration */}
        <div className="mb-10 flex justify-center">
          <svg
            width="280"
            height="220"
            viewBox="0 0 280 220"
            fill="none"
            className="drop-shadow-2xl"
          >
            {/* Crane tower */}
            <rect x="30" y="40" width="8" height="160" rx="2" fill="#00b8d4" />
            <rect x="26" y="36" width="16" height="8" rx="2" fill="#00b8d4" />
            {/* Crane arm */}
            <rect x="30" y="36" width="100" height="5" rx="1" fill="#00b8d4" />
            {/* Crane counter-weight */}
            <rect x="14" y="36" width="20" height="5" rx="1" fill="#00b8d4" />
            <rect x="14" y="41" width="12" height="10" rx="1" fill="#00b8d4" opacity="0.7" />
            {/* Crane cable */}
            <line x1="120" y1="41" x2="120" y2="80" stroke="#a9edff" strokeWidth="1.5" />
            {/* Crane hook */}
            <path d="M116 80 L124 80 L122 86 Q120 90 118 86 Z" fill="#a9edff" />
            {/* Dangling block from crane */}
            <rect x="112" y="90" width="16" height="12" rx="2" fill="#00b8d4" opacity="0.5" />

            {/* Building under construction */}
            <rect x="150" y="80" width="90" height="120" rx="3" fill="none" stroke="#a9edff" strokeWidth="2" strokeDasharray="8 4" opacity="0.3" />
            {/* Completed floors (bottom) */}
            <rect x="152" y="160" width="86" height="38" rx="2" fill="#00b8d4" opacity="0.15" />
            <rect x="152" y="120" width="86" height="38" rx="2" fill="#00b8d4" opacity="0.1" />
            {/* Windows - bottom floor */}
            <rect x="162" y="168" width="14" height="18" rx="2" fill="#a9edff" opacity="0.2" />
            <rect x="184" y="168" width="14" height="18" rx="2" fill="#a9edff" opacity="0.15" />
            <rect x="206" y="168" width="14" height="18" rx="2" fill="#a9edff" opacity="0.2" />
            {/* Windows - second floor */}
            <rect x="162" y="128" width="14" height="18" rx="2" fill="#a9edff" opacity="0.15" />
            <rect x="184" y="128" width="14" height="18" rx="2" fill="#a9edff" opacity="0.1" />
            <rect x="206" y="128" width="14" height="18" rx="2" fill="#a9edff" opacity="0.15" />
            {/* Scaffolding lines */}
            <line x1="150" y1="120" x2="240" y2="120" stroke="#a9edff" strokeWidth="1" opacity="0.3" />
            <line x1="150" y1="160" x2="240" y2="160" stroke="#a9edff" strokeWidth="1" opacity="0.3" />

            {/* Construction worker 1 - standing with tool */}
            {/* Hard hat */}
            <ellipse cx="80" cy="148" rx="8" ry="4" fill="#00b8d4" />
            <rect x="73" y="144" width="14" height="5" rx="2" fill="#00b8d4" />
            {/* Head */}
            <circle cx="80" cy="155" r="6" fill="#e8c4a0" />
            {/* Body/vest */}
            <rect x="73" y="161" width="14" height="18" rx="3" fill="#00b8d4" opacity="0.8" />
            {/* Safety vest stripes */}
            <line x1="73" y1="168" x2="87" y2="168" stroke="#a9edff" strokeWidth="1.5" />
            <line x1="73" y1="173" x2="87" y2="173" stroke="#a9edff" strokeWidth="1.5" />
            {/* Legs */}
            <rect x="75" y="179" width="4" height="16" rx="2" fill="#334155" />
            <rect x="81" y="179" width="4" height="16" rx="2" fill="#334155" />
            {/* Boots */}
            <rect x="74" y="193" width="6" height="4" rx="1" fill="#1e293b" />
            <rect x="80" y="193" width="6" height="4" rx="1" fill="#1e293b" />
            {/* Arm holding hammer */}
            <line x1="87" y1="164" x2="97" y2="172" stroke="#e8c4a0" strokeWidth="3" strokeLinecap="round" />
            {/* Hammer */}
            <rect x="95" y="168" width="4" height="12" rx="1" fill="#8B6914" />
            <rect x="92" y="165" width="10" height="5" rx="1" fill="#64748b" />

            {/* Construction worker 2 - on building, laying bricks */}
            {/* Hard hat */}
            <ellipse cx="175" cy="108" rx="7" ry="3.5" fill="#00b8d4" />
            <rect x="169" y="105" width="12" height="4" rx="2" fill="#00b8d4" />
            {/* Head */}
            <circle cx="175" cy="114" r="5.5" fill="#c9956b" />
            {/* Body */}
            <rect x="169" y="119" width="12" height="16" rx="3" fill="#00b8d4" opacity="0.8" />
            {/* Safety vest stripe */}
            <line x1="169" y1="126" x2="181" y2="126" stroke="#a9edff" strokeWidth="1.5" />
            {/* Arms - reaching to place brick */}
            <line x1="181" y1="122" x2="196" y2="118" stroke="#c9956b" strokeWidth="3" strokeLinecap="round" />
            <line x1="169" y1="124" x2="160" y2="130" stroke="#c9956b" strokeWidth="3" strokeLinecap="round" />
            {/* Brick being placed */}
            <rect x="194" y="114" width="16" height="8" rx="1" fill="#00b8d4" opacity="0.4" />
            {/* Legs (kneeling on scaffolding) */}
            <rect x="170" y="135" width="4" height="10" rx="2" fill="#334155" />
            <rect x="176" y="135" width="4" height="10" rx="2" fill="#334155" />

            {/* Bricks / materials on ground */}
            <rect x="100" y="192" width="14" height="8" rx="1" fill="#00b8d4" opacity="0.3" />
            <rect x="104" y="184" width="14" height="8" rx="1" fill="#00b8d4" opacity="0.25" />
            <rect x="116" y="192" width="14" height="8" rx="1" fill="#00b8d4" opacity="0.2" />

            {/* Traffic cone */}
            <polygon points="56,197 62,197 59,183" fill="#00b8d4" opacity="0.6" />
            <line x1="56" y1="190" x2="62" y2="190" stroke="#a9edff" strokeWidth="1.5" opacity="0.5" />
            <rect x="53" y="197" width="12" height="3" rx="1" fill="#00b8d4" opacity="0.4" />

            {/* Ground / caution stripe */}
            <rect x="10" y="200" width="260" height="5" rx="1" fill="url(#caution)" />
            <line x1="10" y1="200" x2="270" y2="200" stroke="#a9edff" strokeWidth="1" opacity="0.2" />

            {/* Dust particles */}
            <circle cx="140" cy="190" r="1.5" fill="#a9edff" opacity="0.2" />
            <circle cx="200" cy="100" r="1" fill="#a9edff" opacity="0.15" />
            <circle cx="50" cy="170" r="1" fill="#a9edff" opacity="0.2" />
            <circle cx="230" cy="150" r="1.5" fill="#a9edff" opacity="0.15" />
            <circle cx="110" cy="130" r="1" fill="#a9edff" opacity="0.1" />

            <defs>
              <pattern id="caution" x="0" y="0" width="10" height="5" patternUnits="userSpaceOnUse">
                <rect width="5" height="5" fill="#00b8d4" opacity="0.6" />
                <rect x="5" width="5" height="5" fill="#0d223f" />
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
