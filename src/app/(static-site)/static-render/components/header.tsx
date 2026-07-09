"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";

const navLinks = [
  { label: "Home", href: "/" },
  {
    label: "Who We Are",
    href: "/about",
    submenu: [
      { label: "Our Story", href: "/about#our-story" },
      { label: "Our Journey", href: "/about#our-journey" },
      { label: "Our Leadership", href: "/about#our-leadership" },
      { label: "Advisory Council", href: "/about#advisory-council" },
    ],
  },
  { label: "Initiatives", href: "/initiatives" },
  { label: "Gatherings", href: "/gatherings" },
  { label: "Media", href: "/media" },
  { label: "Connect", href: "/connect" },
];

export function StaticHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 border-b border-[#b4c7ec]/20 backdrop-blur-md transition-all ${
        scrolled ? "bg-[#f9f9ff]/95 shadow-lg" : "bg-[#f9f9ff]/90"
      }`}
    >
      <div className="flex justify-between items-center w-full px-4 md:px-8 py-4 max-w-[1280px] mx-auto">
        <Link href="/" className="h-12 flex items-center shrink-0">
          <Image
            src="/bsh-logo.webp"
            alt="Billion Soul Harvest"
            width={180}
            height={48}
            className="h-full w-auto object-contain"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8" ref={dropdownRef}>
          {navLinks.map((item) => {
            const isActive =
              !item.href.startsWith("#") &&
              (pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href)));
            const hasSubmenu = "submenu" in item && item.submenu;
            const isDropdownOpen = openDropdown === item.label;

            return (
              <div key={item.href} className="relative">
                {hasSubmenu ? (
                  <button
                    onClick={() =>
                      setOpenDropdown(isDropdownOpen ? null : item.label)
                    }
                    className={`flex items-center gap-1 text-sm font-medium tracking-[0.01em] font-[family-name:var(--font-geist-sans)] transition-all duration-300 py-1 ${
                      isActive
                        ? "text-[#006879] font-bold border-b-2 border-[#006879]"
                        : "text-[#0a1c34] hover:text-[#00b8d4]"
                    }`}
                  >
                    {item.label}
                    <svg
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isDropdownOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className={`text-sm font-medium tracking-[0.01em] font-[family-name:var(--font-geist-sans)] transition-all duration-300 py-1 ${
                      isActive
                        ? "text-[#006879] font-bold border-b-2 border-[#006879]"
                        : "text-[#0a1c34] hover:text-[#00b8d4]"
                    }`}
                  >
                    {item.label}
                  </Link>
                )}

                {/* Dropdown */}
                {hasSubmenu && isDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-[#b4c7ec]/20 py-2 min-w-[200px] animate-in fade-in slide-in-from-top-1 duration-150">
                    {item.submenu!.map((sub) => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        onClick={() => setOpenDropdown(null)}
                        className="block px-4 py-2.5 text-sm font-medium text-[#0a1c34] hover:bg-[#f0f3ff] hover:text-[#00b8d4] transition-colors font-[family-name:var(--font-geist-sans)]"
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-[#0a1c34] p-1"
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {mobileOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#b4c7ec]/20 bg-[#f9f9ff] px-4 pb-4 pt-3 space-y-1">
          {navLinks.map((item) => {
            const hasSubmenu = "submenu" in item && item.submenu;
            return (
              <div key={item.href}>
                {hasSubmenu ? (
                  <>
                    <button
                      onClick={() =>
                        setOpenDropdown(
                          openDropdown === item.label ? null : item.label
                        )
                      }
                      className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium text-[#0a1c34] hover:bg-[#e7eeff] transition-colors"
                    >
                      {item.label}
                      <svg
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          openDropdown === item.label ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    {openDropdown === item.label && (
                      <div className="ml-4 mt-1 space-y-1 border-l-2 border-[#00b8d4]/30 pl-3">
                        {item.submenu!.map((sub) => (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            onClick={() => {
                              setMobileOpen(false);
                              setOpenDropdown(null);
                            }}
                            className="block px-3 py-2 rounded-lg text-sm text-[#44474d] hover:bg-[#e7eeff] hover:text-[#00b8d4] transition-colors"
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-[#0a1c34] hover:bg-[#e7eeff] transition-colors"
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </nav>
  );
}
