"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/shared/utils/supabase/client";
import { cn } from "@/lib/utils";
import type { User } from "@supabase/supabase-js";

export function FundHeader() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <Link href="/fund" className="flex items-center gap-2 shrink-0">
              <Image
                src="/bsh-logo.png"
                alt="BSH Fund"
                width={140}
                height={46}
                className="h-8 w-auto"
                priority
              />
              <span className="text-sm font-bold text-cyan-700 border-l border-gray-200 pl-2.5 ml-0.5">
                Fund
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/fund/search"
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-full transition-colors",
                  pathname === "/fund/search"
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                Donate
              </Link>
              <Link
                href="/fund/campaigns/new"
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-full transition-colors",
                  pathname === "/fund/campaigns/new"
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                Fundraise
              </Link>
            </nav>
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Search link */}
            <Link
              href="/fund/search"
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Search campaigns"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>

            {user ? (
              <>
                <Link
                  href="/fund/dashboard"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/fund/campaigns/new"
                  className="inline-flex items-center px-5 py-2 text-sm font-semibold text-white bg-cyan-600 hover:bg-cyan-700 rounded-full transition-colors"
                >
                  Start a Campaign
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/fund/login"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/fund/signup"
                  className="inline-flex items-center px-5 py-2 text-sm font-semibold text-white bg-cyan-600 hover:bg-cyan-700 rounded-full transition-colors"
                >
                  Start a Campaign
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 space-y-1">
            <Link
              href="/fund/search"
              onClick={() => setMenuOpen(false)}
              className={cn(
                "block px-3 py-2 text-sm font-medium rounded-lg",
                pathname === "/fund/search" ? "bg-cyan-50 text-cyan-700" : "text-gray-600 hover:bg-gray-50"
              )}
            >
              Donate
            </Link>
            <Link
              href="/fund/campaigns/new"
              onClick={() => setMenuOpen(false)}
              className={cn(
                "block px-3 py-2 text-sm font-medium rounded-lg",
                pathname === "/fund/campaigns/new" ? "bg-cyan-50 text-cyan-700" : "text-gray-600 hover:bg-gray-50"
              )}
            >
              Fundraise
            </Link>
            <div className="border-t border-gray-100 pt-2 mt-2 space-y-1">
              {user ? (
                <>
                  <Link href="/fund/dashboard" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg">
                    Dashboard
                  </Link>
                  <Link href="/fund/campaigns/new" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-cyan-700">
                    Start a Campaign
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/fund/login" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg">
                    Sign in
                  </Link>
                  <Link href="/fund/signup" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-cyan-700">
                    Start a Campaign
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
