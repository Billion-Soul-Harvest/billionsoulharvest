"use client";

import { useNode } from "@craftjs/core";
import { craftRef } from "../craft-utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CraftVideoProps {
  url?: string;
  width?: number;
  height?: number;
}

function getEmbedUrl(url: string): string | null {
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return null;
}

export function CraftVideo({ url = "", width = 560, height = 315 }: CraftVideoProps) {
  const {
    connectors: { connect, drag },
  } = useNode();

  const embedUrl = url ? getEmbedUrl(url) : null;

  return (
    <div ref={craftRef(connect, drag)} style={{ width, height }}>
      {embedUrl ? (
        <iframe
          src={embedUrl}
          width="100%"
          height="100%"
          style={{ border: "none", borderRadius: 4 }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            border: "2px dashed #d1d5db",
            backgroundColor: "#f9fafb",
            borderRadius: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <svg
            width="32"
            height="32"
            fill="none"
            stroke="#9ca3af"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span style={{ fontSize: 13, color: "#9ca3af" }}>
            {url ? "Invalid video URL" : "Paste a YouTube or Vimeo URL"}
          </span>
        </div>
      )}
    </div>
  );
}

function CraftVideoSettings() {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as CraftVideoProps,
  }));

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="craft-video-url">Video URL</Label>
        <Input
          id="craft-video-url"
          value={props.url}
          placeholder="https://youtube.com/watch?v=..."
          onChange={(e) =>
            setProp((p: CraftVideoProps) => {
              p.url = e.target.value;
            })
          }
        />
        <p className="text-xs text-gray-500 mt-1">
          Supports YouTube and Vimeo URLs
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="craft-video-width">Width</Label>
          <Input
            id="craft-video-width"
            type="number"
            value={props.width}
            onChange={(e) =>
              setProp((p: CraftVideoProps) => {
                p.width = Number(e.target.value);
              })
            }
          />
        </div>
        <div>
          <Label htmlFor="craft-video-height">Height</Label>
          <Input
            id="craft-video-height"
            type="number"
            value={props.height}
            onChange={(e) =>
              setProp((p: CraftVideoProps) => {
                p.height = Number(e.target.value);
              })
            }
          />
        </div>
      </div>
    </div>
  );
}

CraftVideo.craft = {
  displayName: "Video",
  props: {
    url: "",
    width: 560,
    height: 315,
  } satisfies CraftVideoProps,
  related: {
    settings: CraftVideoSettings,
  },
};
