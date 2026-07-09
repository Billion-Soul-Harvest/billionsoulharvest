import { createClient } from "@/shared/utils/supabase/server";
import { WebsitePageList } from "@/features/website/admin/website-page-list";
import { RenderingModeToggle } from "@/features/website/admin/rendering-mode-toggle";
import type { SitePage } from "@/shared/types/database";

export const dynamic = "force-dynamic";

export default async function WebsitePagesAdmin() {
  const supabase = await createClient();

  const [{ data, error }, { data: modeSetting }] = await Promise.all([
    supabase.from("site_pages").select("*").order("sort_order"),
    supabase
      .from("site_settings")
      .select("value")
      .eq("key", "rendering_mode")
      .single(),
  ]);

  if (error) console.error("site_pages fetch error:", error);

  const renderingMode =
    (modeSetting?.value as any)?.mode ?? "builder";

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

      <RenderingModeToggle initialMode={renderingMode} />

      {renderingMode === "static" && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-blue-900">Static mode is active</p>
            <p className="text-sm text-blue-700 mt-0.5">
              Pages are rendered from custom-coded components. The page builder is not used for public pages in this mode.
            </p>
          </div>
        </div>
      )}

      {renderingMode !== "static" && (
        <WebsitePageList initialPages={(data ?? []) as unknown as SitePage[]} renderingMode={renderingMode} />
      )}
    </div>
  );
}
