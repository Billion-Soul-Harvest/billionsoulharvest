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

interface SocialLink {
  platform: string;
  url: string;
}

interface CraftSocialLinksProps {
  links?: SocialLink[];
  iconSize?: number;
  iconColor?: string;
  hoverColor?: string;
  gap?: number;
  alignment?: "left" | "center" | "right";
}

const platformIcons: Record<string, (color: string, size: number) => React.ReactNode> = {
  facebook: (color, size) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  ),
  instagram: (color, size) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  ),
  x: (color, size) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  youtube: (color, size) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),
  linkedin: (color, size) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
  tiktok: (color, size) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  ),
  website: (color, size) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  ),
  email: (color, size) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
};

const platformOptions = Object.keys(platformIcons);

const defaultLinks: SocialLink[] = [
  { platform: "facebook", url: "" },
  { platform: "instagram", url: "" },
  { platform: "x", url: "" },
  { platform: "youtube", url: "" },
];

export const CraftSocialLinks: UserComponent<CraftSocialLinksProps> = ({
  links = defaultLinks,
  iconSize = 24,
  iconColor = "#ffffff",
  gap = 16,
  alignment = "center",
}) => {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((state) => ({
    selected: state.events.selected,
  }));

  const justifyContent = alignment === "left" ? "flex-start" : alignment === "right" ? "flex-end" : "center";

  return (
    <div
      ref={craftRef(connect, drag)}
      style={{
        display: "flex",
        gap: `${gap}px`,
        justifyContent,
        alignItems: "center",
        padding: "8px 0",
        cursor: "move",
        outline: selected ? "2px solid #D4A843" : "none",
        width: "100%",
      }}
    >
      {links.map((link, i) => {
        const renderIcon = platformIcons[link.platform];
        if (!renderIcon) return null;
        return (
          <a
            key={i}
            href={link.url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: link.url ? 1 : 0.4,
              transition: "opacity 0.2s",
            }}
            onClick={(e) => e.preventDefault()}
          >
            {renderIcon(iconColor, iconSize)}
          </a>
        );
      })}
    </div>
  );
};

function SocialLinksSettings() {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as CraftSocialLinksProps,
  }));

  const links = props.links ?? defaultLinks;

  const updateLink = (index: number, field: keyof SocialLink, value: string) => {
    setProp((p: CraftSocialLinksProps) => {
      const updated = [...(p.links ?? defaultLinks)];
      updated[index] = { ...updated[index], [field]: value };
      p.links = updated;
    });
  };

  const addLink = () => {
    setProp((p: CraftSocialLinksProps) => {
      p.links = [...(p.links ?? defaultLinks), { platform: "website", url: "" }];
    });
  };

  const removeLink = (index: number) => {
    setProp((p: CraftSocialLinksProps) => {
      const updated = [...(p.links ?? defaultLinks)];
      updated.splice(index, 1);
      p.links = updated;
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="mb-2 block">Social Links</Label>
        <div className="space-y-3">
          {links.map((link, i) => (
            <div key={i} className="space-y-1.5 p-2 bg-gray-50 rounded-md">
              <div className="flex gap-2 items-center">
                <Select
                  value={link.platform}
                  onValueChange={(val) => { if (val) updateLink(i, "platform", val); }}
                >
                  <SelectTrigger className="w-28 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {platformOptions.map((p) => (
                      <SelectItem key={p} value={p} className="capitalize">
                        {p === "x" ? "X (Twitter)" : p.charAt(0).toUpperCase() + p.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <button
                  onClick={() => removeLink(i)}
                  className="text-gray-400 hover:text-red-500 transition-colors ml-auto"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <Input
                type="url"
                value={link.url}
                placeholder={`${link.platform} URL`}
                onChange={(e) => updateLink(i, "url", e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          ))}
        </div>
        <button
          onClick={addLink}
          className="mt-2 w-full text-xs text-[#29BDD6] hover:text-[#29BDD6]/80 font-medium py-1.5 border border-dashed border-gray-300 rounded-md hover:border-[#29BDD6] transition-colors"
        >
          + Add Link
        </button>
      </div>

      <div>
        <Label htmlFor="icon-size">Icon Size</Label>
        <Input
          id="icon-size"
          type="number"
          value={props.iconSize ?? 24}
          min={12}
          max={64}
          onChange={(e) =>
            setProp((p: CraftSocialLinksProps) => {
              p.iconSize = Number(e.target.value);
            })
          }
        />
      </div>

      <div>
        <Label htmlFor="icon-color">Icon Color</Label>
        <div className="flex gap-2">
          <Input
            id="icon-color"
            type="color"
            value={props.iconColor ?? "#ffffff"}
            onChange={(e) =>
              setProp((p: CraftSocialLinksProps) => {
                p.iconColor = e.target.value;
              })
            }
            className="w-10 h-9 p-1"
          />
          <Input
            type="text"
            value={props.iconColor ?? "#ffffff"}
            onChange={(e) =>
              setProp((p: CraftSocialLinksProps) => {
                p.iconColor = e.target.value;
              })
            }
            className="flex-1"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="link-gap">Gap</Label>
        <Input
          id="link-gap"
          type="number"
          value={props.gap ?? 16}
          min={0}
          onChange={(e) =>
            setProp((p: CraftSocialLinksProps) => {
              p.gap = Number(e.target.value);
            })
          }
        />
      </div>

      <div>
        <Label>Alignment</Label>
        <Select
          value={props.alignment ?? "center"}
          onValueChange={(val) =>
            setProp((p: CraftSocialLinksProps) => {
              p.alignment = val as CraftSocialLinksProps["alignment"];
            })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Left</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="right">Right</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

CraftSocialLinks.craft = {
  displayName: "Social Links",
  props: {
    links: defaultLinks,
    iconSize: 24,
    iconColor: "#ffffff",
    gap: 16,
    alignment: "center",
  } satisfies CraftSocialLinksProps,
  related: {
    settings: SocialLinksSettings,
  },
};
