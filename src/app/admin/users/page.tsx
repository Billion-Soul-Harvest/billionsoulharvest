import { createClient } from "@/shared/utils/supabase/server";
import { UsersManager } from "@/features/users/users-manager";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Users — BSH Admin",
};

export default async function UsersPage() {
  const supabase = await createClient();

  const { data: users } = await supabase.rpc("get_admin_users_with_email");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let currentUserRole = "editor";
  if (user) {
    const { data: adminUser } = await supabase
      .from("admin_users")
      .select("role")
      .eq("id", user.id)
      .single();
    if (adminUser) currentUserRole = adminUser.role;
  }

  return (
    <UsersManager
      users={users ?? []}
      currentUserId={user?.id ?? ""}
      currentUserRole={currentUserRole}
    />
  );
}
