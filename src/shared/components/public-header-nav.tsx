"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef, useCallback } from "react";
import type { NavItem } from "./public-header";

function NavLink({ href, onClick, className, children }: {
  href: string;
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const isAnchor = href.includes("#");

  const handleClick = (e: React.MouseEvent) => {
    if (isAnchor) {
      e.preventDefault();
      const [path, hash] = href.split("#");
      const currentPath = window.location.pathname;
      const targetPath = path || "/";

      const scrollToEl = () => {
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      };

      if (currentPath === targetPath) {
        scrollToEl();
      } else {
        router.push(targetPath);
        // Wait for navigation, then scroll
        setTimeout(scrollToEl, 500);
      }
    }
    onClick?.();
  };

  return (
    <Link href={href} onClick={handleClick} className={className}>
      {children}
    </Link>
  );
}

interface Props {
  navItems: NavItem[];
}

function DesktopDropdown({ item, pathname }: { item: NavItem; pathname: string }) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isActive = pathname === item.href ||
    (item.href !== "/" && pathname.startsWith(item.href)) ||
    item.children?.some((c) => pathname === c.href || (c.href !== "/" && pathname.startsWith(c.href)));

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setOpen(false);
  }, []);

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [open, handleKeyDown]);

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
          isActive
            ? "text-[#29BDD6] bg-white/5"
            : "text-gray-300 hover:text-white hover:bg-white/5"
        )}
      >
        {item.label}
        <svg
          className={cn("w-3.5 h-3.5 transition-transform", open && "rotate-180")}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border py-1 min-w-[180px] z-50">
          {item.children!.map((child) => {
            const childActive = pathname === child.href ||
              (child.href !== "/" && pathname.startsWith(child.href));
            return (
              <NavLink
                key={child.href}
                href={child.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "block px-4 py-2 text-sm transition-colors",
                  childActive
                    ? "text-[#29BDD6] bg-gray-50"
                    : "text-gray-800 hover:bg-gray-50"
                )}
              >
                {child.label}
              </NavLink>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function PublicHeaderNav({ navItems }: Props) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedMobile, setExpandedMobile] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-50 bg-[#0f2744]/95 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <Image
              src="/bsh-logo.png"
              alt="Billion Soul Harvest"
              width={180}
              height={48}
              className="h-10 w-auto brightness-0 invert"
              priority
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              if (item.children?.length) {
                return <DesktopDropdown key={item.href} item={item} pathname={pathname} />;
              }
              const isActive = pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "text-[#29BDD6] bg-white/5"
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Mobile toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden text-gray-300 hover:text-white p-1"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileOpen}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <nav className="lg:hidden pb-4 border-t border-white/10 pt-3 space-y-1">
            {navItems.map((item) => {
              if (item.children?.length) {
                const isExpanded = expandedMobile === item.href;
                const isActive = item.children.some(
                  (c) => pathname === c.href || (c.href !== "/" && pathname.startsWith(c.href))
                );
                return (
                  <div key={item.href}>
                    <button
                      onClick={() => setExpandedMobile(isExpanded ? null : item.href)}
                      className={cn(
                        "flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "text-[#29BDD6] bg-white/5"
                          : "text-gray-300 hover:text-white hover:bg-white/5"
                      )}
                    >
                      {item.label}
                      <svg
                        className={cn("w-4 h-4 transition-transform", isExpanded && "rotate-180")}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isExpanded && (
                      <div className="pl-4 space-y-1 mt-1">
                        {item.children.map((child) => {
                          const childActive = pathname === child.href ||
                            (child.href !== "/" && pathname.startsWith(child.href));
                          return (
                            <NavLink
                              key={child.href}
                              href={child.href}
                              onClick={() => setMobileOpen(false)}
                              className={cn(
                                "block px-3 py-2 rounded-lg text-sm transition-colors",
                                childActive
                                  ? "text-[#29BDD6] bg-white/5"
                                  : "text-gray-300 hover:text-white hover:bg-white/5"
                              )}
                            >
                              {child.label}
                            </NavLink>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              const isActive = pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "block px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "text-[#29BDD6] bg-white/5"
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
}
