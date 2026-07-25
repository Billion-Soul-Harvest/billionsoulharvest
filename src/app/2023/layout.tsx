import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "2023 — Billion Soul Harvest",
  description: "Billion Soul Harvest 2023 — Page under construction.",
};

export default function Layout2023({
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
