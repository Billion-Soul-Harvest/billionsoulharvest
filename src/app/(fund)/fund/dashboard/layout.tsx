import { FundSidebar } from "@/features/fund/components/fund-sidebar";

const dashboardLinks = [
  { href: "/fund/dashboard", label: "Overview" },
  { href: "/fund/dashboard/campaigns", label: "My Campaigns" },
  { href: "/fund/dashboard/donations", label: "Donations Received" },
  { href: "/fund/dashboard/profile", label: "Profile" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col lg:flex-row gap-8">
        <FundSidebar links={dashboardLinks} title="Dashboard" />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
