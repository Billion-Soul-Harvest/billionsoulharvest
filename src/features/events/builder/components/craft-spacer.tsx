"use client";

import { useNode } from "@craftjs/core";
import { useCanvasWidth } from "../canvas-width-context";
import { responsiveSize } from "../responsive-utils";

interface CraftSpacerProps {
  height?: number;
}

export function CraftSpacer({ height = 40 }: CraftSpacerProps) {
  const { connectors: { connect, drag }, selected } = useNode((state) => ({
    selected: state.events.selected,
  }));

  const cw = useCanvasWidth();

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      style={{ height: `${responsiveSize(height, cw, 8)}px` }}
      className={`w-full ${selected ? "outline outline-2 outline-dashed outline-blue-300" : ""}`}
    />
  );
}

function CraftSpacerSettings() {
  const { actions: { setProp }, height } = useNode((node) => ({
    height: node.data.props.height ?? 40,
  }));

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-medium text-gray-700 block mb-1">
          Height ({height}px)
        </label>
        <input
          type="range"
          min={8}
          max={200}
          value={height}
          onChange={(e) => setProp((props: CraftSpacerProps) => { props.height = parseInt(e.target.value); })}
          className="w-full"
        />
      </div>
    </div>
  );
}

CraftSpacer.craft = {
  displayName: "Spacer",
  props: { height: 40 },
  related: { settings: CraftSpacerSettings },
};
