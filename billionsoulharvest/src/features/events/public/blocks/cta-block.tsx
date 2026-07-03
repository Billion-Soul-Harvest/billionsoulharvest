import Link from "next/link";
import type { Event } from "@/shared/types/database";

interface Props {
  event: Event;
  config: Record<string, unknown>;
}

export function CtaBlock({ event, config }: Props) {
  const text = (config.text as string) ?? "Register Now";
  const subtitle = config.subtitle as string | undefined;

  if (event.status !== "registration_open") return null;

  return (
    <section className="py-20 bg-[#0a1e38]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-white mb-4">
          Ready to Join?
        </h2>
        {subtitle && (
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">{subtitle}</p>
        )}
        <Link
          href={`/register/${event.slug}`}
          className="inline-flex items-center gap-2 bg-[#c69c3f] hover:bg-[#b08a35] text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors shadow-lg shadow-[#c69c3f]/20"
        >
          {text}
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
