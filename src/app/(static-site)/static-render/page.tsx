import Link from "next/link";
import { HeroSlideshow } from "./components/hero-slideshow";

export const revalidate = 3600;

export default function HomePage() {
  return (
    <div className="scroll-smooth">
      {/* ── Hero Section ── */}
      <header className="relative min-h-[100vh] flex items-center overflow-hidden">
        <HeroSlideshow />
        <div
          className="absolute inset-0 z-[1]"
          style={{
            background:
              "linear-gradient(to bottom, rgba(13,34,63,0.5), rgba(13,34,63,0.85))",
          }}
        />
        <div
          className="relative z-10 max-w-[1280px] mx-auto px-4 md:px-8 w-full"
          style={{ textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}
        >
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-[family-name:var(--font-jakarta)] text-4xl md:text-[56px] md:leading-[64px] font-bold text-white mb-6 tracking-[-0.02em]">
              Billion Soul Harvest
            </h1>
            <p className="font-[family-name:var(--font-jakarta)] text-xl md:text-2xl leading-9 text-[#a9edff] font-semibold mb-6">
              Mobilizing the Global Church for One Billion Souls by 2033
            </p>
            <p className="font-[family-name:var(--font-jakarta)] text-lg leading-8 text-white/85 mb-4 max-w-2xl mx-auto">
              Billion Soul Harvest is a global movement calling the Church to
              unite in prayer, evangelism, discipleship, leadership development,
              and strategic collaboration for the fulfillment of the Great
              Commission.
            </p>
            <p className="font-[family-name:var(--font-jakarta)] text-base leading-7 text-white/70 italic mb-10">
              Every Believer. Every Church. Every Nation. Every Soul.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/about#our-story"
                className="bg-[#00b8d4] text-white px-10 py-4 rounded-lg text-sm font-semibold font-[family-name:var(--font-geist-sans)] hover:bg-[#006879] transition-all inline-flex items-center gap-2"
              >
                Discover the Vision
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
              </Link>
              <Link
                href="/connect"
                className="border-2 border-white text-white px-10 py-4 rounded-lg text-sm font-semibold font-[family-name:var(--font-geist-sans)] hover:bg-white/10 transition-all"
              >
                Join the Movement
              </Link>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
