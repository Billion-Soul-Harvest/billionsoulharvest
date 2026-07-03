import { PublicHeader } from "@/shared/components/public-header";
import { PublicFooter } from "@/shared/components/public-footer";

export default function PublicGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#0f2744]">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
