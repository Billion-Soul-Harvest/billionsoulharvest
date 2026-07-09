import { createClient } from "@/shared/utils/supabase/server";
import { CraftPageRenderer } from "@/features/events/builder/render";

export async function PublicFooter() {
  const supabase = await createClient();

  const { data: settings } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "footer_content")
    .single();

  if (!settings) return null;

  const footerNodes = settings.value as unknown as Record<string, unknown>;
  if (!footerNodes["footer-root"]) return null;

  // Build a synthetic ROOT that contains footer-root as its only child
  const content = {
    ROOT: {
      type: { resolvedName: "CraftContainer" },
      isCanvas: true,
      props: { backgroundColor: "transparent", padding: 0, width: 1200, minHeight: 0, borderRadius: 0, borderColor: "transparent", borderWidth: 0, backgroundImage: "", alignItems: "center", gap: 0 },
      nodes: ["footer-root"],
      linkedNodes: {},
    },
    ...footerNodes,
  };

  const dummyEvent = {
    id: "", title: "", slug: "", status: "published",
    start_date: null, end_date: null, location: null,
    city: null, country: null, registration_config: null,
  };

  return (
    <CraftPageRenderer
      content={content as any}
      event={dummyEvent as any}
    />
  );
}
