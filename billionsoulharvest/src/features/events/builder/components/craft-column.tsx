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
import { Button } from "@/components/ui/button";

interface ColumnProps {
  width?: string;
  minWidth?: number;
  padding?: number;
  backgroundColor?: string;
  alignItems?: "flex-start" | "center" | "flex-end" | "stretch";
  justifyContent?: "flex-start" | "center" | "flex-end" | "space-between";
  gap?: number;
  children?: React.ReactNode;
}

export const CraftColumn: UserComponent<ColumnProps> = ({
  width = "50%",
  minWidth = 0,
  padding = 12,
  backgroundColor = "transparent",
  alignItems = "stretch",
  justifyContent = "flex-start",
  gap = 8,
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
        display: "flex",
        flexDirection: "column",
        width,
        flex: width === "auto" ? "1 1 0%" : undefined,
        minWidth: minWidth > 0 ? `${minWidth}px` : 0,
        padding: `${padding}px`,
        backgroundColor,
        alignItems,
        justifyContent,
        gap: `${gap}px`,
        minHeight: "40px",
        cursor: "move",
        outline: selected ? "2px solid #D4A843" : "none",
      }}
    >
      {children}
    </div>
  );
};

const widthPresets = [
  { label: "Auto", value: "auto" },
  { label: "25%", value: "25%" },
  { label: "33%", value: "33.333%" },
  { label: "50%", value: "50%" },
  { label: "66%", value: "66.666%" },
  { label: "75%", value: "75%" },
  { label: "100%", value: "100%" },
];

function ColumnSettings() {
  const {
    actions: { setProp },
    width,
    minWidth,
    padding,
    backgroundColor,
    alignItems,
    justifyContent,
    gap,
  } = useNode((node) => ({
    width: node.data.props.width as string,
    minWidth: node.data.props.minWidth as number,
    padding: node.data.props.padding as number,
    backgroundColor: node.data.props.backgroundColor as string,
    alignItems: node.data.props.alignItems as string,
    justifyContent: node.data.props.justifyContent as string,
    gap: node.data.props.gap as number,
  }));

  return (
    <div className="space-y-3">
      <div>
        <Label>Width</Label>
        <div className="flex flex-wrap gap-1 mt-1">
          {widthPresets.map((preset) => (
            <Button
              key={preset.value}
              size="sm"
              variant={width === preset.value ? "default" : "outline"}
              className="text-xs px-2 h-7"
              onClick={() =>
                setProp((p: ColumnProps) => {
                  p.width = preset.value;
                })
              }
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="col-minWidth">Min Width (for responsive wrapping)</Label>
        <Input
          id="col-minWidth"
          type="number"
          value={minWidth}
          min={0}
          placeholder="0 = no minimum"
          onChange={(e) =>
            setProp((p: ColumnProps) => {
              p.minWidth = Number(e.target.value);
            })
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="col-padding">Padding</Label>
          <Input
            id="col-padding"
            type="number"
            value={padding}
            min={0}
            onChange={(e) =>
              setProp((p: ColumnProps) => {
                p.padding = Number(e.target.value);
              })
            }
          />
        </div>
        <div>
          <Label htmlFor="col-gap">Gap</Label>
          <Input
            id="col-gap"
            type="number"
            value={gap}
            min={0}
            onChange={(e) =>
              setProp((p: ColumnProps) => {
                p.gap = Number(e.target.value);
              })
            }
          />
        </div>
      </div>

      <div>
        <Label>Align Items</Label>
        <Select
          value={alignItems}
          onValueChange={(val) =>
            setProp((p: ColumnProps) => {
              p.alignItems = val as ColumnProps["alignItems"];
            })
          }
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="stretch">Stretch</SelectItem>
            <SelectItem value="flex-start">Left</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="flex-end">Right</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Justify Content</Label>
        <Select
          value={justifyContent}
          onValueChange={(val) =>
            setProp((p: ColumnProps) => {
              p.justifyContent = val as ColumnProps["justifyContent"];
            })
          }
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="flex-start">Top</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="flex-end">Bottom</SelectItem>
            <SelectItem value="space-between">Space Between</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="col-bg">Background</Label>
        <Input
          id="col-bg"
          type="color"
          value={backgroundColor === "transparent" ? "#000000" : backgroundColor}
          onChange={(e) =>
            setProp((p: ColumnProps) => {
              p.backgroundColor = e.target.value;
            })
          }
        />
      </div>
    </div>
  );
}

CraftColumn.craft = {
  displayName: "Column",
  props: {
    width: "50%",
    minWidth: 0,
    padding: 12,
    backgroundColor: "transparent",
    alignItems: "stretch",
    justifyContent: "flex-start",
    gap: 8,
  },
  related: {
    settings: ColumnSettings,
  },
  rules: {
    canDrag: () => true,
  },
};
