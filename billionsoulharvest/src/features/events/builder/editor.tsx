"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Editor, useEditor } from "@craftjs/core";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/shared/utils/supabase/client";
import type { Event } from "@/shared/types/database";

import { Viewport } from "./viewport";
import { RightPanel } from "./right-panel";
import { EventProvider } from "./event-context";
import { PageContextProvider, type PageInfo } from "./page-context";
import { useUnsavedChanges } from "./use-unsaved-changes";

import { CraftText } from "./components/craft-text";
import { CraftImage } from "./components/craft-image";
import { CraftButton } from "./components/craft-button";
import { CraftVideo } from "./components/craft-video";
import { CraftContainer } from "./components/craft-container";
import { CraftRow } from "./components/craft-row";
import { CraftColumn } from "./components/craft-column";
import { CraftDivider } from "./components/craft-divider";
import { CraftEventTitle, CraftEventDates, CraftEventLocation, CraftRegisterButton } from "./components/event-data";
import { CraftSpacer } from "./components/craft-spacer";
import { CraftHeader } from "./components/craft-header";
import { CraftEmbed } from "./components/craft-embed";
import { CraftSocialLinks } from "./components/craft-social-links";
import { CraftMap } from "./components/craft-map";
import { CraftYouTube } from "./components/craft-youtube";
import { CraftCarousel } from "./components/craft-carousel";
import { CraftIcon } from "./components/craft-icon";
import { CraftRegistrationForm } from "./components/craft-registration-form";

interface Props {
  event: Event;
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
  CraftEventTitle,
  CraftEventDates,
  CraftEventLocation,
  CraftRegisterButton,
  CraftEmbed,
  CraftSocialLinks,
  CraftMap,
  CraftYouTube,
  CraftCarousel,
  CraftIcon,
  CraftRegistrationForm,
};

export function PageBuilder({ event }: Props) {
  return (
    <EventProvider value={event}>
      <Editor resolver={resolver}>
        <EditorLayout event={event} />
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

const statusOptions = [
  { value: "draft", label: "Draft", color: "bg-gray-100 text-gray-600" },
  { value: "published", label: "Published", color: "bg-blue-100 text-blue-700" },
  { value: "registration_open", label: "Registration Open", color: "bg-green-100 text-green-700" },
  { value: "completed", label: "Completed", color: "bg-amber-100 text-amber-700" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-700" },
];

function EditorLayout({ event }: { event: Event }) {
  const { query, actions } = useEditor();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeViewport, setActiveViewport] = useState(0);
  const [status, setStatus] = useState<string>(event.status ?? "draft");
  const [statusOpen, setStatusOpen] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const { markSaved, setInitialSnapshot, confirmNavigation } = useUnsavedChanges(
    useCallback(() => query.serialize(), [query])
  );

  // Page management state
  const [activePageId, setActivePageId] = useState<string | null>(null); // null = home
  const [pages, setPages] = useState<PageInfo[]>([]);
  // In-memory store of serialized content per page (keyed by pageId, "home" for home page)
  const pageContentsRef = useRef<Record<string, string>>({});
  const activePageIdRef = useRef<string | null>(null);

  // Keep ref in sync
  useEffect(() => {
    activePageIdRef.current = activePageId;
  }, [activePageId]);

  const fetchPages = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("event_pages")
      .select("id, title, slug, sort_order, published, page_content")
      .eq("event_id", event.id)
      .order("sort_order");
    if (data) setPages(data);
  }, [event.id]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  // Set initial snapshot once canvas is loaded
  useEffect(() => {
    setInitialSnapshot();
  }, [setInitialSnapshot]);

  const switchPage = useCallback((newPageId: string | null) => {
    const currentId = activePageIdRef.current;
    if (currentId === newPageId) return;

    // Serialize current canvas and store it
    const currentJson = query.serialize();
    const currentKey = currentId ?? "home";
    pageContentsRef.current[currentKey] = currentJson;

    // Load new page content
    const newKey = newPageId ?? "home";
    const stored = pageContentsRef.current[newKey];

    if (stored) {
      // We have cached content for this page
      actions.deserialize(stored);
    } else if (newPageId === null) {
      // Home page — use event.page_content
      if (event.page_content) {
        actions.deserialize(JSON.stringify(event.page_content));
      }
      // If no page_content, the default content was already loaded on mount
    } else {
      // Sub-page — load from its page_content
      const page = pages.find((p) => p.id === newPageId);
      if (page?.page_content) {
        actions.deserialize(JSON.stringify(page.page_content));
      } else {
        // Empty page — deserialize a minimal empty container
        actions.deserialize(JSON.stringify({
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
        }));
      }
    }

    setActivePageId(newPageId);
  }, [query, actions, event.page_content, pages]);

  const handleStatusChange = useCallback(async (newStatus: string) => {
    setStatusSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("events")
      .update({ status: newStatus })
      .eq("id", event.id);
    setStatusSaving(false);
    if (!error) {
      setStatus(newStatus);
    }
    setStatusOpen(false);
  }, [event.id]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaved(false);

    // Serialize current canvas to the ref
    const currentJson = query.serialize();
    const currentKey = activePageId ?? "home";
    pageContentsRef.current[currentKey] = currentJson;

    const supabase = createClient();
    const promises: PromiseLike<unknown>[] = [];

    // Save home page content to events.page_content
    const homeContent = pageContentsRef.current["home"] ?? currentJson;
    if (activePageId === null || pageContentsRef.current["home"]) {
      promises.push(
        supabase
          .from("events")
          .update({ page_content: JSON.parse(activePageId === null ? currentJson : homeContent) })
          .eq("id", event.id)
          .then()
      );
    }

    // Save any sub-pages that have been edited (stored in ref)
    for (const page of pages) {
      const content = pageContentsRef.current[page.id];
      if (content) {
        promises.push(
          supabase
            .from("event_pages")
            .update({ page_content: JSON.parse(content) })
            .eq("id", page.id)
            .then()
        );
      }
    }

    await Promise.all(promises);
    setSaving(false);
    setSaved(true);
    markSaved();
    setTimeout(() => setSaved(false), 2000);
  }, [event.id, query, activePageId, pages, markSaved]);

  return (
    <div className="h-screen flex flex-col">
      {/* Top Bar */}
      <div className="h-14 bg-white border-b flex items-center px-4 gap-3 shrink-0">
        <Link
          href={`/admin/events/edit/${event.id}`}
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
          {event.title}
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
            window.open(`/events/${event.slug}?preview=true`, "_blank");
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
      <PageContextProvider value={{ activePageId, switchPage, pages, setPages, refreshPages: fetchPages }}>
        <div className="flex-1 flex overflow-hidden">
          <Viewport
            initialContent={event.page_content ? JSON.stringify(event.page_content) : null}
            canvasWidth={viewports[activeViewport].width}
          />
          <RightPanel />
        </div>
      </PageContextProvider>
    </div>
  );
}
