"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import type { Event, EventPage } from "@/shared/types/database";

interface Props {
  event: Event;
  pages: EventPage[];
}

export function EventSiteHeader({ event, pages }: Props) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const activePageSlug = pathname.split(`/events/${event.slug}/`)[1] ?? "";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b border-[#b4c7ec]/20 backdrop-blur-md transition-all ${
        scrolled ? "bg-[#f9f9ff]/95 shadow-lg" : "bg-[#f9f9ff]/90"
      }`}
    >
      <div className="max-w-[1280px] mx-auto px-4 md:px-8">
        <div className="flex items-center h-16">
          {/* Back to main site */}
          <Link
            href="/gatherings"
            className="flex items-center gap-2 text-[#44474d] hover:text-[#0d223f] text-sm transition-colors mr-4 shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <Image
              src="/bsh-logo.png"
              alt="BSH"
              width={32}
              height={32}
              className="h-8 w-auto"
            />
          </Link>

          {/* Divider */}
          <div className="w-px h-6 bg-[#b4c7ec]/30 mr-4 shrink-0" />

          {/* Event title */}
          <Link
            href={`/events/${event.slug}`}
            className="font-[family-name:var(--font-jakarta)] text-[#0d223f] font-bold text-sm sm:text-base truncate mr-4"
          >
            {event.title}
          </Link>

          {/* Desktop page nav */}
          {pages.length > 0 && (
            <nav className="hidden md:flex items-center gap-1 ml-auto">
              <Link
                href={`/events/${event.slug}`}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium font-[family-name:var(--font-geist-sans)] transition-colors whitespace-nowrap",
                  activePageSlug === ""
                    ? "bg-[#0d223f] text-white"
                    : "text-[#44474d] hover:text-[#0d223f] hover:bg-[#0d223f]/5"
                )}
              >
                Home
              </Link>
              {pages.map((page) => {
                const href = `/events/${event.slug}/${page.slug}`;
                const isActive = activePageSlug === page.slug;
                return (
                  <Link
                    key={page.id}
                    href={href}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm font-medium font-[family-name:var(--font-geist-sans)] transition-colors whitespace-nowrap",
                      isActive
                        ? "bg-[#0d223f] text-white"
                        : "text-[#44474d] hover:text-[#0d223f] hover:bg-[#0d223f]/5"
                    )}
                  >
                    {page.title}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Register CTA */}
          {event.status === "published" && (
            <Link
              href={`/register/${event.slug}`}
              className="hidden sm:inline-flex items-center bg-[#00b8d4] hover:bg-[#00a3bc] text-white text-xs font-semibold font-[family-name:var(--font-geist-sans)] px-4 py-2 rounded-lg transition-colors ml-auto md:ml-4 shrink-0"
            >
              Register
            </Link>
          )}

          {/* Mobile toggle */}
          {pages.length > 0 && (
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden text-[#44474d] hover:text-[#0d223f] p-1 ml-auto"
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
        {mobileOpen && pages.length > 0 && (
          <nav className="md:hidden pb-3 border-t border-[#b4c7ec]/20 pt-2 space-y-1">
            <Link
              href={`/events/${event.slug}`}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "block px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                activePageSlug === ""
                  ? "text-[#0d223f] bg-[#0d223f]/5 font-semibold"
                  : "text-[#44474d] hover:text-[#0d223f] hover:bg-[#0d223f]/5"
              )}
            >
              Home
            </Link>
            {pages.map((page) => {
              const href = `/events/${event.slug}/${page.slug}`;
              const isActive = activePageSlug === page.slug;
              return (
                <Link
                  key={page.id}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "block px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "text-[#0d223f] bg-[#0d223f]/5 font-semibold"
                      : "text-[#44474d] hover:text-[#0d223f] hover:bg-[#0d223f]/5"
                  )}
                >
                  {page.title}
                </Link>
              );
            })}
            {event.status === "published" && (
              <Link
                href={`/register/${event.slug}`}
                onClick={() => setMobileOpen(false)}
                className="block text-center bg-[#00b8d4] hover:bg-[#00a3bc] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors mt-2"
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
