"use client";

import { useNode, type UserComponent } from "@craftjs/core";
import { craftRef } from "@/features/events/builder/craft-utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface ImageProps {
  src?: string;
  alt?: string;
  width?: number;
  alignment?: "left" | "center" | "right";
  href?: string;
}

export const EmailImage: UserComponent<ImageProps> = ({
  src = "",
  alt = "",
  width = 100,
  alignment = "center",
  href = "",
}) => {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((state) => ({
    selected: state.events.selected,
  }));

  const imgEl = (
    <img
      src={src || "https://placehold.co/600x300/e2e8f0/64748b?text=Add+Image"}
      alt={alt}
      style={{
        width: `${width}%`,
        maxWidth: "100%",
        height: "auto",
        display: "block",
      }}
    />
  );

  return (
    <div
      ref={craftRef(connect, drag)}
      style={{
        textAlign: alignment,
        cursor: "grab",
        outline: selected ? "2px solid #2563eb" : "1px dashed transparent",
        outlineOffset: "2px",
        padding: "4px 0",
      }}
    >
      {href ? (
        <a href={href} style={{ display: "inline-block" }}>
          {imgEl}
        </a>
      ) : (
        imgEl
      )}
    </div>
  );
};

function ImageSettings() {
  const {
    actions: { setProp },
    src,
    alt,
    width,
    alignment,
    href,
  } = useNode((node) => ({
    src: node.data.props.src as string,
    alt: node.data.props.alt as string,
    width: node.data.props.width as number,
    alignment: node.data.props.alignment as string,
    href: node.data.props.href as string,
  }));

  return (
    <div className="space-y-3">
      <div>
        <Label>Image URL</Label>
        <Input
          value={src}
          onChange={(e) => setProp((p: ImageProps) => { p.src = e.target.value; })}
          placeholder="https://example.com/image.jpg"
        />
      </div>
      <div>
        <Label>Alt Text</Label>
        <Input
          value={alt}
          onChange={(e) => setProp((p: ImageProps) => { p.alt = e.target.value; })}
          placeholder="Image description"
        />
      </div>
      <div>
        <Label>Width (%)</Label>
        <Input
          type="number"
          min={10}
          max={100}
          value={width}
          onChange={(e) => setProp((p: ImageProps) => { p.width = Number(e.target.value); })}
        />
      </div>
      <div>
        <Label>Link URL (optional)</Label>
        <Input
          value={href}
          onChange={(e) => setProp((p: ImageProps) => { p.href = e.target.value; })}
          placeholder="https://example.com"
        />
      </div>
      <div>
        <Label>Alignment</Label>
        <div className="flex gap-1">
          {(["left", "center", "right"] as const).map((a) => (
            <Button
              key={a}
              size="sm"
              variant={alignment === a ? "default" : "outline"}
              onClick={() => setProp((p: ImageProps) => { p.alignment = a; })}
            >
              {a.charAt(0).toUpperCase() + a.slice(1)}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

EmailImage.craft = {
  displayName: "Image",
  props: {
    src: "",
    alt: "",
    width: 100,
    alignment: "center",
    href: "",
  },
  related: {
    settings: ImageSettings,
  },
};
