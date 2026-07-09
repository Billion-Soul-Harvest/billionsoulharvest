import { StaticHeader } from "./components/header";
import { StaticFooter } from "./components/footer";

export default function StaticSiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#f9f9ff] text-[#0a1c34]">
      <StaticHeader />
      <main className="flex-1">{children}</main>
      <StaticFooter />
    </div>
  );
}
