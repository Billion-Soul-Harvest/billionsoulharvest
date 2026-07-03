"use client";

import Link from "next/link";
import type { EventPage } from "@/shared/types/database";

interface Props {
  eventSlug: string;
  pages: EventPage[];
  activePageSlug: string;
}

export function EventPageTabs({ eventSlug, pages, activePageSlug }: Props) {
  if (pages.length <= 1) return null;

  return (
    <nav className="bg-[#0a1e38] border-b border-white/10 sticky top-0 z-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-1 overflow-x-auto py-2 -mb-px">
          {pages.map((page) => {
            const isActive = page.slug === activePageSlug;
            const href = page.sort_order === 0
              ? `/events/${eventSlug}`
              : `/events/${eventSlug}/${page.slug}`;
            return (
              <Link
                key={page.id}
                href={href}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-white/10 text-[#c69c3f]"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {page.title}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
