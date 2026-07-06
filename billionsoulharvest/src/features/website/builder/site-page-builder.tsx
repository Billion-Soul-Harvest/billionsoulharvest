"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Editor, useEditor } from "@craftjs/core";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/shared/utils/supabase/client";
import type { SitePage, FooterConfig } from "@/shared/types/database";

import { Viewport } from "@/features/events/builder/viewport";
import { RightPanel } from "@/features/events/builder/right-panel";
import { PageContextProvider, type PageInfo } from "@/features/events/builder/page-context";
import { EventProvider } from "@/features/events/builder/event-context";
import type { Event } from "@/shared/types/database";

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
import { CraftEmbed } from "@/features/events/builder/components/craft-embed";
import { CraftSocialLinks } from "@/features/events/builder/components/craft-social-links";
import { CraftMap } from "@/features/events/builder/components/craft-map";
import { CraftYouTube } from "@/features/events/builder/components/craft-youtube";
import { CraftCarousel } from "@/features/events/builder/components/craft-carousel";
import { CraftIcon } from "@/features/events/builder/components/craft-icon";
import { CraftEventTitle, CraftEventDates, CraftEventLocation, CraftRegisterButton } from "@/features/events/builder/components/event-data";
import { CraftRegistrationForm } from "@/features/events/builder/components/craft-registration-form";
import { CraftFooter } from "@/features/events/builder/components/craft-footer";

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
  CraftEmbed,
  CraftSocialLinks,
  CraftMap,
  CraftYouTube,
  CraftCarousel,
  CraftIcon,
  CraftEventTitle,
  CraftEventDates,
  CraftEventLocation,
  CraftRegisterButton,
  CraftRegistrationForm,
  CraftFooter,
};

interface Props {
  pages: SitePage[];
  initialPageId: string;
  footerConfig?: FooterConfig | null;
}

// Dummy event object so EventProvider/useEventData doesn't crash
const dummyEvent: Event = {
  id: "",
  title: "",
  slug: "",
  description: null,
  long_description: null,
  location: null,
  city: null,
  country: null,
  start_date: null,
  end_date: null,
  status: "draft",
  event_type: "conference",
  region_id: null,
  banner_url: null,
  page_content: null,
  max_registrations: null,
  registration_fee_cents: 0,
  registration_config: null,
  created_at: "",
  updated_at: "",
};

export function SitePageBuilder({ pages: initialPages, initialPageId, footerConfig }: Props) {
  return (
    <EventProvider value={dummyEvent}>
      <Editor resolver={resolver}>
        <SiteEditorLayout initialPages={initialPages} initialPageId={initialPageId} footerConfig={footerConfig} />
      </Editor>
    </EventProvider>
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

const EMPTY_CANVAS = JSON.stringify({
  ROOT: {
    type: { resolvedName: "CraftContainer" },
    isCanvas: true,
    props: {
      backgroundColor: "#0f2744",
      backgroundImage: "",
      padding: 40,
      borderRadius: 0,
      borderColor: "transparent",
      borderWidth: 0,
      width: 1200,
      minHeight: 800,
      alignItems: "center",
      gap: 0,
    },
    nodes: [],
    linkedNodes: {},
  },
});

function SiteEditorLayout({ initialPages, initialPageId, footerConfig }: { initialPages: SitePage[]; initialPageId: string; footerConfig?: FooterConfig | null }) {
  const { query, actions } = useEditor();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeViewport, setActiveViewport] = useState(0);

  // Page management
  const [pages, setPages] = useState(initialPages);
  const [activePageId, setActivePageId] = useState(initialPageId);
  const pageContentsRef = useRef<Record<string, string>>({});
  const activePageIdRef = useRef(initialPageId);

  // Keep ref in sync
  useEffect(() => {
    activePageIdRef.current = activePageId;
  }, [activePageId]);

  const activePage = pages.find((p) => p.id === activePageId) ?? pages[0];

  // Get initial content for the first page (use empty canvas if no saved content,
  // to avoid falling back to the event-specific default template)
  const initialContent = activePage?.page_content
    ? JSON.stringify(activePage.page_content)
    : EMPTY_CANVAS;

  const switchPage = useCallback((newPageId: string | null) => {
    // For site pages, we always use page IDs (never null)
    if (!newPageId || newPageId === activePageIdRef.current) return;

    // Serialize current canvas and store it
    const currentJson = query.serialize();
    pageContentsRef.current[activePageIdRef.current] = currentJson;

    // Load new page content
    const stored = pageContentsRef.current[newPageId];
    if (stored) {
      actions.deserialize(stored);
    } else {
      // First time visiting this page — load from DB data
      const page = pages.find((p) => p.id === newPageId);
      if (page?.page_content) {
        actions.deserialize(JSON.stringify(page.page_content));
      } else {
        actions.deserialize(EMPTY_CANVAS);
      }
    }

    setActivePageId(newPageId);
  }, [query, actions, pages]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaved(false);

    // Serialize current canvas
    const currentJson = query.serialize();
    pageContentsRef.current[activePageId] = currentJson;

    const supabase = createClient();
    const promises: PromiseLike<unknown>[] = [];

    // Save all pages that have been edited (stored in ref)
    for (const page of pages) {
      const content = pageContentsRef.current[page.id];
      if (content) {
        promises.push(
          supabase
            .from("site_pages")
            .update({ page_content: JSON.parse(content) })
            .eq("id", page.id)
            .then()
        );
      }
    }

    await Promise.all(promises);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [query, activePageId, pages]);

  const refreshPages = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("site_pages")
      .select("*")
      .order("sort_order");
    if (data) setPages(data as unknown as SitePage[]);
  }, []);

  const previewSlug = activePage?.is_home ? "/" : `/${activePage?.slug}`;

  // Map SitePage[] to PageInfo[] for the PageContextProvider (used by RightPanel Pages tab)
  const pageInfos = pages.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    sort_order: p.sort_order,
    published: p.published,
    page_content: p.page_content,
    parent_id: p.parent_id,
    nav_anchor: p.nav_anchor,
  }));

  return (
    <div className="h-screen flex flex-col">
      {/* Top Bar */}
      <div className="h-14 bg-white border-b flex items-center px-4 gap-3 shrink-0">
        <Link
          href="/admin/website"
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>

        <div className="w-px h-6 bg-gray-200" />

        {/* Page Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {pages.map((page) => (
            <button
              key={page.id}
              onClick={() => switchPage(page.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                activePageId === page.id
                  ? "bg-gray-900 text-white"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              {page.title}
              {page.is_home && (
                <span className="ml-1 text-[10px] opacity-60">(Home)</span>
              )}
            </button>
          ))}
        </div>

        {/* Viewport Switcher - centered */}
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
            window.open(`${previewSlug}?preview=true`, "_blank");
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
      <PageContextProvider value={{
        activePageId,
        switchPage,
        pages: pageInfos,
        setPages: setPages as unknown as React.Dispatch<React.SetStateAction<PageInfo[]>>,
        refreshPages,
      }}>
        <div className="flex-1 flex overflow-hidden">
          <Viewport
            initialContent={initialContent}
            canvasWidth={viewports[activeViewport].width}
            hideHeader
            footerConfig={footerConfig}
          />
          <RightPanel />
        </div>
      </PageContextProvider>
    </div>
  );
}
