"use client";

import { Frame, Element, useEditor } from "@craftjs/core";
import { useRef, useState, useEffect, useCallback } from "react";
import { CraftContainer } from "./components/craft-container";
import { ElementToolbar } from "./element-toolbar";
import { defaultContentChildren } from "./default-content";
import { useEventData } from "./event-context";
import { usePageContext } from "./page-context";
import { AIAssistantDialog } from "./ai/ai-assistant-dialog";
import { useBuilderKeyboardShortcuts } from "./use-keyboard-shortcuts";

import type { FooterConfig } from "@/shared/types/database";

interface Props {
  initialContent?: string | null;
  canvasWidth: number;
  hideHeader?: boolean;
  footerConfig?: FooterConfig | null;
}

function PersistentHeader({ canvasWidth }: { canvasWidth: number }) {
  const event = useEventData();
  const { activePageId, switchPage, pages } = usePageContext();
  const { query } = useEditor();

  // Read styling from CraftHeader node in canvas (if exists)
  let bgColor = "#0a1e35";
  let textColor = "#ffffff";
  let headerHeight = 56;
  try {
    const nodes = query.getState().nodes;
    for (const node of Object.values(nodes)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const n = node as any;
      if (n?.data?.type?.resolvedName === "CraftHeader") {
        bgColor = n.data.props?.backgroundColor ?? bgColor;
        textColor = n.data.props?.textColor ?? textColor;
        headerHeight = n.data.props?.height ?? headerHeight;
        break;
      }
    }
  } catch {
    // Ignore — use defaults
  }

  return (
    <header
      className="w-full flex items-center px-4 shrink-0"
      style={{
        backgroundColor: bgColor,
        height: `${headerHeight}px`,
        maxWidth: `${canvasWidth}px`,
      }}
    >
      <span className="font-bold text-sm truncate mr-6" style={{ color: textColor }}>
        {event.title}
      </span>
      <nav className="flex items-center gap-1 flex-1">
        <button
          onClick={() => switchPage(null)}
          className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
          style={{
            color: textColor,
            opacity: activePageId === null ? 1 : 0.6,
            backgroundColor: activePageId === null ? "rgba(255,255,255,0.1)" : "transparent",
          }}
        >
          Home
        </button>
        {pages.map((page) => (
          <button
            key={page.id}
            onClick={() => switchPage(page.id)}
            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            style={{
              color: textColor,
              opacity: activePageId === page.id ? 1 : 0.6,
              backgroundColor: activePageId === page.id ? "rgba(255,255,255,0.1)" : "transparent",
            }}
          >
            {page.title}
          </button>
        ))}
      </nav>
    </header>
  );
}

function PersistentFooter({
  canvasWidth,
  config,
  onUpdate,
}: {
  canvasWidth: number;
  config: FooterConfig;
  onUpdate?: (updated: FooterConfig) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(config);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const { createClient } = await import("@/shared/utils/supabase/client");
    const supabase = createClient();
    const { error } = await supabase
      .from("site_settings")
      .upsert(
        { key: "footer_config", value: draft as unknown as Record<string, unknown> },
        { onConflict: "key" }
      );
    setSaving(false);
    if (!error) {
      setEditing(false);
      onUpdate?.(draft);
    }
  };

  if (editing) {
    return (
      <div
        className="w-full shrink-0 border-t border-blue-400/50 bg-[#0a1e38]"
        style={{ maxWidth: `${canvasWidth}px` }}
      >
        <div className="px-6 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-white text-xs font-semibold">Edit Footer</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setDraft(config); setEditing(false); }}
                className="px-2.5 py-1 text-[11px] text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-3 py-1 text-[11px] bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
          <div>
            <label className="text-gray-400 text-[10px] block mb-1">Description</label>
            <textarea
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              rows={2}
              className="w-full text-xs bg-white/5 border border-white/10 rounded px-2.5 py-1.5 text-gray-300 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-gray-400 text-[10px] block mb-1">Email</label>
              <input
                type="email"
                value={draft.email}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                className="w-full text-xs bg-white/5 border border-white/10 rounded px-2.5 py-1.5 text-gray-300 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="text-gray-400 text-[10px] block mb-1">Copyright (optional)</label>
              <input
                value={draft.copyrightText ?? ""}
                onChange={(e) => setDraft({ ...draft, copyrightText: e.target.value || undefined })}
                className="w-full text-xs bg-white/5 border border-white/10 rounded px-2.5 py-1.5 text-gray-300 focus:outline-none focus:border-blue-500"
                placeholder={`© ${new Date().getFullYear()} Billion Soul Harvest...`}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <footer
      className="w-full shrink-0 border-t border-white/10 relative group cursor-pointer"
      style={{ backgroundColor: "#0a1e38", maxWidth: `${canvasWidth}px` }}
      onClick={() => setEditing(true)}
    >
      {/* Edit overlay hint */}
      <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/10 transition-colors flex items-center justify-center">
        <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity bg-blue-600 px-3 py-1 rounded-full shadow">
          Click to edit footer
        </span>
      </div>
      <div className="px-6 py-8">
        <div className="flex gap-8">
          <div className="flex-1 min-w-0">
            <p className="text-gray-400 text-xs leading-relaxed line-clamp-3">
              {config.description}
            </p>
          </div>
          {config.email && (
            <div className="shrink-0">
              <span className="text-gray-400 text-xs">{config.email}</span>
            </div>
          )}
        </div>
        <div className="border-t border-white/10 mt-4 pt-3">
          <p className="text-gray-500 text-[10px]">
            {config.copyrightText || `© ${new Date().getFullYear()} Billion Soul Harvest. All rights reserved.`}
          </p>
        </div>
      </div>
    </footer>
  );
}

export function Viewport({ initialContent, canvasWidth, hideHeader, footerConfig: initialFooterConfig }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [aiOpen, setAiOpen] = useState(false);
  const [footerConfig, setFooterConfig] = useState(initialFooterConfig);
  const event = useEventData();
  useBuilderKeyboardShortcuts();

  const updateScale = useCallback(() => {
    if (!wrapperRef.current) return;
    const padding = 48; // p-6 = 24px each side
    const available = wrapperRef.current.clientWidth - padding;
    setScale(Math.min(1, available / canvasWidth));
  }, [canvasWidth]);

  useEffect(() => {
    updateScale();
    const observer = new ResizeObserver(updateScale);
    if (wrapperRef.current) observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, [updateScale]);

  return (
    <div ref={wrapperRef} className="flex-1 flex flex-col min-w-0 bg-gray-100">
      {/* Canvas */}
      <div className="flex-1 overflow-auto p-6 relative">
        <ElementToolbar />
        <div
          className="mx-auto bg-[#0f2744] min-h-[800px] shadow-2xl transition-all duration-300 rounded-lg overflow-x-hidden"
          style={{
            width: `${canvasWidth}px`,
            zoom: scale < 1 ? scale : undefined,
          }}
        >
          {/* Persistent header — always visible across all pages (event builder only) */}
          {!hideHeader && <PersistentHeader canvasWidth={canvasWidth} />}

          <Frame json={initialContent ?? undefined}>
            <Element
              is={CraftContainer}
              canvas
              backgroundColor="#0f2744"
              padding={40}
              width={canvasWidth}
              minHeight={800}
              borderRadius={0}
              borderColor="transparent"
              borderWidth={0}
              backgroundImage=""
              alignItems="center"
              gap={0}
            >
              {!initialContent && defaultContentChildren}
            </Element>
          </Frame>

          {/* Persistent footer — always visible across all pages */}
          {footerConfig && <PersistentFooter canvasWidth={canvasWidth} config={footerConfig} onUpdate={setFooterConfig} />}
        </div>
      </div>

      {/* AI Assistant Toggle */}
      <button
        onClick={() => setAiOpen(!aiOpen)}
        className="fixed bottom-6 right-6 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center z-40"
        title="AI Assistant"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </button>

      <AIAssistantDialog
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        eventData={event}
      />
    </div>
  );
}
