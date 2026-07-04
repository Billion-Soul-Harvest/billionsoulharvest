"use client";

import { useState, useCallback } from "react";
import { Editor, useEditor } from "@craftjs/core";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/shared/utils/supabase/client";
import type { Event } from "@/shared/types/database";

import { Viewport } from "./viewport";
import { RightPanel } from "./right-panel";
import { EventProvider } from "./event-context";

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

function EditorLayout({ event }: { event: Event }) {
  const { query } = useEditor();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeViewport, setActiveViewport] = useState(0);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaved(false);
    const json = query.serialize();
    const supabase = createClient();

    const { error } = await supabase
      .from("events")
      .update({ page_content: JSON.parse(json) })
      .eq("id", event.id);

    setSaving(false);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }, [event.id, query]);

  return (
    <div className="h-screen flex flex-col">
      {/* Top Bar */}
      <div className="h-14 bg-white border-b flex items-center px-4 gap-3 shrink-0">
        <Link
          href={`/admin/events/edit/${event.id}`}
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
          onClick={() => window.open(`/events/${event.slug}?preview=true`, "_blank")}
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
      <div className="flex-1 flex overflow-hidden">
        <Viewport
          initialContent={event.page_content ? JSON.stringify(event.page_content) : null}
          canvasWidth={viewports[activeViewport].width}
        />
        <RightPanel />
      </div>
    </div>
  );
}
