"use client";

import { useNode, type UserComponent } from "@craftjs/core";
import { craftRef } from "@/features/events/builder/craft-utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DividerProps {
  color?: string;
  thickness?: number;
  marginTop?: number;
  marginBottom?: number;
}

export const EmailDivider: UserComponent<DividerProps> = ({
  color = "#c4c6cc",
  thickness = 1,
  marginTop = 16,
  marginBottom = 16,
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
        cursor: "grab",
        outline: selected ? "2px solid #2563eb" : "1px dashed transparent",
        outlineOffset: "2px",
      }}
    >
      <hr
        style={{
          border: "none",
          borderTop: `${thickness}px solid ${color}`,
          marginTop: `${marginTop}px`,
          marginBottom: `${marginBottom}px`,
          width: "100%",
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
    marginTop,
    marginBottom,
  } = useNode((node) => ({
    color: node.data.props.color as string,
    thickness: node.data.props.thickness as number,
    marginTop: node.data.props.marginTop as number,
    marginBottom: node.data.props.marginBottom as number,
  }));

  return (
    <div className="space-y-3">
      <div>
        <Label>Color</Label>
        <Input
          type="color"
          value={color}
          onChange={(e) => setProp((p: DividerProps) => { p.color = e.target.value; })}
        />
      </div>
      <div>
        <Label>Thickness (px)</Label>
        <Input
          type="number"
          min={1}
          max={10}
          value={thickness}
          onChange={(e) => setProp((p: DividerProps) => { p.thickness = Number(e.target.value); })}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>Margin Top</Label>
          <Input
            type="number"
            value={marginTop}
            onChange={(e) => setProp((p: DividerProps) => { p.marginTop = Number(e.target.value); })}
          />
        </div>
        <div>
          <Label>Margin Bottom</Label>
          <Input
            type="number"
            value={marginBottom}
            onChange={(e) => setProp((p: DividerProps) => { p.marginBottom = Number(e.target.value); })}
          />
        </div>
      </div>
    </div>
  );
}

EmailDivider.craft = {
  displayName: "Divider",
  props: {
    color: "#c4c6cc",
    thickness: 1,
    marginTop: 16,
    marginBottom: 16,
  },
  related: {
    settings: DividerSettings,
  },
};
