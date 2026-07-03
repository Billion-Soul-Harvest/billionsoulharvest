"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/shared/utils/supabase/client";
import type { EventPageBlock, BlockType } from "@/shared/types/database";
import { RichTextForm } from "./block-forms/rich-text-form";
import { SpeakersForm } from "./block-forms/speakers-form";
import { ScheduleForm } from "./block-forms/schedule-form";
import { FaqForm } from "./block-forms/faq-form";
import { HeroForm } from "./block-forms/hero-form";
import { ImageForm } from "./block-forms/image-form";
import { VideoForm } from "./block-forms/video-form";
import { CtaForm } from "./block-forms/cta-form";

interface Props {
  eventId: string;
  pageId: string;
  initialBlocks: EventPageBlock[];
  onBlocksChange: (blocks: EventPageBlock[]) => void;
}

const blockTypes: { value: BlockType; label: string }[] = [
  { value: "hero", label: "Hero Banner" },
  { value: "rich_text", label: "Rich Text" },
  { value: "speakers", label: "Speakers Grid" },
  { value: "schedule", label: "Program Schedule" },
  { value: "faq", label: "FAQ" },
  { value: "image", label: "Image" },
  { value: "video", label: "Video" },
  { value: "cta", label: "Call to Action" },
];

const defaultContent: Record<BlockType, Record<string, unknown>> = {
  hero: { show_dates: true, show_cta: true },
  rich_text: { html: "" },
  speakers: { layout: "grid" },
  schedule: { show_day_tabs: true },
  faq: {},
  image: { url: "", alt: "", caption: "" },
  video: { url: "", aspect: "16:9" },
  cta: { text: "Register Now", subtitle: "" },
};

function BlockContentForm({
  blockType,
  content,
  onChange,
}: {
  blockType: BlockType;
  content: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
}) {
  switch (blockType) {
    case "rich_text": return <RichTextForm content={content} onChange={onChange} />;
    case "speakers": return <SpeakersForm content={content} onChange={onChange} />;
    case "schedule": return <ScheduleForm content={content} onChange={onChange} />;
    case "faq": return <FaqForm content={content} onChange={onChange} />;
    case "hero": return <HeroForm content={content} onChange={onChange} />;
    case "image": return <ImageForm content={content} onChange={onChange} />;
    case "video": return <VideoForm content={content} onChange={onChange} />;
    case "cta": return <CtaForm content={content} onChange={onChange} />;
  }
}

export function BlockEditor({ eventId, pageId, initialBlocks, onBlocksChange }: Props) {
  const [blocks, setBlocks] = useState<EventPageBlock[]>(initialBlocks);
  const [editing, setEditing] = useState<string | null>(null);
  const [formType, setFormType] = useState<BlockType>("rich_text");
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateBlocks(newBlocks: EventPageBlock[]) {
    setBlocks(newBlocks);
    onBlocksChange(newBlocks);
  }

  function startAdd() {
    const type: BlockType = "rich_text";
    setEditing("new");
    setFormType(type);
    setFormTitle("");
    setFormContent({ ...defaultContent[type] });
  }

  function startEdit(block: EventPageBlock) {
    setEditing(block.id);
    setFormType(block.block_type);
    setFormTitle(block.title ?? "");
    setFormContent({ ...block.content });
  }

  function cancel() {
    setEditing(null);
    setError(null);
  }

  async function save() {
    setSaving(true);
    setError(null);
    const supabase = createClient();

    const payload = {
      page_id: pageId,
      event_id: eventId,
      block_type: formType,
      title: formTitle || null,
      content: formContent,
      sort_order: editing === "new" ? blocks.length : undefined,
    };

    if (editing === "new") {
      const { data, error: err } = await supabase
        .from("event_page_blocks")
        .insert(payload)
        .select()
        .single();
      if (err) { setError(err.message); setSaving(false); return; }
      updateBlocks([...blocks, data as unknown as EventPageBlock]);
    } else {
      const { block_type, title, content } = payload;
      const { data, error: err } = await supabase
        .from("event_page_blocks")
        .update({ block_type, title, content })
        .eq("id", editing!)
        .select()
        .single();
      if (err) { setError(err.message); setSaving(false); return; }
      updateBlocks(blocks.map((b) => (b.id === editing ? (data as unknown as EventPageBlock) : b)));
    }

    setSaving(false);
    cancel();
  }

  async function remove(id: string) {
    const supabase = createClient();
    const { error: err } = await supabase.from("event_page_blocks").delete().eq("id", id);
    if (err) { setError(err.message); return; }
    updateBlocks(blocks.filter((b) => b.id !== id));
  }

  async function moveUp(id: string) {
    const sorted = sortedBlocks;
    const idx = sorted.findIndex((b) => b.id === id);
    if (idx <= 0) return;
    await swapOrder(sorted[idx], sorted[idx - 1]);
  }

  async function moveDown(id: string) {
    const sorted = sortedBlocks;
    const idx = sorted.findIndex((b) => b.id === id);
    if (idx < 0 || idx >= sorted.length - 1) return;
    await swapOrder(sorted[idx], sorted[idx + 1]);
  }

  async function swapOrder(a: EventPageBlock, b: EventPageBlock) {
    const supabase = createClient();
    const [{ error: e1 }, { error: e2 }] = await Promise.all([
      supabase.from("event_page_blocks").update({ sort_order: b.sort_order }).eq("id", a.id),
      supabase.from("event_page_blocks").update({ sort_order: a.sort_order }).eq("id", b.id),
    ]);
    if (e1 || e2) { setError((e1 || e2)!.message); return; }
    updateBlocks(
      blocks.map((bl) => {
        if (bl.id === a.id) return { ...bl, sort_order: b.sort_order };
        if (bl.id === b.id) return { ...bl, sort_order: a.sort_order };
        return bl;
      })
    );
  }

  const sortedBlocks = [...blocks].sort((a, b) => a.sort_order - b.sort_order);
  const blockLabel = (type: BlockType) => blockTypes.find((t) => t.value === type)?.label ?? type;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Blocks ({blocks.length})</h3>
        {!editing && (
          <Button size="sm" onClick={startAdd}>Add Block</Button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
      )}

      {editing && (
        <div className="bg-white rounded-xl border p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Block Type</Label>
              <Select
                value={formType}
                onValueChange={(v) => {
                  const newType = v as BlockType;
                  setFormType(newType);
                  setFormContent({ ...defaultContent[newType] });
                }}
                disabled={editing !== "new"}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {blockTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Block Title (optional)</Label>
              <input
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Optional heading above this block"
              />
            </div>
          </div>

          <div className="border-t pt-3">
            <BlockContentForm
              blockType={formType}
              content={formContent}
              onChange={setFormContent}
            />
          </div>

          <div className="flex gap-2">
            <Button size="sm" onClick={save} disabled={saving}>
              {saving ? "Saving..." : editing === "new" ? "Add" : "Update"}
            </Button>
            <Button size="sm" variant="outline" onClick={cancel}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        {sortedBlocks.map((block) => (
          <div key={block.id} className="flex items-center gap-3 bg-white rounded-lg border px-4 py-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium">
                  {blockLabel(block.block_type)}
                </span>
                {block.title && (
                  <p className="text-sm font-medium text-gray-900">{block.title}</p>
                )}
                {!block.published && (
                  <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Draft</span>
                )}
              </div>
            </div>
            <div className="flex gap-1 shrink-0">
              <Button size="sm" variant="ghost" onClick={() => moveUp(block.id)} disabled={!!editing}>
                &uarr;
              </Button>
              <Button size="sm" variant="ghost" onClick={() => moveDown(block.id)} disabled={!!editing}>
                &darr;
              </Button>
              <Button size="sm" variant="ghost" onClick={() => startEdit(block)} disabled={!!editing}>
                Edit
              </Button>
              <Button size="sm" variant="ghost" className="text-red-600" onClick={() => remove(block.id)} disabled={!!editing}>
                Remove
              </Button>
            </div>
          </div>
        ))}
        {blocks.length === 0 && !editing && (
          <p className="text-sm text-gray-400 text-center py-4">No blocks added yet.</p>
        )}
      </div>
    </div>
  );
}
