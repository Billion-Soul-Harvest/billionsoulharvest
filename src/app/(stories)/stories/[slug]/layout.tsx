import { StaticHeader } from "@/app/(static-site)/static-render/components/header";
import { StaticFooter } from "@/app/(static-site)/static-render/components/footer";

interface Props {
  children: React.ReactNode;
}

export default function StoryLayout({ children }: Props) {
  return (
    <div className="min-h-screen flex flex-col bg-[#f9f9ff] text-[#0a1c34]">
      <StaticHeader />
      <main className="flex-1">{children}</main>
      <StaticFooter />
    </div>
  );
}
