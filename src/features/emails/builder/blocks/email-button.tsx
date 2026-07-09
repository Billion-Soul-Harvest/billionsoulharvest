"use client";

import { useNode, type UserComponent } from "@craftjs/core";
import { craftRef } from "@/features/events/builder/craft-utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ButtonProps {
  text?: string;
  href?: string;
  backgroundColor?: string;
  textColor?: string;
  borderRadius?: number;
  paddingY?: number;
  paddingX?: number;
  fontSize?: number;
}

export const EmailButton: UserComponent<ButtonProps> = ({
  text = "Click Here",
  href = "#",
  backgroundColor = "#006a62",
  textColor = "#ffffff",
  borderRadius = 8,
  paddingY = 12,
  paddingX = 48,
  fontSize = 16,
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
        textAlign: "center",
        padding: "12px 0",
        cursor: "grab",
        outline: selected ? "2px solid #2563eb" : "1px dashed transparent",
        outlineOffset: "2px",
      }}
    >
      <a
        href={href}
        style={{
          backgroundColor,
          color: textColor,
          padding: `${paddingY}px ${paddingX}px`,
          borderRadius: `${borderRadius}px`,
          fontFamily: "Manrope, sans-serif",
          fontSize: `${fontSize}px`,
          fontWeight: 600,
          textDecoration: "none",
          display: "inline-block",
          letterSpacing: "0.05em",
          textTransform: "uppercase",
        }}
      >
        {text}
      </a>
    </div>
  );
};

function ButtonSettings() {
  const {
    actions: { setProp },
    text,
    href,
    backgroundColor,
    textColor,
    borderRadius,
    paddingY,
    paddingX,
    fontSize,
  } = useNode((node) => ({
    text: node.data.props.text as string,
    href: node.data.props.href as string,
    backgroundColor: node.data.props.backgroundColor as string,
    textColor: node.data.props.textColor as string,
    borderRadius: node.data.props.borderRadius as number,
    paddingY: node.data.props.paddingY as number,
    paddingX: node.data.props.paddingX as number,
    fontSize: node.data.props.fontSize as number,
  }));

  return (
    <div className="space-y-3">
      <div>
        <Label>Button Text</Label>
        <Input
          value={text}
          onChange={(e) => setProp((p: ButtonProps) => { p.text = e.target.value; })}
        />
      </div>
      <div>
        <Label>Link URL</Label>
        <Input
          value={href}
          onChange={(e) => setProp((p: ButtonProps) => { p.href = e.target.value; })}
          placeholder="https://example.com"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>Background</Label>
          <Input
            type="color"
            value={backgroundColor}
            onChange={(e) => setProp((p: ButtonProps) => { p.backgroundColor = e.target.value; })}
          />
        </div>
        <div>
          <Label>Text Color</Label>
          <Input
            type="color"
            value={textColor}
            onChange={(e) => setProp((p: ButtonProps) => { p.textColor = e.target.value; })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>Border Radius</Label>
          <Input
            type="number"
            value={borderRadius}
            onChange={(e) => setProp((p: ButtonProps) => { p.borderRadius = Number(e.target.value); })}
          />
        </div>
        <div>
          <Label>Font Size</Label>
          <Input
            type="number"
            value={fontSize}
            onChange={(e) => setProp((p: ButtonProps) => { p.fontSize = Number(e.target.value); })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>Padding Y</Label>
          <Input
            type="number"
            value={paddingY}
            onChange={(e) => setProp((p: ButtonProps) => { p.paddingY = Number(e.target.value); })}
          />
        </div>
        <div>
          <Label>Padding X</Label>
          <Input
            type="number"
            value={paddingX}
            onChange={(e) => setProp((p: ButtonProps) => { p.paddingX = Number(e.target.value); })}
          />
        </div>
      </div>
    </div>
  );
}

EmailButton.craft = {
  displayName: "Button",
  props: {
    text: "Click Here",
    href: "#",
    backgroundColor: "#006a62",
    textColor: "#ffffff",
    borderRadius: 8,
    paddingY: 12,
    paddingX: 48,
    fontSize: 16,
  },
  related: {
    settings: ButtonSettings,
  },
};
