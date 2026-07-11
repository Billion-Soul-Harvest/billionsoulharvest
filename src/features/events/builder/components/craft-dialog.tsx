"use client";

import { useNode } from "@craftjs/core";
import { craftRef } from "../craft-utils";
import { useCanvasWidth } from "../canvas-width-context";
import { responsiveSize } from "../responsive-utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CraftDialogProps {
  buttonText?: string;
  bgColor?: string;
  textColor?: string;
  fontSize?: number;
  paddingX?: number;
  paddingY?: number;
  borderRadius?: number;
  buttonWidth?: number;
  dialogWidth?: number;
  dialogBgColor?: string;
  contentType?: "youtube" | "image" | "video";
  contentUrl?: string;
}

export function CraftDialog({
  buttonText = "Watch Video",
  bgColor = "#29BDD6",
  textColor = "#ffffff",
  fontSize = 16,
  paddingX = 32,
  paddingY = 16,
  borderRadius = 12,
  buttonWidth = 220,
}: CraftDialogProps) {
  const {
    connectors: { connect, drag },
  } = useNode();

  const cw = useCanvasWidth();

  return (
    <div
      ref={craftRef(connect, drag)}
      style={{
        width: Math.min(buttonWidth, cw),
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
      {buttonText}
    </div>
  );
}

function CraftDialogSettings() {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as CraftDialogProps,
  }));

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="craft-dlg-text">Button Text</Label>
        <Input
          id="craft-dlg-text"
          value={props.buttonText ?? ""}
          onChange={(e) =>
            setProp((p: CraftDialogProps) => {
              p.buttonText = e.target.value;
            })
          }
        />
      </div>

      <div>
        <Label>Content Type</Label>
        <Select
          value={props.contentType ?? "youtube"}
          onValueChange={(v) =>
            setProp((p: CraftDialogProps) => {
              p.contentType = v as CraftDialogProps["contentType"];
            })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="youtube">YouTube Video</SelectItem>
            <SelectItem value="video">Video URL (MP4)</SelectItem>
            <SelectItem value="image">Image</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="craft-dlg-url">
          {props.contentType === "image" ? "Image URL" : props.contentType === "video" ? "Video URL (MP4)" : "YouTube URL"}
        </Label>
        <Input
          id="craft-dlg-url"
          value={props.contentUrl ?? ""}
          placeholder={
            props.contentType === "image"
              ? "https://example.com/image.jpg"
              : props.contentType === "video"
              ? "https://example.com/video.mp4"
              : "https://youtube.com/watch?v=..."
          }
          onChange={(e) =>
            setProp((p: CraftDialogProps) => {
              p.contentUrl = e.target.value;
            })
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="craft-dlg-bg">Button Color</Label>
          <Input
            id="craft-dlg-bg"
            type="color"
            value={props.bgColor ?? "#29BDD6"}
            onChange={(e) =>
              setProp((p: CraftDialogProps) => {
                p.bgColor = e.target.value;
              })
            }
          />
        </div>
        <div>
          <Label htmlFor="craft-dlg-color">Text Color</Label>
          <Input
            id="craft-dlg-color"
            type="color"
            value={props.textColor ?? "#ffffff"}
            onChange={(e) =>
              setProp((p: CraftDialogProps) => {
                p.textColor = e.target.value;
              })
            }
          />
        </div>
      </div>

      <div>
        <Label htmlFor="craft-dlg-fontsize">Font Size</Label>
        <Input
          id="craft-dlg-fontsize"
          type="number"
          value={props.fontSize ?? 16}
          onChange={(e) =>
            setProp((p: CraftDialogProps) => {
              p.fontSize = Number(e.target.value);
            })
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="craft-dlg-px">Padding X</Label>
          <Input
            id="craft-dlg-px"
            type="number"
            value={props.paddingX ?? 32}
            onChange={(e) =>
              setProp((p: CraftDialogProps) => {
                p.paddingX = Number(e.target.value);
              })
            }
          />
        </div>
        <div>
          <Label htmlFor="craft-dlg-py">Padding Y</Label>
          <Input
            id="craft-dlg-py"
            type="number"
            value={props.paddingY ?? 16}
            onChange={(e) =>
              setProp((p: CraftDialogProps) => {
                p.paddingY = Number(e.target.value);
              })
            }
          />
        </div>
      </div>

      <div>
        <Label htmlFor="craft-dlg-radius">Border Radius</Label>
        <Input
          id="craft-dlg-radius"
          type="number"
          value={props.borderRadius ?? 12}
          onChange={(e) =>
            setProp((p: CraftDialogProps) => {
              p.borderRadius = Number(e.target.value);
            })
          }
        />
      </div>

      <div>
        <Label htmlFor="craft-dlg-btn-width">Button Width</Label>
        <Input
          id="craft-dlg-btn-width"
          type="number"
          value={props.buttonWidth ?? 220}
          onChange={(e) =>
            setProp((p: CraftDialogProps) => {
              p.buttonWidth = Number(e.target.value);
            })
          }
        />
      </div>

      <div>
        <Label htmlFor="craft-dlg-width">Dialog Width</Label>
        <Input
          id="craft-dlg-width"
          type="number"
          value={props.dialogWidth ?? 700}
          onChange={(e) =>
            setProp((p: CraftDialogProps) => {
              p.dialogWidth = Number(e.target.value);
            })
          }
        />
      </div>

      <div>
        <Label htmlFor="craft-dlg-dialog-bg">Dialog Background</Label>
        <Input
          id="craft-dlg-dialog-bg"
          type="color"
          value={props.dialogBgColor ?? "#0f2744"}
          onChange={(e) =>
            setProp((p: CraftDialogProps) => {
              p.dialogBgColor = e.target.value;
            })
          }
        />
      </div>
    </div>
  );
}

CraftDialog.craft = {
  displayName: "Dialog",
  props: {
    buttonText: "Watch Video",
    bgColor: "#29BDD6",
    textColor: "#ffffff",
    fontSize: 16,
    paddingX: 32,
    paddingY: 16,
    borderRadius: 12,
    buttonWidth: 220,
    dialogWidth: 700,
    dialogBgColor: "#0f2744",
    contentType: "youtube",
    contentUrl: "",
  } satisfies CraftDialogProps,
  related: {
    settings: CraftDialogSettings,
  },
};
