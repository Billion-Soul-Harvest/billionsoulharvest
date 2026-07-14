"use client";

import { useNode, UserComponent } from "@craftjs/core";
import { craftRef } from "../craft-utils";
import { useCanvasWidth } from "../canvas-width-context";
import { responsiveSize, isPhone } from "../responsive-utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RowProps {
  gap?: number;
  padding?: number;
  alignItems?: "flex-start" | "center" | "flex-end" | "stretch";
  justifyContent?: "flex-start" | "center" | "flex-end" | "space-between" | "space-around";
  flexWrap?: "nowrap" | "wrap";
  backgroundColor?: string;
  minHeight?: number;
  children?: React.ReactNode;
}

export const CraftRow: UserComponent<RowProps> = ({
  gap = 16,
  padding = 0,
  alignItems = "stretch",
  justifyContent = "flex-start",
  flexWrap = "wrap",
  backgroundColor = "transparent",
  minHeight = 60,
  children,
}) => {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((state) => ({
    selected: state.events.selected,
  }));

  const cw = useCanvasWidth();
  const phoneMode = isPhone(cw);

  return (
    <div
      ref={craftRef(connect, drag)}
      style={{
        display: "flex",
        flexDirection: phoneMode ? "column" : "row",
        gap: `${responsiveSize(gap, cw, 4)}px`,
        padding: `${responsiveSize(padding, cw, 0)}px`,
        alignItems,
        justifyContent: phoneMode ? "flex-start" : justifyContent,
        flexWrap: phoneMode ? "wrap" : flexWrap,
        backgroundColor,
        minHeight: `${minHeight}px`,
        width: "100%",
        cursor: "move",
        outline: selected ? "2px solid #D4A843" : "none",
      }}
    >
      {children}
    </div>
  );
};

function RowSettings() {
  const {
    actions: { setProp },
    gap,
    padding,
    alignItems,
    justifyContent,
    flexWrap,
    backgroundColor,
    minHeight,
  } = useNode((node) => ({
    gap: node.data.props.gap as number,
    padding: node.data.props.padding as number,
    alignItems: node.data.props.alignItems as string,
    justifyContent: node.data.props.justifyContent as string,
    flexWrap: node.data.props.flexWrap as string,
    backgroundColor: node.data.props.backgroundColor as string,
    minHeight: node.data.props.minHeight as number,
  }));

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="row-gap">Gap</Label>
          <Input
            id="row-gap"
            type="number"
            value={gap}
            min={0}
            onChange={(e) =>
              setProp((p: RowProps) => {
                p.gap = Number(e.target.value);
              })
            }
          />
        </div>
        <div>
          <Label htmlFor="row-padding">Padding</Label>
          <Input
            id="row-padding"
            type="number"
            value={padding}
            min={0}
            onChange={(e) =>
              setProp((p: RowProps) => {
                p.padding = Number(e.target.value);
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
            setProp((p: RowProps) => {
              p.alignItems = val as RowProps["alignItems"];
            })
          }
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="stretch">Stretch</SelectItem>
            <SelectItem value="flex-start">Top</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="flex-end">Bottom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Justify Content</Label>
        <Select
          value={justifyContent}
          onValueChange={(val) =>
            setProp((p: RowProps) => {
              p.justifyContent = val as RowProps["justifyContent"];
            })
          }
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="flex-start">Start</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="flex-end">End</SelectItem>
            <SelectItem value="space-between">Space Between</SelectItem>
            <SelectItem value="space-around">Space Around</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Wrap</Label>
        <Select
          value={flexWrap}
          onValueChange={(val) =>
            setProp((p: RowProps) => {
              p.flexWrap = val as RowProps["flexWrap"];
            })
          }
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="wrap">Wrap</SelectItem>
            <SelectItem value="nowrap">No Wrap</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="row-bg">Background</Label>
        <Input
          id="row-bg"
          type="color"
          value={backgroundColor === "transparent" ? "#000000" : backgroundColor}
          onChange={(e) =>
            setProp((p: RowProps) => {
              p.backgroundColor = e.target.value;
            })
          }
        />
      </div>

      <div>
        <Label htmlFor="row-minHeight">Min Height</Label>
        <Input
          id="row-minHeight"
          type="number"
          value={minHeight}
          min={0}
          onChange={(e) =>
            setProp((p: RowProps) => {
              p.minHeight = Number(e.target.value);
            })
          }
        />
      </div>
    </div>
  );
}

CraftRow.craft = {
  displayName: "Row",
  props: {
    gap: 16,
    padding: 0,
    alignItems: "stretch",
    justifyContent: "flex-start",
    flexWrap: "wrap",
    backgroundColor: "transparent",
    minHeight: 60,
  },
  related: {
    settings: RowSettings,
  },
  rules: {
    canDrag: () => true,
  },
};
