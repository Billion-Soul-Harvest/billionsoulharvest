"use client";

import { useNode, UserComponent } from "@craftjs/core";
import { craftRef } from "../craft-utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FooterProps {
  backgroundColor?: string;
  padding?: number;
  width?: number;
  minHeight?: number;
  borderTopColor?: string;
  borderTopWidth?: number;
  children?: React.ReactNode;
}

export const CraftFooter: UserComponent<FooterProps> = ({
  backgroundColor = "#0a1e38",
  padding = 48,
  width = 1200,
  minHeight = 100,
  borderTopColor = "rgba(255,255,255,0.1)",
  borderTopWidth = 1,
  children,
}) => {
  const {
    connectors: { connect },
    selected,
  } = useNode((state) => ({
    selected: state.events.selected,
  }));

  return (
    <footer
      ref={craftRef(connect)}
      style={{
        backgroundColor,
        padding: `${padding}px`,
        width: `${width}px`,
        maxWidth: "100%",
        minHeight: `${minHeight}px`,
        borderTop: `${borderTopWidth}px solid ${borderTopColor}`,
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        outline: selected ? "2px solid #D4A843" : "none",
      }}
    >
      {children}
    </footer>
  );
};

function FooterSettings() {
  const {
    actions: { setProp },
    backgroundColor,
    padding,
    minHeight,
    borderTopColor,
    borderTopWidth,
  } = useNode((node) => ({
    backgroundColor: node.data.props.backgroundColor as string,
    padding: node.data.props.padding as number,
    minHeight: node.data.props.minHeight as number,
    borderTopColor: node.data.props.borderTopColor as string,
    borderTopWidth: node.data.props.borderTopWidth as number,
  }));

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground italic">
        This footer appears on all pages. Edit its children to change content.
      </p>

      <div>
        <Label htmlFor="footerBgColor">Background Color</Label>
        <div className="flex gap-2">
          <Input
            id="footerBgColor"
            type="color"
            value={backgroundColor}
            className="w-12 shrink-0"
            onChange={(e) =>
              setProp((props: FooterProps) => {
                props.backgroundColor = e.target.value;
              })
            }
          />
          <Input
            type="text"
            value={backgroundColor}
            onChange={(e) =>
              setProp((props: FooterProps) => {
                props.backgroundColor = e.target.value;
              })
            }
          />
        </div>
      </div>

      <div>
        <Label htmlFor="footerPadding">Padding</Label>
        <Input
          id="footerPadding"
          type="number"
          value={padding}
          min={0}
          onChange={(e) =>
            setProp((props: FooterProps) => {
              props.padding = Number(e.target.value);
            })
          }
        />
      </div>

      <div>
        <Label htmlFor="footerMinHeight">Min Height</Label>
        <Input
          id="footerMinHeight"
          type="number"
          value={minHeight}
          min={0}
          onChange={(e) =>
            setProp((props: FooterProps) => {
              props.minHeight = Number(e.target.value);
            })
          }
        />
      </div>

      <div>
        <Label htmlFor="footerBorderTopColor">Border Top Color</Label>
        <Input
          id="footerBorderTopColor"
          type="text"
          value={borderTopColor}
          onChange={(e) =>
            setProp((props: FooterProps) => {
              props.borderTopColor = e.target.value;
            })
          }
        />
      </div>

      <div>
        <Label htmlFor="footerBorderTopWidth">Border Top Width</Label>
        <Input
          id="footerBorderTopWidth"
          type="number"
          value={borderTopWidth}
          min={0}
          onChange={(e) =>
            setProp((props: FooterProps) => {
              props.borderTopWidth = Number(e.target.value);
            })
          }
        />
      </div>
    </div>
  );
}

CraftFooter.craft = {
  displayName: "Footer",
  props: {
    backgroundColor: "#0a1e38",
    padding: 48,
    width: 1200,
    minHeight: 100,
    borderTopColor: "rgba(255,255,255,0.1)",
    borderTopWidth: 1,
  },
  related: {
    settings: FooterSettings,
  },
  rules: {
    canDrag: () => false,
    canMoveIn: () => true,
    canMoveOut: () => false,
  },
};
