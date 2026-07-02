import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-amber-950 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-400/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, white 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />
      </div>

      <div className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center">
        {/* Logo / badge */}
        <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-6 py-2.5 mb-10">
          <div className="w-2 h-2 bg-amber-400 rounded-full" />
          <span className="text-amber-200/80 text-sm font-medium tracking-widest uppercase">
            Ministry Platform
          </span>
        </div>

        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold text-white mb-6 leading-[0.9] tracking-tight">
          Billion Soul
          <br />
          <span className="text-amber-400">Harvest</span>
        </h1>

        <p className="text-xl sm:text-2xl text-emerald-100/60 max-w-xl mx-auto mb-12 leading-relaxed">
          Reaching the nations for Christ. Join the movement.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/register/brazil-global-harvest-2026"
            className="inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all shadow-lg shadow-amber-900/30 hover:shadow-xl hover:shadow-amber-800/40"
          >
            Register for Brazil Summit
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>

          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-medium px-8 py-4 rounded-xl text-lg transition-all"
          >
            Admin Login
          </Link>
        </div>

        {/* Event teaser */}
        <div className="mt-20 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 max-w-md w-full">
          <p className="text-amber-300/60 text-xs font-semibold tracking-widest uppercase mb-3">
            Upcoming Event
          </p>
          <h3 className="text-xl font-bold text-white mb-2">
            Brazil Global Harvest Summit 2026
          </h3>
          <p className="text-emerald-100/50 text-sm mb-4">
            July 20-25, 2026 &middot; Brazil
          </p>
          <Link
            href="/register/brazil-global-harvest-2026"
            className="text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors"
          >
            Register now &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
