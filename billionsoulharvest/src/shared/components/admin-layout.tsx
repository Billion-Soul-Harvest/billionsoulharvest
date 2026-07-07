"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { createClient } from "@/shared/utils/supabase/client";

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

type NavGroup = {
  label: string;
  icon: React.ReactNode;
  children: NavItem[];
};

type NavEntry = NavItem | NavGroup;

function isNavGroup(entry: NavEntry): entry is NavGroup {
  return "children" in entry;
}

const navItems: NavEntry[] = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: "People Management",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    children: [
      {
        label: "Contacts",
        href: "/admin/contacts",
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        ),
      },
      {
        label: "Audiences",
        href: "/admin/audiences",
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h10M4 18h7" />
          </svg>
        ),
      },
      {
        label: "Positions",
        href: "/admin/positions",
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2M3.02 9.573L3 16a2 2 0 002 2h14a2 2 0 002-2V9.574M3.02 9.573A23.94 23.94 0 0112 11c3.183 0 6.22-.62 9-1.745" />
          </svg>
        ),
      },
      {
        label: "Tags",
        href: "/admin/tags",
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "Events",
    href: "/admin/events",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: "Website",
    href: "/admin/website",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
  },
  {
    label: "Registrations",
    href: "/admin/registrations",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    label: "Follow-ups",
    href: "/admin/follow-ups",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: "Emails",
    href: "/admin/emails",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: "Regions",
    href: "/admin/regions",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  userEmail?: string;
}

export function AdminLayout({ children, userEmail }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auto-expand groups whose children match the current path
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const entry of navItems) {
      if (isNavGroup(entry)) {
        if (entry.children.some((c) => pathname.startsWith(c.href))) {
          initial[entry.label] = true;
        }
      }
    }
    return initial;
  });

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  // Full-screen builder mode — no sidebar
  if (pathname.includes("/builder")) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r flex flex-col transition-transform lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:z-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b">
          <Link href="/admin/dashboard" className="flex items-center">
            <Image
              src="/bsh-logo.png"
              alt="Billion Soul Harvest"
              width={180}
              height={60}
              className="h-10 w-auto"
              priority
            />
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((entry) => {
            if (isNavGroup(entry)) {
              const isGroupActive = entry.children.some(
                (child) => pathname === child.href || pathname.startsWith(child.href)
              );

              return (
                <div key={entry.label}>
                  <button
                    onClick={() =>
                      setOpenGroups((prev) => ({
                        ...prev,
                        [entry.label]: !prev[entry.label],
                      }))
                    }
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isGroupActive
                        ? "text-cyan-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    <span className={isGroupActive ? "text-cyan-600" : "text-gray-400"}>
                      {entry.icon}
                    </span>
                    <span className="flex-1 text-left">{entry.label}</span>
                    <svg
                      className={cn(
                        "w-4 h-4 text-gray-400 transition-transform",
                        openGroups[entry.label] && "rotate-90"
                      )}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  {openGroups[entry.label] && (
                    <div className="ml-4 mt-0.5 space-y-0.5">
                      {entry.children.map((child) => {
                        const isActive =
                          pathname === child.href || pathname.startsWith(child.href);

                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setSidebarOpen(false)}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                              isActive
                                ? "bg-cyan-50 text-cyan-700"
                                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                            )}
                          >
                            <span className={isActive ? "text-cyan-600" : "text-gray-400"}>
                              {child.icon}
                            </span>
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const isActive =
              pathname === entry.href ||
              (entry.href !== "/admin/dashboard" && pathname.startsWith(entry.href));

            return (
              <Link
                key={entry.href}
                href={entry.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-cyan-50 text-cyan-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <span className={isActive ? "text-cyan-600" : "text-gray-400"}>
                  {entry.icon}
                </span>
                {entry.label}
              </Link>
            );
          })}
        </nav>

        {/* View Site + User */}
        <div className="border-t px-4 py-3 space-y-2">
          <a
            href="https://www.billionsoulharvest.org"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View Site
          </a>
          {userEmail && (
            <p className="text-xs text-gray-400 truncate">{userEmail}</p>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs text-red-500 hover:text-red-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white border-b flex items-center px-6 lg:px-8 gap-4 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1" />
          {userEmail && (
            <span className="text-sm text-gray-500 hidden sm:block">{userEmail}</span>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 lg:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
