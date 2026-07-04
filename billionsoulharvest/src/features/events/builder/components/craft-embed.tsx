"use client";

import { useNode, UserComponent } from "@craftjs/core";
import { craftRef } from "../craft-utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const embedTypes = [
  { value: "calendar", label: "Calendar", placeholder: "Paste Google Calendar embed URL" },
  { value: "map", label: "Map", placeholder: "Paste Google Maps embed URL" },
  { value: "docs", label: "Docs", placeholder: "Paste Google Docs publish URL" },
  { value: "slides", label: "Slides", placeholder: "Paste Google Slides publish URL" },
  { value: "sheets", label: "Sheets", placeholder: "Paste Google Sheets publish URL" },
  { value: "forms", label: "Forms", placeholder: "Paste Google Forms URL" },
  { value: "charts", label: "Charts", placeholder: "Paste chart embed URL" },
  { value: "custom", label: "Custom Embed", placeholder: "Paste any embed URL" },
] as const;

type EmbedType = (typeof embedTypes)[number]["value"];

interface CraftEmbedProps {
  embedType?: EmbedType;
  url?: string;
  width?: number;
  height?: number;
  borderRadius?: number;
}

const typeIcons: Record<EmbedType, React.ReactNode> = {
  calendar: (
    <svg className="w-8 h-8" fill="none" stroke="#9ca3af" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  map: (
    <svg className="w-8 h-8" fill="none" stroke="#9ca3af" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  docs: (
    <svg className="w-8 h-8" fill="none" stroke="#9ca3af" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  slides: (
    <svg className="w-8 h-8" fill="none" stroke="#9ca3af" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M3 7a2 2 0 012-2h14a2 2 0 012 2M3 7h18M7 11h4m-4 4h10" />
    </svg>
  ),
  sheets: (
    <svg className="w-8 h-8" fill="none" stroke="#9ca3af" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M3 14h18M10 3v18M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
    </svg>
  ),
  forms: (
    <svg className="w-8 h-8" fill="none" stroke="#9ca3af" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  charts: (
    <svg className="w-8 h-8" fill="none" stroke="#9ca3af" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  custom: (
    <svg className="w-8 h-8" fill="none" stroke="#9ca3af" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
};

export const CraftEmbed: UserComponent<CraftEmbedProps> = ({
  embedType = "custom",
  url = "",
  width = 600,
  height = 400,
  borderRadius = 4,
}) => {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((state) => ({
    selected: state.events.selected,
  }));

  const typeConfig = embedTypes.find((t) => t.value === embedType);

  return (
    <div
      ref={craftRef(connect, drag)}
      style={{
        width,
        maxWidth: "100%",
        height,
        borderRadius,
        cursor: "move",
        outline: selected ? "2px solid #D4A843" : "none",
        overflow: "hidden",
      }}
    >
      {url ? (
        <iframe
          src={url}
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            borderRadius,
            pointerEvents: selected ? "none" : "auto",
          }}
          allowFullScreen
          loading="lazy"
          title={typeConfig?.label ?? "Embed"}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius,
            border: "2px dashed #374151",
            backgroundColor: "#111827",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          {typeIcons[embedType]}
          <span style={{ fontSize: 14, color: "#9ca3af", fontWeight: 500 }}>
            {typeConfig?.label ?? "Embed"}
          </span>
          <span style={{ fontSize: 12, color: "#6b7280" }}>
            Click to add URL in settings
          </span>
        </div>
      )}
    </div>
  );
};

function EmbedSettings() {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as CraftEmbedProps,
  }));

  const typeConfig = embedTypes.find((t) => t.value === props.embedType);

  return (
    <div className="space-y-4">
      <div>
        <Label>Embed Type</Label>
        <Select
          value={props.embedType ?? "custom"}
          onValueChange={(val) =>
            setProp((p: CraftEmbedProps) => {
              p.embedType = val as EmbedType;
            })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {embedTypes.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="embed-url">URL</Label>
        <Input
          id="embed-url"
          type="url"
          value={props.url ?? ""}
          placeholder={typeConfig?.placeholder ?? "Paste embed URL"}
          onChange={(e) =>
            setProp((p: CraftEmbedProps) => {
              p.url = e.target.value;
            })
          }
        />
        <p className="text-[11px] text-gray-400 mt-1">
          Use the embed/publish URL, not the regular page URL
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="embed-width">Width</Label>
          <Input
            id="embed-width"
            type="number"
            value={props.width}
            min={100}
            onChange={(e) =>
              setProp((p: CraftEmbedProps) => {
                p.width = Number(e.target.value);
              })
            }
          />
        </div>
        <div>
          <Label htmlFor="embed-height">Height</Label>
          <Input
            id="embed-height"
            type="number"
            value={props.height}
            min={100}
            onChange={(e) =>
              setProp((p: CraftEmbedProps) => {
                p.height = Number(e.target.value);
              })
            }
          />
        </div>
      </div>

      <div>
        <Label htmlFor="embed-radius">Border Radius</Label>
        <Input
          id="embed-radius"
          type="number"
          value={props.borderRadius}
          min={0}
          onChange={(e) =>
            setProp((p: CraftEmbedProps) => {
              p.borderRadius = Number(e.target.value);
            })
          }
        />
      </div>
    </div>
  );
}

CraftEmbed.craft = {
  displayName: "Embed",
  props: {
    embedType: "custom",
    url: "",
    width: 600,
    height: 400,
    borderRadius: 4,
  } satisfies CraftEmbedProps,
  related: {
    settings: EmbedSettings,
  },
};
