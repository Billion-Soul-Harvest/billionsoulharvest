import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/shared/utils/supabase/server";
import type { FooterConfig } from "@/shared/types/database";

export async function PublicFooter() {
  const supabase = await createClient();

  // Read footer config
  const { data: settings } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "footer_config")
    .single();

  if (!settings) return null;

  const config = settings.value as unknown as FooterConfig;

  // Read nav links
  const { data: pages } = await supabase
    .from("site_pages")
    .select("title, slug, is_home, show_in_nav")
    .eq("published", true)
    .eq("show_in_nav", true)
    .order("sort_order");

  const links = (pages ?? [])
    .filter((p) => !p.is_home)
    .map((p) => ({ label: p.title, href: `/${p.slug}` }));

  const copyrightText = config.copyrightText
    || `© ${new Date().getFullYear()} Billion Soul Harvest. All rights reserved.`;

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
              {config.description}
            </p>
          </div>

          {/* Quick Links */}
          {links.length > 0 && (
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
          )}

          {/* Connect */}
          {config.email && (
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Connect</h4>
              <ul className="space-y-2.5">
                <li>
                  <a href={`mailto:${config.email}`} className="text-gray-400 hover:text-[#29BDD6] text-sm transition-colors">
                    {config.email}
                  </a>
                </li>
              </ul>
            </div>
          )}
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-gray-500 text-xs">
            {copyrightText}
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
