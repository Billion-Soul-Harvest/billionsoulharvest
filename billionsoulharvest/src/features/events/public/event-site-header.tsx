"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";
import type { Event, EventPage } from "@/shared/types/database";

interface Props {
  event: Event;
  pages: EventPage[];
}

export function EventSiteHeader({ event, pages }: Props) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const activePageSlug = pathname.split(`/events/${event.slug}/`)[1] ?? "";

  return (
    <header className="sticky top-0 z-50 bg-[#0f2744]/95 backdrop-blur-md border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-14">
          {/* Back to main site */}
          <Link
            href="/gatherings"
            className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors mr-4 shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">BSH</span>
          </Link>

          {/* Divider */}
          <div className="w-px h-6 bg-white/10 mr-4 shrink-0" />

          {/* Event title */}
          <Link
            href={`/events/${event.slug}`}
            className="font-[family-name:var(--font-heading)] text-white font-bold text-sm sm:text-base truncate mr-4"
          >
            {event.title}
          </Link>

          {/* Desktop page nav */}
          {pages.length > 1 && (
            <nav className="hidden md:flex items-center gap-0.5 ml-auto">
              {pages.map((page) => {
                const href = page.sort_order === 0
                  ? `/events/${event.slug}`
                  : `/events/${event.slug}/${page.slug}`;
                const isActive = page.sort_order === 0
                  ? activePageSlug === ""
                  : activePageSlug === page.slug;
                return (
                  <Link
                    key={page.id}
                    href={href}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                      isActive
                        ? "bg-white/10 text-[#29BDD6]"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    {page.title}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Register CTA */}
          {event.status === "registration_open" && (
            <Link
              href={`/register/${event.slug}`}
              className="hidden sm:inline-flex items-center bg-[#29BDD6] hover:bg-[#1a9ab5] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ml-auto md:ml-4 shrink-0"
            >
              Register
            </Link>
          )}

          {/* Mobile toggle */}
          {pages.length > 1 && (
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden text-gray-300 hover:text-white p-1 ml-auto"
              aria-label="Toggle event navigation"
              aria-expanded={mobileOpen}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          )}
        </div>

        {/* Mobile page nav */}
        {mobileOpen && pages.length > 1 && (
          <nav className="md:hidden pb-3 border-t border-white/10 pt-2 space-y-1">
            {pages.map((page) => {
              const href = page.sort_order === 0
                ? `/events/${event.slug}`
                : `/events/${event.slug}/${page.slug}`;
              const isActive = page.sort_order === 0
                ? activePageSlug === ""
                : activePageSlug === page.slug;
              return (
                <Link
                  key={page.id}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "block px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "text-[#29BDD6] bg-white/5"
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  )}
                >
                  {page.title}
                </Link>
              );
            })}
            {event.status === "registration_open" && (
              <Link
                href={`/register/${event.slug}`}
                onClick={() => setMobileOpen(false)}
                className="block text-center bg-[#29BDD6] hover:bg-[#1a9ab5] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors mt-2"
              >
                Register
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
