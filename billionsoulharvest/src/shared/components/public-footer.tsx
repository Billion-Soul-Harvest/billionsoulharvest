import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="bg-[#0a1e38] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-[#c69c3f] to-[#a37e2e] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">BSH</span>
              </div>
              <div>
                <p className="font-semibold text-white text-sm">Billion Soul Harvest</p>
                <p className="text-[10px] text-[#c69c3f]/70 uppercase tracking-wider">Reaching the Nations for Christ</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm max-w-md leading-relaxed">
              A global coalition of churches, ministries, and leaders united around the vision of reaching
              1 billion souls for Christ by 2033 through strategic gatherings, partnerships, and collaboration.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { label: "Events", href: "/events" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 hover:text-[#c69c3f] text-sm transition-colors">
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
                <a href="mailto:info@billionsoulharvest.org" className="text-gray-400 hover:text-[#c69c3f] text-sm transition-colors">
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
