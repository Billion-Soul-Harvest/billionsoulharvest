import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Dr. James Hwang — Medicine, Missions & Global Leadership",
  description:
    "Profile of Dr. James Hwang, Global Chairman of Billion Soul Harvest — Oncologist, Missional Leader & Visionary for the Great Commission.",
};

export default function JamesHwangLayout({
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
