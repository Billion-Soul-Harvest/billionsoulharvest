"use client";

import { Frame, Element } from "@craftjs/core";
import { useRef, useState, useEffect, useCallback } from "react";
import { CraftContainer } from "./components/craft-container";
import { ElementToolbar } from "./element-toolbar";
import { defaultContentChildren } from "./default-content";

interface Props {
  initialContent?: string | null;
  canvasWidth: number;
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
