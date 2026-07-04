"use client";

import { useNode, UserComponent } from "@craftjs/core";
import { craftRef } from "../craft-utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DividerProps {
  color?: string;
  thickness?: number;
  widthPercent?: number;
  marginY?: number;
}

export const CraftDivider: UserComponent<DividerProps> = ({
  color = "#ffffff20",
  thickness = 1,
  widthPercent = 100,
  marginY = 16,
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
        justifyContent: "center",
        width: "100%",
        paddingTop: `${marginY}px`,
        paddingBottom: `${marginY}px`,
        cursor: "move",
        outline: selected ? "2px solid #D4A843" : "none",
      }}
    >
      <hr
        style={{
          border: "none",
          borderTop: `${thickness}px solid ${color}`,
          width: `${widthPercent}%`,
          margin: 0,
        }}
      />
    </div>
  );
};

function DividerSettings() {
  const {
    actions: { setProp },
    color,
    thickness,
    widthPercent,
    marginY,
  } = useNode((node) => ({
    color: node.data.props.color as string,
    thickness: node.data.props.thickness as number,
    widthPercent: node.data.props.widthPercent as number,
    marginY: node.data.props.marginY as number,
  }));

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="color">Color</Label>
        <Input
          id="color"
          type="color"
          value={color}
          onChange={(e) =>
            setProp((props: DividerProps) => {
              props.color = e.target.value;
            })
          }
        />
      </div>

      <div>
        <Label htmlFor="thickness">Thickness</Label>
        <Input
          id="thickness"
          type="number"
          value={thickness}
          min={1}
          onChange={(e) =>
            setProp((props: DividerProps) => {
              props.thickness = Number(e.target.value);
            })
          }
        />
      </div>

      <div>
        <Label htmlFor="widthPercent">Width (%)</Label>
        <Input
          id="widthPercent"
          type="number"
          value={widthPercent}
          min={0}
          max={100}
          onChange={(e) =>
            setProp((props: DividerProps) => {
              props.widthPercent = Number(e.target.value);
            })
          }
        />
      </div>

      <div>
        <Label htmlFor="marginY">Vertical Margin</Label>
        <Input
          id="marginY"
          type="number"
          value={marginY}
          min={0}
          onChange={(e) =>
            setProp((props: DividerProps) => {
              props.marginY = Number(e.target.value);
            })
          }
        />
      </div>
    </div>
  );
}

CraftDivider.craft = {
  displayName: "Divider",
  props: {
    color: "#ffffff20",
    thickness: 1,
    widthPercent: 100,
    marginY: 16,
  },
  related: {
    settings: DividerSettings,
  },
};
