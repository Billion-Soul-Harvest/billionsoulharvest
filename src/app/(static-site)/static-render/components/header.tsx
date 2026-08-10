"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";

const navLinks = [
  {
    label: "About",
    href: "/about",
    submenu: [
      { label: "Our Story", href: "/about/our-story" },
      { label: "The BSH Logo", href: "/about/the-bsh-logo" },
      { label: "Global Leaders", href: "/about/global-leaders" },
      // { label: "2033 Roundtable", href: "/about/2033-roundtable" },
    ],
  },
  { label: "Gatherings", href: "/gatherings" },
  { label: "Initiatives", href: "/initiatives" },
  { label: "Stories", href: "/stories" },
  { label: "Connect", href: "/connect", cta: true },
];

export function StaticHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileNavRef = useRef<HTMLDivElement>(null);

  // Close mobile nav on route change
  useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        (!mobileNavRef.current || !mobileNavRef.current.contains(target))
      ) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 border-b border-white/[0.16] backdrop-blur-[14px] transition-all ${
        scrolled ? "bg-[#0a0a0a]/[0.92] shadow-lg" : "bg-[#0a0a0a]/[0.92]"
      }`}
    >
      <div className="flex justify-between items-center w-full px-4 md:px-10 py-3 max-w-[1280px] mx-auto">
        <Link href="/" className="h-14 flex items-center shrink-0 gap-4">
          <Image
            src="/bsh-icon-cyan.png"
            alt="Billion Soul Harvest"
            width={56}
            height={56}
            className="h-full w-auto object-contain mix-blend-screen"
            priority
          />
          <div className="flex flex-col justify-center h-14">
            <span className="font-[family-name:var(--font-jakarta)] text-white font-[900] text-[21px] leading-none tracking-[-0.025em] uppercase">
              Billion Soul Harvest
            </span>
            <span className="font-[family-name:var(--font-geist-mono)] text-white/70 text-[9px] font-medium uppercase tracking-[0.22em] w-full">
              Accelerating the Great Commission
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-7" ref={dropdownRef}>
          {navLinks.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && !item.href.startsWith("/#") && !item.href.startsWith("#") && pathname.startsWith(item.href));
            const hasSubmenu = "submenu" in item && item.submenu;
            const isDropdownOpen = openDropdown === item.label;

            return (
              <div
                key={item.href}
                className="relative"
                onMouseEnter={() => hasSubmenu && setOpenDropdown(item.label)}
                onMouseLeave={() => hasSubmenu && setOpenDropdown(null)}
              >
                {hasSubmenu ? (
                  <Link
                    href={item.href}
                    className={`flex items-center gap-1 text-xs font-bold tracking-[0.14em] uppercase font-[family-name:var(--font-geist-mono)] transition-all duration-300 py-1 ${
                      isActive
                        ? "text-[#1ecdec] border-b-2 border-[#1ecdec]"
                        : "text-white hover:text-[#1ecdec]"
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
                  </Link>
                ) : "cta" in item && item.cta ? (
                  <Link
                    href={item.href}
                    className="text-xs font-bold tracking-[0.14em] uppercase font-[family-name:var(--font-geist-mono)] transition-all duration-300 bg-[#1ecdec] text-[#0a0a0a] px-[22px] py-3 hover:bg-white"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <Link
                    href={item.href}
                    className={`text-xs font-bold tracking-[0.14em] uppercase font-[family-name:var(--font-geist-mono)] transition-all duration-300 py-1 ${
                      isActive
                        ? "text-[#1ecdec] border-b-2 border-[#1ecdec]"
                        : "text-white hover:text-[#1ecdec]"
                    }`}
                  >
                    {item.label}
                  </Link>
                )}

                {/* Dropdown */}
                {hasSubmenu && isDropdownOpen && (
                  <div className="absolute top-full left-0 pt-2">
                    <div className="bg-[#0f1316] rounded-xl shadow-xl border border-white/10 py-2 min-w-[200px] animate-in fade-in slide-in-from-top-1 duration-150">
                      {item.submenu!.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          onClick={() => setOpenDropdown(null)}
                          className="block px-4 py-2.5 text-sm font-bold text-white/80 hover:bg-white/10 hover:text-white transition-colors font-[family-name:var(--font-geist-sans)]"
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-white p-1"
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
        <div ref={mobileNavRef} className="md:hidden border-t border-white/10 bg-[#0a0a0a] px-4 pb-4 pt-3 space-y-1">
          {navLinks.map((item) => {
            const hasSubmenu = "submenu" in item && item.submenu;
            return (
              <div key={item.href}>
                {hasSubmenu ? (
                  <>
                    <div className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-bold text-white hover:bg-[#e7eeff] transition-colors">
                      <Link href={item.href}>
                        {item.label}
                      </Link>
                      <button
                        onClick={() =>
                          setOpenDropdown(
                            openDropdown === item.label ? null : item.label
                          )
                        }
                        className="p-1 -mr-1"
                        aria-label={`Toggle ${item.label} submenu`}
                      >
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
                    </div>
                    {openDropdown === item.label && (
                      <div className="ml-4 mt-1 space-y-1 border-l-2 border-[#1ecdec]/30 pl-3">
                        {item.submenu!.map((sub) => (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            className="block px-3 py-2 rounded-lg text-sm text-white/70 hover:bg-white/10 hover:text-[#1ecdec] transition-colors"
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
                    className="block px-3 py-2 rounded-lg text-sm font-bold text-white hover:bg-[#e7eeff] transition-colors"
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
