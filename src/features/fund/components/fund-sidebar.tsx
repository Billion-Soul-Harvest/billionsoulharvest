"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface SidebarLink {
  href: string;
  label: string;
}

interface FundSidebarProps {
  links: SidebarLink[];
  title: string;
}

export function FundSidebar({ links, title }: FundSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-full lg:w-56 shrink-0">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">{title}</h2>
      <nav className="space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "block px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-cyan-50 text-cyan-700"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
