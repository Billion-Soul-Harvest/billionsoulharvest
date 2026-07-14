"use client";

import { useState, useCallback, useEffect } from "react";
import { Editor, useEditor } from "@craftjs/core";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/shared/utils/supabase/client";
import type { Story } from "@/shared/types/database";

import { Viewport } from "@/features/events/builder/viewport";
import { StoryRightPanel } from "./story-right-panel";
import { useUnsavedChanges } from "@/features/events/builder/use-unsaved-changes";
import { PageContextProvider } from "@/features/events/builder/page-context";

import { CraftText } from "@/features/events/builder/components/craft-text";
import { CraftImage } from "@/features/events/builder/components/craft-image";
import { CraftButton } from "@/features/events/builder/components/craft-button";
import { CraftVideo } from "@/features/events/builder/components/craft-video";
import { CraftContainer } from "@/features/events/builder/components/craft-container";
import { CraftRow } from "@/features/events/builder/components/craft-row";
import { CraftColumn } from "@/features/events/builder/components/craft-column";
import { CraftDivider } from "@/features/events/builder/components/craft-divider";
import { CraftSpacer } from "@/features/events/builder/components/craft-spacer";
import { CraftHeader } from "@/features/events/builder/components/craft-header";
import { CraftFooter } from "@/features/events/builder/components/craft-footer";
import { CraftEmbed } from "@/features/events/builder/components/craft-embed";
import { CraftSocialLinks } from "@/features/events/builder/components/craft-social-links";
import { CraftMap } from "@/features/events/builder/components/craft-map";
import { CraftYouTube } from "@/features/events/builder/components/craft-youtube";
import { CraftCarousel } from "@/features/events/builder/components/craft-carousel";
import { CraftIcon } from "@/features/events/builder/components/craft-icon";
import { CraftDialog } from "@/features/events/builder/components/craft-dialog";
import { defaultStoryContentChildren } from "./default-story-content";

interface Props {
  story: Story;
}

const resolver = {
  CraftText,
  CraftImage,
  CraftButton,
  CraftVideo,
  CraftContainer,
  CraftRow,
  CraftColumn,
  CraftDivider,
  CraftSpacer,
  CraftHeader,
  CraftFooter,
  CraftEmbed,
  CraftSocialLinks,
  CraftMap,
  CraftYouTube,
  CraftCarousel,
  CraftIcon,
  CraftDialog,
};


export function StoryPageBuilder({ story }: Props) {
  return (
    <Editor resolver={resolver}>
      <StoryEditorLayout story={story} />
    </Editor>
  );
}

const viewports = [
  { label: "Desktop", width: 1200, icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  )},
  { label: "Tablet", width: 768, icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  )},
  { label: "Phone", width: 375, icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  )},
];

const statusOptions = [
  { value: "draft", label: "Draft", color: "bg-gray-100 text-gray-600" },
  { value: "published", label: "Published", color: "bg-blue-100 text-blue-700" },
];

function StoryEditorLayout({ story }: { story: Story }) {
  const { query } = useEditor();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeViewport, setActiveViewport] = useState(0);
  const [status, setStatus] = useState<string>(story.status ?? "draft");
  const [statusOpen, setStatusOpen] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const { markSaved, setInitialSnapshot, confirmNavigation } = useUnsavedChanges(
    useCallback(() => query.serialize(), [query])
  );

  useEffect(() => {
    setInitialSnapshot();
  }, [setInitialSnapshot]);

  const handleStatusChange = useCallback(async (newStatus: string) => {
    setStatusSaving(true);
    const supabase = createClient();
    const updatePayload: Record<string, unknown> = { status: newStatus };
    if (newStatus === "published" && !story.published_at) {
      updatePayload.published_at = new Date().toISOString();
    }
    const { error } = await supabase
      .from("stories")
      .update(updatePayload)
      .eq("id", story.id);
    setStatusSaving(false);
    if (!error) {
      setStatus(newStatus);
    }
    setStatusOpen(false);
  }, [story.id, story.published_at]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaved(false);

    const currentJson = query.serialize();
    const supabase = createClient();

    await supabase
      .from("stories")
      .update({ page_content: JSON.parse(currentJson) })
      .eq("id", story.id);

    setSaving(false);
    setSaved(true);
    markSaved();
    setTimeout(() => setSaved(false), 2000);
  }, [story.id, query, markSaved]);

  // Provide a dummy PageContext so Viewport doesn't crash (it uses usePageContext for the persistent header)
  const dummyPageCtx = {
    activePageId: null,
    switchPage: () => {},
    pages: [],
    setPages: () => {},
    refreshPages: async () => {},
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Top Bar */}
      <div className="h-14 bg-white border-b flex items-center px-4 gap-3 shrink-0">
        <Link
          href={`/admin/stories/edit/${story.id}`}
          onClick={(e) => {
            if (!confirmNavigation()) e.preventDefault();
          }}
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>

        <div className="w-px h-6 bg-gray-200" />

        <h1 className="text-sm font-semibold text-gray-900 truncate">
          {story.title}
        </h1>

        {/* Status Badge + Dropdown */}
        <div className="relative">
          <button
            onClick={() => setStatusOpen(!statusOpen)}
            disabled={statusSaving}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
              statusOptions.find((s) => s.value === status)?.color ?? "bg-gray-100 text-gray-600"
            }`}
          >
            {statusSaving ? "..." : statusOptions.find((s) => s.value === status)?.label ?? status}
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {statusOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setStatusOpen(false)} />
              <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg z-50 py-1 min-w-[160px]">
                {statusOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleStatusChange(opt.value)}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 flex items-center gap-2 ${
                      status === opt.value ? "font-semibold" : ""
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${opt.color.split(" ")[0]}`} />
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Viewport Switcher */}
        <div className="flex-1 flex items-center justify-center gap-1">
          {viewports.map((vp, idx) => (
            <button
              key={vp.label}
              onClick={() => setActiveViewport(idx)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeViewport === idx
                  ? "bg-gray-900 text-white"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              {vp.icon}
              {vp.label}
            </button>
          ))}
        </div>

        {saved && (
          <span className="text-xs text-green-600 font-medium">Saved</span>
        )}

        <Button
          size="sm"
          variant="outline"
          disabled={saving}
          onClick={async () => {
            await handleSave();
            window.open(`/stories/${story.slug}?preview=true`, "_blank");
          }}
        >
          Preview
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>

      {/* Body */}
      <PageContextProvider value={dummyPageCtx}>
        <div className="flex-1 flex overflow-hidden">
          <Viewport
            initialContent={story.page_content ? JSON.stringify(story.page_content) : null}
            canvasWidth={viewports[activeViewport].width}
            hideHeader
            defaultChildren={defaultStoryContentChildren}
            builderData={{
              title: story.title,
              description: story.description,
              slug: story.slug,
              type: "story",
            }}
          />
          <StoryRightPanel />
        </div>
      </PageContextProvider>
    </div>
  );
}
