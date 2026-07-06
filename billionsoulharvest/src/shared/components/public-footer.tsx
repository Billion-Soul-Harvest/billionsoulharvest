import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/shared/utils/supabase/server";

export async function PublicFooter() {
  const supabase = await createClient();
  const { data: pages } = await supabase
    .from("site_pages")
    .select("title, slug, is_home, show_in_nav")
    .eq("published", true)
    .eq("show_in_nav", true)
    .order("sort_order");

  const links = (pages ?? [])
    .filter((p) => !p.is_home)
    .map((p) => ({ label: p.title, href: `/${p.slug}` }));

  return (
    <footer className="bg-[#0a1e38] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="mb-4">
              <Image
                src="/bsh-logo.png"
                alt="Billion Soul Harvest"
                width={200}
                height={54}
                className="h-12 w-auto brightness-0 invert"
              />
            </div>
            <p className="text-gray-400 text-sm max-w-md leading-relaxed">
              A global movement uniting churches, ministries, and leaders around the vision of catalyzing
              the greatest harvest of souls in history as we approach the year 2033.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 hover:text-[#29BDD6] text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Connect</h4>
            <ul className="space-y-2.5">
              <li>
                <a href="mailto:info@billionsoulharvest.org" className="text-gray-400 hover:text-[#29BDD6] text-sm transition-colors">
                  info@billionsoulharvest.org
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-gray-500 text-xs">
            &copy; {new Date().getFullYear()} Billion Soul Harvest. All rights reserved.
          </p>
          <a
            href={process.env.NEXT_PUBLIC_ADMIN_DOMAIN ? `https://${process.env.NEXT_PUBLIC_ADMIN_DOMAIN}/login` : "/login"}
            className="text-gray-500 hover:text-gray-400 text-xs transition-colors"
          >
            Admin Login
          </a>
        </div>
      </div>
    </footer>
  );
}
