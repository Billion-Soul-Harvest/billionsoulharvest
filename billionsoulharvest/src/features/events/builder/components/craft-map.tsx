"use client";

import { useNode } from "@craftjs/core";
import { craftRef } from "../craft-utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CraftMapProps {
  address?: string;
  width?: number;
  height?: number;
  zoom?: number;
  borderRadius?: number;
}

function buildMapUrl(address: string, zoom: number) {
  const q = encodeURIComponent(address);
  return `https://www.google.com/maps?q=${q}&z=${zoom}&output=embed`;
}

export function CraftMap({
  address = "",
  width = 600,
  height = 400,
  zoom = 14,
  borderRadius = 8,
}: CraftMapProps) {
  const {
    connectors: { connect, drag },
  } = useNode();

  return (
    <div
      ref={craftRef(connect, drag)}
      style={{ width, maxWidth: "100%", aspectRatio: `${width} / ${height}`, cursor: "grab" }}
    >
      {address ? (
        <iframe
          src={buildMapUrl(address, zoom)}
          width="100%"
          height="100%"
          style={{ border: "none", borderRadius, display: "block" }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            border: "2px dashed #d1d5db",
            backgroundColor: "#f0f7f0",
            borderRadius,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <svg width="32" height="32" fill="none" stroke="#9ca3af" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span style={{ fontSize: 13, color: "#9ca3af" }}>Enter an address to show a map</span>
        </div>
      )}
    </div>
  );
}

function CraftMapSettings() {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as CraftMapProps,
  }));

  return (
    <div className="space-y-3">
      <div>
        <Label>Address / Location</Label>
        <Input
          value={props.address}
          placeholder="e.g. Westminster Chapel, London, UK"
          onChange={(e) =>
            setProp((p: CraftMapProps) => { p.address = e.target.value; })
          }
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>Width</Label>
          <Input
            type="number"
            value={props.width}
            min={200}
            onChange={(e) =>
              setProp((p: CraftMapProps) => { p.width = Number(e.target.value); })
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
              setProp((p: CraftMapProps) => { p.height = Number(e.target.value); })
            }
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>Zoom ({props.zoom})</Label>
          <input
            type="range"
            min={1}
            max={20}
            value={props.zoom}
            onChange={(e) =>
              setProp((p: CraftMapProps) => { p.zoom = Number(e.target.value); })
            }
            className="w-full"
          />
        </div>
        <div>
          <Label>Border Radius</Label>
          <Input
            type="number"
            value={props.borderRadius}
            min={0}
            onChange={(e) =>
              setProp((p: CraftMapProps) => { p.borderRadius = Number(e.target.value); })
            }
          />
        </div>
      </div>
    </div>
  );
}

CraftMap.craft = {
  displayName: "Map",
  props: {
    address: "",
    width: 600,
    height: 400,
    zoom: 14,
    borderRadius: 8,
  } satisfies CraftMapProps,
  related: {
    settings: CraftMapSettings,
  },
};
