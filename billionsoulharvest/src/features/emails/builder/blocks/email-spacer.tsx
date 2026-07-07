"use client";

import { useNode, type UserComponent } from "@craftjs/core";
import { craftRef } from "@/features/events/builder/craft-utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SpacerProps {
  height?: number;
}

export const EmailSpacer: UserComponent<SpacerProps> = ({
  height = 32,
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
        height: `${height}px`,
        cursor: "grab",
        outline: selected ? "2px solid #2563eb" : "1px dashed transparent",
        outlineOffset: "2px",
        background: selected ? "repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(37,99,235,0.05) 5px, rgba(37,99,235,0.05) 10px)" : "transparent",
      }}
    />
  );
};

function SpacerSettings() {
  const {
    actions: { setProp },
    height,
  } = useNode((node) => ({
    height: node.data.props.height as number,
  }));

  return (
    <div className="space-y-3">
      <div>
        <Label>Height (px)</Label>
        <Input
          type="number"
          min={4}
          max={200}
          value={height}
          onChange={(e) => setProp((p: SpacerProps) => { p.height = Number(e.target.value); })}
        />
      </div>
    </div>
  );
}

EmailSpacer.craft = {
  displayName: "Spacer",
  props: {
    height: 32,
  },
  related: {
    settings: SpacerSettings,
  },
};
