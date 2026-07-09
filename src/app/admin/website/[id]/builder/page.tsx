import { createClient } from "@/shared/utils/supabase/server";
import { notFound } from "next/navigation";
import { SitePageBuilder } from "@/features/website/builder/site-page-builder";
import type { SitePage } from "@/shared/types/database";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SiteBuilderPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  // Load all site pages and footer content in parallel
  const [{ data: allPages, error }, { data: footerRow }] = await Promise.all([
    supabase
      .from("site_pages")
      .select("*")
      .order("sort_order"),
    supabase
      .from("site_settings")
      .select("value")
      .eq("key", "footer_content")
      .single(),
  ]);

  if (error || !allPages?.length) notFound();

  const footerJson = footerRow
    ? (footerRow.value as unknown as Record<string, unknown>)
    : null;

  // Verify the requested page exists
  const currentPage = allPages.find((p) => p.id === id);
  if (!currentPage) notFound();

  return (
    <SitePageBuilder
      pages={allPages as unknown as SitePage[]}
      initialPageId={id}
      footerJson={footerJson}
    />
  );
}
