import type { SupabaseClient } from "@supabase/supabase-js";
import { eventTemplates } from "./event-templates";

export async function applyTemplate(
  supabase: SupabaseClient,
  eventId: string,
  templateId: string
) {
  const template = eventTemplates.find((t) => t.id === templateId);
  if (!template || template.pages.length === 0) return;

  for (let pageIdx = 0; pageIdx < template.pages.length; pageIdx++) {
    const page = template.pages[pageIdx];

    const { data: insertedPage, error: pageError } = await supabase
      .from("event_pages")
      .insert({
        event_id: eventId,
        title: page.title,
        slug: page.slug,
        sort_order: pageIdx,
      })
      .select("id")
      .single();

    if (pageError || !insertedPage) continue;

    const blockRows = page.blocks.map((block, blockIdx) => ({
      page_id: insertedPage.id,
      event_id: eventId,
      block_type: block.block_type,
      title: block.title,
      content: block.content,
      sort_order: blockIdx,
    }));

    if (blockRows.length > 0) {
      await supabase.from("event_page_blocks").insert(blockRows);
    }
  }
}
