import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Rev. Dr. Young Cho — Global Leadership, Education & Ministry",
  description:
    "Portfolio of Rev. Dr. Young Cho, Global Director of Billion Soul Harvest — Leadership, Education & Ministry Advocacy.",
};

export default function YoungChoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#f9f9ff] text-[#0a1c34]">
      <main className="flex-1">{children}</main>
    </div>
  );
}
