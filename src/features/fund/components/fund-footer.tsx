import Link from "next/link";

export function FundFooter() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">Donate</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/fund/search" className="text-gray-500 hover:text-gray-900 transition-colors">Browse campaigns</Link></li>
              <li><Link href="/fund/category/church_planting" className="text-gray-500 hover:text-gray-900 transition-colors">Church planting</Link></li>
              <li><Link href="/fund/category/missions_trips" className="text-gray-500 hover:text-gray-900 transition-colors">Missions trips</Link></li>
              <li><Link href="/fund/category/disaster_relief" className="text-gray-500 hover:text-gray-900 transition-colors">Disaster relief</Link></li>
              <li><Link href="/fund/category/medical_missions" className="text-gray-500 hover:text-gray-900 transition-colors">Medical missions</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">Fundraise</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/fund/campaigns/new" className="text-gray-500 hover:text-gray-900 transition-colors">Start a campaign</Link></li>
              <li><Link href="/fund/category/bible_distribution" className="text-gray-500 hover:text-gray-900 transition-colors">Bible distribution</Link></li>
              <li><Link href="/fund/category/building_projects" className="text-gray-500 hover:text-gray-900 transition-colors">Building projects</Link></li>
              <li><Link href="/fund/category/youth_ministry" className="text-gray-500 hover:text-gray-900 transition-colors">Youth ministry</Link></li>
              <li><Link href="/fund/category/worship_ministry" className="text-gray-500 hover:text-gray-900 transition-colors">Worship ministry</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">About</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="https://billionsoulharvest.org" className="text-gray-500 hover:text-gray-900 transition-colors">About BSH</Link></li>
              <li><Link href="/fund/login" className="text-gray-500 hover:text-gray-900 transition-colors">Sign in</Link></li>
              <li><Link href="/fund/signup" className="text-gray-500 hover:text-gray-900 transition-colors">Create account</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Billion Soul Harvest. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <Link href="https://billionsoulharvest.org" className="hover:text-gray-600 transition-colors">
              billionsoulharvest.org
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
