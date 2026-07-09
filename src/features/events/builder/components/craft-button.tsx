"use client";

import { useNode } from "@craftjs/core";
import { craftRef } from "../craft-utils";
import { useCanvasWidth } from "../canvas-width-context";
import { responsiveSize } from "../responsive-utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CraftButtonProps {
  text?: string;
  link?: string;
  bgColor?: string;
  textColor?: string;
  fontSize?: number;
  paddingX?: number;
  paddingY?: number;
  borderRadius?: number;
  width?: number;
}

export function CraftButton({
  text = "Click Me",
  bgColor = "#29BDD6",
  textColor = "#ffffff",
  fontSize = 16,
  paddingX = 32,
  paddingY = 16,
  borderRadius = 12,
  width = 200,
}: CraftButtonProps) {
  const {
    connectors: { connect, drag },
  } = useNode();

  const cw = useCanvasWidth();

  return (
    <div
      ref={craftRef(connect, drag)}
      style={{
        width: Math.min(width, cw),
        backgroundColor: bgColor,
        color: textColor,
        fontSize: responsiveSize(fontSize, cw, 12),
        paddingLeft: responsiveSize(paddingX, cw, 8),
        paddingRight: responsiveSize(paddingX, cw, 8),
        paddingTop: responsiveSize(paddingY, cw, 6),
        paddingBottom: responsiveSize(paddingY, cw, 6),
        borderRadius,
        textAlign: "center",
        cursor: "pointer",
        userSelect: "none",
        display: "inline-block",
        fontWeight: 500,
      }}
    >
      {text}
    </div>
  );
}

function CraftButtonSettings() {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as CraftButtonProps,
  }));

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="craft-btn-text">Text</Label>
        <Input
          id="craft-btn-text"
          value={props.text}
          onChange={(e) =>
            setProp((p: CraftButtonProps) => {
              p.text = e.target.value;
            })
          }
        />
      </div>

      <div>
        <Label htmlFor="craft-btn-link">Link URL</Label>
        <Input
          id="craft-btn-link"
          value={props.link}
          onChange={(e) =>
            setProp((p: CraftButtonProps) => {
              p.link = e.target.value;
            })
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="craft-btn-bg">Background Color</Label>
          <Input
            id="craft-btn-bg"
            type="color"
            value={props.bgColor}
            onChange={(e) =>
              setProp((p: CraftButtonProps) => {
                p.bgColor = e.target.value;
              })
            }
          />
        </div>
        <div>
          <Label htmlFor="craft-btn-color">Text Color</Label>
          <Input
            id="craft-btn-color"
            type="color"
            value={props.textColor}
            onChange={(e) =>
              setProp((p: CraftButtonProps) => {
                p.textColor = e.target.value;
              })
            }
          />
        </div>
      </div>

      <div>
        <Label htmlFor="craft-btn-fontsize">Font Size</Label>
        <Input
          id="craft-btn-fontsize"
          type="number"
          value={props.fontSize}
          onChange={(e) =>
            setProp((p: CraftButtonProps) => {
              p.fontSize = Number(e.target.value);
            })
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="craft-btn-px">Padding X</Label>
          <Input
            id="craft-btn-px"
            type="number"
            value={props.paddingX}
            onChange={(e) =>
              setProp((p: CraftButtonProps) => {
                p.paddingX = Number(e.target.value);
              })
            }
          />
        </div>
        <div>
          <Label htmlFor="craft-btn-py">Padding Y</Label>
          <Input
            id="craft-btn-py"
            type="number"
            value={props.paddingY}
            onChange={(e) =>
              setProp((p: CraftButtonProps) => {
                p.paddingY = Number(e.target.value);
              })
            }
          />
        </div>
      </div>

      <div>
        <Label htmlFor="craft-btn-radius">Border Radius</Label>
        <Input
          id="craft-btn-radius"
          type="number"
          value={props.borderRadius}
          onChange={(e) =>
            setProp((p: CraftButtonProps) => {
              p.borderRadius = Number(e.target.value);
            })
          }
        />
      </div>

      <div>
        <Label htmlFor="craft-btn-width">Width</Label>
        <Input
          id="craft-btn-width"
          type="number"
          value={props.width}
          onChange={(e) =>
            setProp((p: CraftButtonProps) => {
              p.width = Number(e.target.value);
            })
          }
        />
      </div>
    </div>
  );
}

CraftButton.craft = {
  displayName: "Button",
  props: {
    text: "Click Me",
    link: "#",
    bgColor: "#29BDD6",
    textColor: "#ffffff",
    fontSize: 16,
    paddingX: 32,
    paddingY: 16,
    borderRadius: 12,
    width: 200,
  } satisfies CraftButtonProps,
  related: {
    settings: CraftButtonSettings,
  },
};
