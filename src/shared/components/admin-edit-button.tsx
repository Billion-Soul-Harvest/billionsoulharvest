"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/shared/utils/supabase/client";
import { Pencil } from "lucide-react";

export function AdminEditButton({ pageId }: { pageId: string }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const check = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data: admin } = await supabase
        .from("admin_users")
        .select("id")
        .eq("id", user.id)
        .single();
      if (admin) setIsAdmin(true);
    };
    check();
  }, []);

  if (!isAdmin) return null;

  return (
    <Link
      href={`/admin/website/${pageId}/builder`}
      className="fixed bottom-6 right-6 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-gray-900/80 text-white shadow-lg transition-colors hover:bg-gray-900"
      title="Edit this page"
    >
      <Pencil className="h-4 w-4" />
    </Link>
  );
}
