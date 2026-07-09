"use client";

import { useEditor, Element } from "@craftjs/core";
import { EmailText } from "./blocks/email-text";
import { EmailImage } from "./blocks/email-image";
import { EmailButton } from "./blocks/email-button";
import { EmailDivider } from "./blocks/email-divider";
import { EmailSpacer } from "./blocks/email-spacer";
import { EmailColumns, EmailColumnCell } from "./blocks/email-columns";
import {
  Type,
  Image,
  MousePointerClick,
  Minus,
  ArrowUpDown,
  Columns2,
} from "lucide-react";

const CONTENT_BLOCKS = [
  {
    name: "Text",
    icon: <Type className="w-5 h-5" />,
    element: <EmailText />,
  },
  {
    name: "Image",
    icon: <Image className="w-5 h-5" />,
    element: <EmailImage />,
  },
  {
    name: "Button",
    icon: <MousePointerClick className="w-5 h-5" />,
    element: <EmailButton />,
  },
];

const LAYOUT_BLOCKS = [
  {
    name: "Columns",
    icon: <Columns2 className="w-5 h-5" />,
    element: (
      <Element is={EmailColumns} canvas ratio="50-50">
        <Element is={EmailColumnCell} canvas widthPercent="50%" />
        <Element is={EmailColumnCell} canvas widthPercent="50%" />
      </Element>
    ),
  },
  {
    name: "Divider",
    icon: <Minus className="w-5 h-5" />,
    element: <EmailDivider />,
  },
  {
    name: "Spacer",
    icon: <ArrowUpDown className="w-5 h-5" />,
    element: <EmailSpacer />,
  },
];

function DraggableItem({
  name,
  icon,
  element,
}: {
  name: string;
  icon: React.ReactNode;
  element: React.ReactElement;
}) {
  const { connectors } = useEditor();

  return (
    <div
      ref={(ref: HTMLDivElement | null) => {
        if (ref) {
          connectors.create(ref, element);
        }
      }}
      className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-gray-200 cursor-grab hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
    >
      <span className="text-gray-500">{icon}</span>
      <span className="text-[11px] text-gray-600 font-medium">{name}</span>
    </div>
  );
}

export function InsertPanel() {
  return (
    <div className="p-3 space-y-4">
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Content
        </p>
        <div className="grid grid-cols-2 gap-2">
          {CONTENT_BLOCKS.map((block) => (
            <DraggableItem key={block.name} {...block} />
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Layout
        </p>
        <div className="grid grid-cols-2 gap-2">
          {LAYOUT_BLOCKS.map((block) => (
            <DraggableItem key={block.name} {...block} />
          ))}
        </div>
      </div>
    </div>
  );
}
