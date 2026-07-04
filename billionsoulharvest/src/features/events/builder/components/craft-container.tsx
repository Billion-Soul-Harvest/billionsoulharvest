"use client";

import { useNode, UserComponent } from "@craftjs/core";
import { craftRef } from "../craft-utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/shared/components/image-upload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function hexToRgba(hex: string, alpha: number): string {
  if (hex === "transparent") return `rgba(0,0,0,${alpha})`;
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return `rgba(0,0,0,${alpha})`;
  return `rgba(${r},${g},${b},${alpha})`;
}

interface ContainerProps {
  backgroundColor?: string;
  backgroundImage?: string;
  padding?: number;
  borderRadius?: number;
  borderColor?: string;
  borderWidth?: number;
  width?: number;
  minHeight?: number;
  alignItems?: "stretch" | "flex-start" | "center" | "flex-end";
  gap?: number;
  children?: React.ReactNode;
}

export const CraftContainer: UserComponent<ContainerProps> = ({
  backgroundColor = "transparent",
  backgroundImage = "",
  padding = 20,
  borderRadius = 0,
  borderColor = "transparent",
  borderWidth = 0,
  width = 600,
  minHeight = 200,
  alignItems,
  gap = 0,
  children,
}) => {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((state) => ({
    selected: state.events.selected,
  }));

  return (
    <div
      ref={craftRef(connect, drag)}
      style={{
        backgroundColor: backgroundImage ? undefined : backgroundColor,
        backgroundImage: backgroundImage
          ? `linear-gradient(${hexToRgba(backgroundColor, 0.6)}, ${hexToRgba(backgroundColor, 0.6)}), url(${backgroundImage})`
          : undefined,
        backgroundSize: backgroundImage ? "cover" : undefined,
        backgroundPosition: backgroundImage ? "center" : undefined,
        padding: `${padding}px`,
        borderRadius: `${borderRadius}px`,
        borderColor,
        borderWidth: `${borderWidth}px`,
        borderStyle: borderWidth > 0 ? "solid" : "none",
        width: `${width}px`,
        maxWidth: "100%",
        minHeight: `${minHeight}px`,
        cursor: "move",
        outline: selected ? "2px solid #D4A843" : "none",
        ...(alignItems ? {
          display: "flex",
          flexDirection: "column" as const,
          alignItems,
        } : {}),
        ...(gap > 0 ? { gap: `${gap}px` } : {}),
      }}
    >
      {children}
    </div>
  );
};

function ContainerSettings() {
  const {
    actions: { setProp },
    backgroundColor,
    backgroundImage,
    padding,
    borderRadius,
    borderColor,
    borderWidth,
    width,
    minHeight,
    alignItems,
    gap,
  } = useNode((node) => ({
    backgroundColor: node.data.props.backgroundColor as string,
    backgroundImage: node.data.props.backgroundImage as string,
    padding: node.data.props.padding as number,
    borderRadius: node.data.props.borderRadius as number,
    borderColor: node.data.props.borderColor as string,
    borderWidth: node.data.props.borderWidth as number,
    width: node.data.props.width as number,
    minHeight: node.data.props.minHeight as number,
    alignItems: node.data.props.alignItems as string | undefined,
    gap: node.data.props.gap as number,
  }));

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="backgroundColor">Background Color</Label>
        <Input
          id="backgroundColor"
          type="color"
          value={backgroundColor === "transparent" ? "#000000" : backgroundColor}
          onChange={(e) =>
            setProp((props: ContainerProps) => {
              props.backgroundColor = e.target.value;
            })
          }
        />
      </div>

      <div>
        <Label>Background Image</Label>
        <ImageUpload
          value={backgroundImage}
          onChange={(url) =>
            setProp((props: ContainerProps) => {
              props.backgroundImage = url;
            })
          }
          folder="builder"
        />
      </div>

      <div>
        <Label htmlFor="padding">Padding</Label>
        <Input
          id="padding"
          type="number"
          value={padding}
          min={0}
          onChange={(e) =>
            setProp((props: ContainerProps) => {
              props.padding = Number(e.target.value);
            })
          }
        />
      </div>

      <div>
        <Label htmlFor="borderRadius">Border Radius</Label>
        <Input
          id="borderRadius"
          type="number"
          value={borderRadius}
          min={0}
          onChange={(e) =>
            setProp((props: ContainerProps) => {
              props.borderRadius = Number(e.target.value);
            })
          }
        />
      </div>

      <div>
        <Label htmlFor="borderColor">Border Color</Label>
        <Input
          id="borderColor"
          type="color"
          value={borderColor === "transparent" ? "#000000" : borderColor}
          onChange={(e) =>
            setProp((props: ContainerProps) => {
              props.borderColor = e.target.value;
            })
          }
        />
      </div>

      <div>
        <Label htmlFor="borderWidth">Border Width</Label>
        <Input
          id="borderWidth"
          type="number"
          value={borderWidth}
          min={0}
          onChange={(e) =>
            setProp((props: ContainerProps) => {
              props.borderWidth = Number(e.target.value);
            })
          }
        />
      </div>

      <div>
        <Label htmlFor="width">Width</Label>
        <Input
          id="width"
          type="number"
          value={width}
          min={50}
          onChange={(e) =>
            setProp((props: ContainerProps) => {
              props.width = Number(e.target.value);
            })
          }
        />
      </div>

      <div>
        <Label htmlFor="minHeight">Min Height</Label>
        <Input
          id="minHeight"
          type="number"
          value={minHeight}
          min={20}
          onChange={(e) =>
            setProp((props: ContainerProps) => {
              props.minHeight = Number(e.target.value);
            })
          }
        />
      </div>

      <div>
        <Label>Align Items</Label>
        <Select
          value={alignItems ?? "none"}
          onValueChange={(val) =>
            setProp((p: ContainerProps) => {
              p.alignItems = val === "none" ? undefined : val as ContainerProps["alignItems"];
            })
          }
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None (block)</SelectItem>
            <SelectItem value="stretch">Stretch</SelectItem>
            <SelectItem value="flex-start">Left</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="flex-end">Right</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="gap">Gap</Label>
        <Input
          id="gap"
          type="number"
          value={gap}
          min={0}
          onChange={(e) =>
            setProp((props: ContainerProps) => {
              props.gap = Number(e.target.value);
            })
          }
        />
      </div>
    </div>
  );
}

CraftContainer.craft = {
  displayName: "Container",
  props: {
    backgroundColor: "transparent",
    backgroundImage: "",
    padding: 20,
    borderRadius: 0,
    borderColor: "transparent",
    borderWidth: 0,
    width: 600,
    minHeight: 200,
    alignItems: undefined,
    gap: 0,
  },
  related: {
    settings: ContainerSettings,
  },
  rules: {
    canDrag: () => true,
  },
};
