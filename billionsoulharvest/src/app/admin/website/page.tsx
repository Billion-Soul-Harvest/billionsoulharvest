import { createClient } from "@/shared/utils/supabase/server";
import { WebsitePageList } from "@/features/website/admin/website-page-list";
import type { SitePage } from "@/shared/types/database";

export const dynamic = "force-dynamic";

export default async function WebsitePagesAdmin() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("site_pages")
    .select("*")
    .order("sort_order");

  if (error) console.error("site_pages fetch error:", error);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Website Pages</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and edit your public website pages
          </p>
        </div>
      </div>
      <WebsitePageList initialPages={(data ?? []) as unknown as SitePage[]} />
    </div>
  );
}
