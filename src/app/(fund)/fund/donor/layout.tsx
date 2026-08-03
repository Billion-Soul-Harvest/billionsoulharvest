import { FundSidebar } from "@/features/fund/components/fund-sidebar";

const donorLinks = [
  { href: "/fund/donor", label: "Overview" },
  { href: "/fund/donor/donations", label: "My Donations" },
  { href: "/fund/donor/recurring", label: "Recurring" },
];

export default function DonorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col lg:flex-row gap-8">
        <FundSidebar links={donorLinks} title="Donor" />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
