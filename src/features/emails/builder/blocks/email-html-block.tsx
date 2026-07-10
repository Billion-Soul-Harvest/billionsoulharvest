"use client";

import { useNode, type UserComponent } from "@craftjs/core";
import { craftRef } from "@/features/events/builder/craft-utils";
import { Label } from "@/components/ui/label";

interface HtmlBlockProps {
  html: string;
}

export const EmailHtmlBlock: UserComponent<HtmlBlockProps> = ({
  html = "",
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
        cursor: selected ? "default" : "grab",
        outline: selected ? "2px solid #2563eb" : "1px dashed transparent",
        outlineOffset: "2px",
        minHeight: "24px",
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

function HtmlBlockSettings() {
  const {
    actions: { setProp },
    html,
  } = useNode((node) => ({
    html: node.data.props.html as string,
  }));

  return (
    <div className="space-y-3">
      <div>
        <Label>HTML Content</Label>
        <textarea
          className="w-full mt-1 p-2 border rounded text-xs font-mono bg-white min-h-[200px] resize-y"
          value={html}
          onChange={(e) =>
            setProp((p: HtmlBlockProps) => {
              p.html = e.target.value;
            })
          }
        />
      </div>
    </div>
  );
}

EmailHtmlBlock.craft = {
  displayName: "HTML Block",
  props: {
    html: "",
  },
  related: {
    settings: HtmlBlockSettings,
  },
};
