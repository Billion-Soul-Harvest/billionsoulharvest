import type { Metadata } from "next";
import { FundHeader } from "@/features/fund/components/fund-header";
import { FundFooter } from "@/features/fund/components/fund-footer";

export const metadata: Metadata = {
  title: {
    default: "BSH Fund - Support Ministry Campaigns",
    template: "%s | BSH Fund",
  },
  description:
    "Support ministry campaigns through Billion Soul Harvest. Donate to church planting, missions trips, disaster relief, and more.",
};

export default function FundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <FundHeader />
      <main className="flex-1">{children}</main>
      <FundFooter />
    </div>
  );
}
