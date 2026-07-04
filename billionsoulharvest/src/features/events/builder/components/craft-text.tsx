"use client";

import { useNode, UserComponent } from "@craftjs/core";
import { useEditor as useTiptapEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import { useEffect, useRef, useCallback } from "react";
import { craftRef } from "../craft-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TextProps {
  text?: string;
  fontSize?: number;
  textAlign?: "left" | "center" | "right";
  color?: string;
  width?: number;
  height?: number;
}

export const CraftText: UserComponent<TextProps> = ({
  text = "<p>Edit me</p>",
  fontSize = 16,
  textAlign = "left",
  color = "#ffffff",
  width = 400,
  height = 40,
}) => {
  const {
    connectors: { connect, drag },
    selected,
    actions: { setProp },
  } = useNode((state) => ({
    selected: state.events.selected,
  }));

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleUpdate = useCallback(
    (html: string) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        setProp((props: TextProps) => {
          props.text = html;
        }, 500);
      }, 500);
    },
    [setProp],
  );

  const editor = useTiptapEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Underline,
    ],
    content: text,
    onUpdate: ({ editor: ed }) => {
      handleUpdate(ed.getHTML());
    },
    editable: selected,
  });

  useEffect(() => {
    if (editor && editor.isEditable !== selected) {
      editor.setEditable(selected);
    }
  }, [selected, editor]);

  useEffect(() => {
    if (editor && !selected) {
      const currentHTML = editor.getHTML();
      if (currentHTML !== text) {
        editor.commands.setContent(text, { emitUpdate: false });
      }
    }
  }, [text, selected, editor]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={craftRef(connect, drag)}
      style={{
        fontSize: `${fontSize}px`,
        textAlign,
        color,
        width: `${width}px`,
        maxWidth: "100%",
        minHeight: `${height}px`,
        cursor: "move",
        outline: selected ? "2px solid #D4A843" : "none",
        padding: "4px",
      }}
    >
      {selected && editor ? (
        <EditorContent editor={editor} />
      ) : (
        <div dangerouslySetInnerHTML={{ __html: text }} />
      )}
    </div>
  );
};

function TextSettings() {
  const {
    actions: { setProp },
    fontSize,
    textAlign,
    color,
    width,
    height,
  } = useNode((node) => ({
    fontSize: node.data.props.fontSize as number,
    textAlign: node.data.props.textAlign as "left" | "center" | "right",
    color: node.data.props.color as string,
    width: node.data.props.width as number,
    height: node.data.props.height as number,
  }));

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="fontSize">Font Size</Label>
        <Input
          id="fontSize"
          type="number"
          value={fontSize}
          min={8}
          max={120}
          onChange={(e) =>
            setProp((props: TextProps) => {
              props.fontSize = Number(e.target.value);
            })
          }
        />
      </div>

      <div>
        <Label htmlFor="color">Color</Label>
        <Input
          id="color"
          type="color"
          value={color}
          onChange={(e) =>
            setProp((props: TextProps) => {
              props.color = e.target.value;
            })
          }
        />
      </div>

      <div>
        <Label>Text Alignment</Label>
        <div className="flex gap-1 mt-1">
          {(["left", "center", "right"] as const).map((align) => (
            <Button
              key={align}
              variant={textAlign === align ? "default" : "outline"}
              size="sm"
              onClick={() =>
                setProp((props: TextProps) => {
                  props.textAlign = align;
                })
              }
            >
              {align.charAt(0).toUpperCase() + align.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="width">Width</Label>
        <Input
          id="width"
          type="number"
          value={width}
          min={50}
          onChange={(e) =>
            setProp((props: TextProps) => {
              props.width = Number(e.target.value);
            })
          }
        />
      </div>

      <div>
        <Label htmlFor="height">Height</Label>
        <Input
          id="height"
          type="number"
          value={height}
          min={20}
          onChange={(e) =>
            setProp((props: TextProps) => {
              props.height = Number(e.target.value);
            })
          }
        />
      </div>
    </div>
  );
}

CraftText.craft = {
  displayName: "Text",
  props: {
    text: "<p>Edit me</p>",
    fontSize: 16,
    textAlign: "left",
    color: "#ffffff",
    width: 400,
    height: 40,
  },
  related: {
    settings: TextSettings,
  },
};
