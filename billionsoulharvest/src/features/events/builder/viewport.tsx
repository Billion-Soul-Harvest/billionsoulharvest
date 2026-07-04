"use client";

import { Frame, Element } from "@craftjs/core";
import { useRef, useState, useEffect, useCallback } from "react";
import { CraftContainer } from "./components/craft-container";
import { ElementToolbar } from "./element-toolbar";
import { defaultContentChildren } from "./default-content";
import { useEventData } from "./event-context";
import { usePageContext } from "./page-context";

interface Props {
  initialContent?: string | null;
  canvasWidth: number;
}

function PersistentHeader({ canvasWidth }: { canvasWidth: number }) {
  const event = useEventData();
  const { activePageId, switchPage, pages } = usePageContext();

  return (
    <header
      className="w-full flex items-center px-4 shrink-0"
      style={{
        backgroundColor: "#0a1e35",
        height: "56px",
        maxWidth: `${canvasWidth}px`,
      }}
    >
      <span className="font-bold text-sm text-white truncate mr-6">
        {event.title}
      </span>
      <nav className="flex items-center gap-1 flex-1">
        <button
          onClick={() => switchPage(null)}
          className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
          style={{
            color: "#ffffff",
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
              color: "#ffffff",
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

export function Viewport({ initialContent, canvasWidth }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

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
          {/* Persistent header — always visible across all pages */}
          <PersistentHeader canvasWidth={canvasWidth} />

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
        </div>
      </div>
    </div>
  );
}
