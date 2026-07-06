"use client";

import { useNode } from "@craftjs/core";
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
import { Star } from "lucide-react";
import { ICON_MAP, ICON_NAMES } from "../icon-map";

interface CraftIconProps {
  icon?: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
  backgroundColor?: string;
  backgroundSize?: number;
  borderRadius?: number;
}

export function CraftIcon({
  icon = "star",
  size = 28,
  color = "#06b6d4",
  strokeWidth = 1.5,
  backgroundColor = "#06b6d41a",
  backgroundSize = 56,
  borderRadius = 9999,
}: CraftIconProps) {
  const {
    connectors: { connect, drag },
  } = useNode();

  const IconComponent = ICON_MAP[icon] ?? Star;

  return (
    <div
      ref={craftRef(connect, drag)}
      style={{
        width: backgroundSize,
        height: backgroundSize,
        borderRadius,
        backgroundColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <IconComponent size={size} color={color} strokeWidth={strokeWidth} />
    </div>
  );
}

function CraftIconSettings() {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as CraftIconProps,
  }));

  return (
    <div className="space-y-4">
      <div>
        <Label>Icon</Label>
        <Select
          value={props.icon}
          onValueChange={(val) =>
            setProp((p: CraftIconProps) => {
              p.icon = val ?? "star";
            })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {ICON_NAMES.map((name) => {
              const IC = ICON_MAP[name];
              return (
                <SelectItem key={name} value={name}>
                  <span className="flex items-center gap-2">
                    <IC size={16} />
                    {name}
                  </span>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="craft-icon-size">Icon Size</Label>
        <Input
          id="craft-icon-size"
          type="number"
          value={props.size}
          onChange={(e) =>
            setProp((p: CraftIconProps) => {
              p.size = Number(e.target.value);
            })
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="craft-icon-color">Icon Color</Label>
          <Input
            id="craft-icon-color"
            type="color"
            value={props.color}
            onChange={(e) =>
              setProp((p: CraftIconProps) => {
                p.color = e.target.value;
              })
            }
          />
        </div>
        <div>
          <Label htmlFor="craft-icon-bg">Background</Label>
          <Input
            id="craft-icon-bg"
            type="color"
            value={(props.backgroundColor ?? "#06b6d4").slice(0, 7)}
            onChange={(e) =>
              setProp((p: CraftIconProps) => {
                p.backgroundColor = e.target.value + "1a";
              })
            }
          />
        </div>
      </div>

      <div>
        <Label htmlFor="craft-icon-bgsize">Background Size</Label>
        <Input
          id="craft-icon-bgsize"
          type="number"
          value={props.backgroundSize}
          onChange={(e) =>
            setProp((p: CraftIconProps) => {
              p.backgroundSize = Number(e.target.value);
            })
          }
        />
      </div>

      <div>
        <Label htmlFor="craft-icon-radius">Border Radius</Label>
        <Input
          id="craft-icon-radius"
          type="number"
          value={props.borderRadius}
          onChange={(e) =>
            setProp((p: CraftIconProps) => {
              p.borderRadius = Number(e.target.value);
            })
          }
        />
      </div>

      <div>
        <Label htmlFor="craft-icon-stroke">Stroke Width</Label>
        <Input
          id="craft-icon-stroke"
          type="number"
          step="0.5"
          value={props.strokeWidth}
          onChange={(e) =>
            setProp((p: CraftIconProps) => {
              p.strokeWidth = Number(e.target.value);
            })
          }
        />
      </div>
    </div>
  );
}

CraftIcon.craft = {
  displayName: "Icon",
  props: {
    icon: "star",
    size: 28,
    color: "#06b6d4",
    strokeWidth: 1.5,
    backgroundColor: "#06b6d41a",
    backgroundSize: 56,
    borderRadius: 9999,
  } satisfies CraftIconProps,
  related: {
    settings: CraftIconSettings,
  },
};
