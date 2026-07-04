"use client";

import { useNode } from "@craftjs/core";
import { craftRef } from "../craft-utils";
import { ImageUpload } from "@/shared/components/image-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CraftImageProps {
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
  borderRadius?: number;
  objectFit?: "cover" | "contain" | "fill";
}

export function CraftImage({
  src = "",
  alt = "",
  width = 400,
  height = 300,
  borderRadius = 0,
  objectFit = "cover",
}: CraftImageProps) {
  const {
    connectors: { connect, drag },
  } = useNode();

  return (
    <div ref={craftRef(connect, drag)} style={{ width, maxWidth: "100%", aspectRatio: `${width} / ${height}` }}>
      {src ? (
        <img
          src={src}
          alt={alt}
          style={{
            width: "100%",
            height: "100%",
            borderRadius,
            objectFit,
            display: "block",
          }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius,
            border: "2px dashed #d1d5db",
            backgroundColor: "#f9fafb",
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
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span style={{ fontSize: 13, color: "#9ca3af" }}>
            Drop image or edit settings
          </span>
        </div>
      )}
    </div>
  );
}

function CraftImageSettings() {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as CraftImageProps,
  }));

  return (
    <div className="space-y-4">
      <div>
        <Label>Image</Label>
        <ImageUpload
          value={props.src ?? ""}
          onChange={(url) =>
            setProp((p: CraftImageProps) => {
              p.src = url;
            })
          }
          folder="builder"
        />
      </div>

      <div>
        <Label htmlFor="craft-image-alt">Alt Text</Label>
        <Input
          id="craft-image-alt"
          value={props.alt}
          onChange={(e) =>
            setProp((p: CraftImageProps) => {
              p.alt = e.target.value;
            })
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="craft-image-width">Width</Label>
          <Input
            id="craft-image-width"
            type="number"
            value={props.width}
            onChange={(e) =>
              setProp((p: CraftImageProps) => {
                p.width = Number(e.target.value);
              })
            }
          />
        </div>
        <div>
          <Label htmlFor="craft-image-height">Height</Label>
          <Input
            id="craft-image-height"
            type="number"
            value={props.height}
            onChange={(e) =>
              setProp((p: CraftImageProps) => {
                p.height = Number(e.target.value);
              })
            }
          />
        </div>
      </div>

      <div>
        <Label htmlFor="craft-image-radius">Border Radius</Label>
        <Input
          id="craft-image-radius"
          type="number"
          value={props.borderRadius}
          onChange={(e) =>
            setProp((p: CraftImageProps) => {
              p.borderRadius = Number(e.target.value);
            })
          }
        />
      </div>

      <div>
        <Label>Object Fit</Label>
        <Select
          value={props.objectFit}
          onValueChange={(val) =>
            setProp((p: CraftImageProps) => {
              p.objectFit = val as CraftImageProps["objectFit"];
            })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cover">Cover</SelectItem>
            <SelectItem value="contain">Contain</SelectItem>
            <SelectItem value="fill">Fill</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

CraftImage.craft = {
  displayName: "Image",
  props: {
    src: "",
    alt: "",
    width: 400,
    height: 300,
    borderRadius: 0,
    objectFit: "cover",
  } satisfies CraftImageProps,
  related: {
    settings: CraftImageSettings,
  },
};
