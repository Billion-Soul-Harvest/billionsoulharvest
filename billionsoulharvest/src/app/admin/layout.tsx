import { createClient } from "@/shared/utils/supabase/server";
import { redirect } from "next/navigation";
import { AdminLayout } from "@/shared/components/admin-layout";

export const dynamic = "force-dynamic";

export default async function AdminGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <AdminLayout userEmail={user.email}>{children}</AdminLayout>;
}
