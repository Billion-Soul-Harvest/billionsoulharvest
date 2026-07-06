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

function PersistentFooter({ canvasWidth, config }: { canvasWidth: number; config: FooterConfig }) {
  return (
    <footer
      className="w-full shrink-0 border-t border-white/10"
      style={{ backgroundColor: "#0a1e38", maxWidth: `${canvasWidth}px` }}
    >
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

export function Viewport({ initialContent, canvasWidth, hideHeader, footerConfig }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [aiOpen, setAiOpen] = useState(false);
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
          {footerConfig && <PersistentFooter canvasWidth={canvasWidth} config={footerConfig} />}
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
