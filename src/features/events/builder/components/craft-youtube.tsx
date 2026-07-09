"use client";

import { useNode } from "@craftjs/core";
import { craftRef } from "../craft-utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CraftYouTubeProps {
  url?: string;
  width?: number;
  height?: number;
  borderRadius?: number;
}

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/);
  return match ? match[1] : null;
}

export function CraftYouTube({
  url = "",
  width = 600,
  height = 340,
  borderRadius = 8,
}: CraftYouTubeProps) {
  const {
    connectors: { connect, drag },
  } = useNode();

  const videoId = url ? getYouTubeId(url) : null;

  return (
    <div
      ref={craftRef(connect, drag)}
      style={{ width, maxWidth: "100%", aspectRatio: `${width} / ${height}`, cursor: "grab" }}
    >
      {videoId ? (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          width="100%"
          height="100%"
          style={{ border: "none", borderRadius, display: "block" }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            border: "2px dashed #d1d5db",
            backgroundColor: "#fef2f2",
            borderRadius,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="#ef4444">
            <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
          <span style={{ fontSize: 13, color: "#9ca3af" }}>Paste a YouTube URL</span>
        </div>
      )}
    </div>
  );
}

function CraftYouTubeSettings() {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as CraftYouTubeProps,
  }));

  return (
    <div className="space-y-3">
      <div>
        <Label>YouTube URL</Label>
        <Input
          value={props.url}
          placeholder="https://youtube.com/watch?v=..."
          onChange={(e) =>
            setProp((p: CraftYouTubeProps) => { p.url = e.target.value; })
          }
        />
        <p className="text-xs text-gray-400 mt-1">Supports youtube.com and youtu.be links</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>Width</Label>
          <Input
            type="number"
            value={props.width}
            min={200}
            onChange={(e) =>
              setProp((p: CraftYouTubeProps) => { p.width = Number(e.target.value); })
            }
          />
        </div>
        <div>
          <Label>Height</Label>
          <Input
            type="number"
            value={props.height}
            min={150}
            onChange={(e) =>
              setProp((p: CraftYouTubeProps) => { p.height = Number(e.target.value); })
            }
          />
        </div>
      </div>
      <div>
        <Label>Border Radius</Label>
        <Input
          type="number"
          value={props.borderRadius}
          min={0}
          onChange={(e) =>
            setProp((p: CraftYouTubeProps) => { p.borderRadius = Number(e.target.value); })
          }
        />
      </div>
    </div>
  );
}

CraftYouTube.craft = {
  displayName: "YouTube",
  props: {
    url: "",
    width: 600,
    height: 340,
    borderRadius: 8,
  } satisfies CraftYouTubeProps,
  related: {
    settings: CraftYouTubeSettings,
  },
};
