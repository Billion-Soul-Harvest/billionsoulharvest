"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Editor, useEditor } from "@craftjs/core";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/shared/utils/supabase/client";
import type { SitePage } from "@/shared/types/database";
import { buildDefaultFooterJson } from "@/features/events/builder/default-footer";

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
  footerJson?: Record<string, unknown> | null;
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

export function SitePageBuilder({ pages: initialPages, initialPageId, footerJson }: Props) {
  return (
    <EventProvider value={dummyEvent}>
      <Editor resolver={resolver}>
        <SiteEditorLayout initialPages={initialPages} initialPageId={initialPageId} footerJson={footerJson} />
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

// --- Footer injection/extraction helpers ---

function findFooterNodeId(canvasObj: Record<string, unknown>): string | null {
  for (const [id, node] of Object.entries(canvasObj)) {
    const n = node as Record<string, unknown>;
    const type = n.type as Record<string, string> | undefined;
    if (type?.resolvedName === "CraftFooter") return id;
  }
  return null;
}

function collectSubtree(canvas: Record<string, unknown>, nodeId: string, result: Record<string, unknown>) {
  const node = canvas[nodeId] as Record<string, unknown> | undefined;
  if (!node) return;
  result[nodeId] = node;
  const children = (node.nodes as string[]) || [];
  for (const childId of children) collectSubtree(canvas, childId, result);
  const linked = (node.linkedNodes as Record<string, string>) || {};
  for (const linkedId of Object.values(linked)) collectSubtree(canvas, linkedId, result);
}

function removeFooterSubtree(canvas: Record<string, unknown>, footerId: string) {
  const root = canvas.ROOT as Record<string, unknown>;
  const rootNodes = (root.nodes as string[]) || [];
  root.nodes = rootNodes.filter((id) => id !== footerId);
  const toDelete: string[] = [];
  const collect = (id: string) => {
    toDelete.push(id);
    const node = canvas[id] as Record<string, unknown> | undefined;
    if (!node) return;
    for (const childId of (node.nodes as string[]) || []) collect(childId);
    const linked = (node.linkedNodes as Record<string, string>) || {};
    for (const linkedId of Object.values(linked)) collect(linkedId);
  };
  collect(footerId);
  for (const id of toDelete) delete canvas[id];
}

function findFooterRootInNodes(footerNodes: Record<string, unknown>): string | null {
  for (const [id, node] of Object.entries(footerNodes)) {
    const n = node as Record<string, unknown>;
    const type = n.type as Record<string, string> | undefined;
    if (type?.resolvedName === "CraftFooter") return id;
  }
  return null;
}

function injectFooter(canvasJson: string, footerNodes: Record<string, unknown>): string {
  const canvas = JSON.parse(canvasJson);
  const existingFooterId = findFooterNodeId(canvas);
  if (existingFooterId) removeFooterSubtree(canvas, existingFooterId);
  const footerRootId = findFooterRootInNodes(footerNodes);
  if (!footerRootId) return canvasJson; // No footer to inject
  for (const [id, node] of Object.entries(footerNodes)) canvas[id] = node;
  const root = canvas.ROOT as Record<string, unknown>;
  const rootNodes = (root.nodes as string[]) || [];
  rootNodes.push(footerRootId);
  root.nodes = rootNodes;
  return JSON.stringify(canvas);
}

function extractFooter(canvasJson: string): { pageJson: string; footerJson: Record<string, unknown> | null } {
  const canvas = JSON.parse(canvasJson);
  const footerId = findFooterNodeId(canvas);
  if (!footerId) return { pageJson: canvasJson, footerJson: null };
  const footerNodes: Record<string, unknown> = {};
  collectSubtree(canvas, footerId, footerNodes);
  removeFooterSubtree(canvas, footerId);
  return { pageJson: JSON.stringify(canvas), footerJson: footerNodes };
}

// --- Editor Layout ---

function SiteEditorLayout({ initialPages, initialPageId, footerJson }: { initialPages: SitePage[]; initialPageId: string; footerJson?: Record<string, unknown> | null }) {
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

  const footerJsonRef = useRef(footerJson ?? buildDefaultFooterJson());

  const activePage = pages.find((p) => p.id === activePageId) ?? pages[0];

  // Get initial content for the first page, with footer injected
  const rawContent = activePage?.page_content
    ? JSON.stringify(activePage.page_content)
    : EMPTY_CANVAS;
  const initialContent = injectFooter(rawContent, footerJsonRef.current as Record<string, unknown>);

  const switchPage = useCallback((newPageId: string | null) => {
    if (!newPageId || newPageId === activePageIdRef.current) return;

    // Extract footer from current canvas before storing page content
    const currentJson = query.serialize();
    const { pageJson, footerJson: currentFooter } = extractFooter(currentJson);
    pageContentsRef.current[activePageIdRef.current] = pageJson;

    // Update footer ref with latest footer state
    if (currentFooter) footerJsonRef.current = currentFooter;

    // Load new page content
    const stored = pageContentsRef.current[newPageId];
    let newPageJson: string;
    if (stored) {
      newPageJson = stored;
    } else {
      const page = pages.find((p) => p.id === newPageId);
      newPageJson = page?.page_content ? JSON.stringify(page.page_content) : EMPTY_CANVAS;
    }

    // Inject footer and deserialize
    const withFooter = injectFooter(newPageJson, footerJsonRef.current as Record<string, unknown>);
    actions.deserialize(withFooter);

    setActivePageId(newPageId);
  }, [query, actions, pages]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaved(false);

    // Serialize current canvas and extract footer
    const currentJson = query.serialize();
    const { pageJson, footerJson: extractedFooter } = extractFooter(currentJson);
    pageContentsRef.current[activePageId] = pageJson;
    if (extractedFooter) footerJsonRef.current = extractedFooter;

    const supabase = createClient();
    const promises: PromiseLike<unknown>[] = [];

    // Save all pages that have been edited — WITHOUT footer
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

    // Save footer to site_settings
    if (extractedFooter) {
      promises.push(
        supabase
          .from("site_settings")
          .upsert(
            { key: "footer_content", value: extractedFooter },
            { onConflict: "key" }
          )
          .then()
      );
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
          />
          <RightPanel />
        </div>
      </PageContextProvider>
    </div>
  );
}
