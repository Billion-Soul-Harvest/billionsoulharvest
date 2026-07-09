"use client";

import { useNode, type UserComponent } from "@craftjs/core";
import { craftRef } from "@/features/events/builder/craft-utils";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TiptapLink from "@tiptap/extension-link";
import { useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface TextProps {
  text?: string;
  fontSize?: number;
  color?: string;
  textAlign?: "left" | "center" | "right";
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
}

export const EmailText: UserComponent<TextProps> = ({
  text = "<p>Edit your text here</p>",
  fontSize = 16,
  color = "#44474c",
  textAlign = "left",
  paddingTop = 8,
  paddingBottom = 8,
  paddingLeft = 0,
  paddingRight = 0,
}) => {
  const {
    connectors: { connect, drag },
    selected,
    actions: { setProp },
  } = useNode((state) => ({
    selected: state.events.selected,
  }));

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Underline,
      TiptapLink.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
    ],
    content: text,
    onUpdate: ({ editor: e }) => {
      try {
        setProp((props: TextProps) => {
          props.text = e.getHTML();
        });
      } catch {
        // Node may have been removed during deserialization
      }
    },
    editable: selected,
  });

  useEffect(() => {
    if (editor) {
      try {
        editor.setEditable(!!selected);
      } catch {
        // Node may not exist during deserialization
      }
    }
  }, [selected, editor]);

  useEffect(() => {
    if (editor && !selected && text !== editor.getHTML()) {
      editor.commands.setContent(text, { emitUpdate: false });
    }
  }, [text, editor, selected]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href;
    const url = window.prompt("URL", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  return (
    <div
      ref={craftRef(connect, drag)}
      style={{
        fontSize: `${fontSize}px`,
        color,
        textAlign,
        paddingTop: `${paddingTop}px`,
        paddingBottom: `${paddingBottom}px`,
        paddingLeft: `${paddingLeft}px`,
        paddingRight: `${paddingRight}px`,
        fontFamily: "'Work Sans', sans-serif",
        lineHeight: "1.625",
        cursor: selected ? "text" : "grab",
        outline: selected ? "2px solid #2563eb" : "1px dashed transparent",
        outlineOffset: "2px",
        minHeight: "24px",
      }}
    >
      {selected && editor && (
        <div className="flex flex-wrap gap-0.5 mb-1 p-1 bg-white border rounded shadow-sm">
          <MiniBtn active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
            <strong>B</strong>
          </MiniBtn>
          <MiniBtn active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
            <em>I</em>
          </MiniBtn>
          <MiniBtn active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
            <u>U</u>
          </MiniBtn>
          <MiniBtn active={editor.isActive("link")} onClick={setLink}>
            Link
          </MiniBtn>
          <MiniBtn
            active={editor.isActive("heading", { level: 2 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            H2
          </MiniBtn>
          <MiniBtn
            active={editor.isActive("heading", { level: 3 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          >
            H3
          </MiniBtn>
        </div>
      )}
      <EditorContent
        editor={editor}
        className="[&_.tiptap]:outline-none [&_.tiptap]:min-h-[20px] [&_.tiptap_p]:m-0 [&_.tiptap_h2]:m-0 [&_.tiptap_h3]:m-0"
      />
    </div>
  );
};

function MiniBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-6 px-1.5 text-xs rounded ${active ? "bg-blue-100 text-blue-800" : "text-gray-600 hover:bg-gray-100"}`}
    >
      {children}
    </button>
  );
}

function TextSettings() {
  const {
    actions: { setProp },
    fontSize,
    color,
    textAlign,
    paddingTop,
    paddingBottom,
  } = useNode((node) => ({
    fontSize: node.data.props.fontSize as number,
    color: node.data.props.color as string,
    textAlign: node.data.props.textAlign as string,
    paddingTop: node.data.props.paddingTop as number,
    paddingBottom: node.data.props.paddingBottom as number,
  }));

  return (
    <div className="space-y-3">
      <div>
        <Label>Font Size</Label>
        <Input
          type="number"
          value={fontSize}
          onChange={(e) => setProp((p: TextProps) => { p.fontSize = Number(e.target.value); })}
        />
      </div>
      <div>
        <Label>Color</Label>
        <Input
          type="color"
          value={color}
          onChange={(e) => setProp((p: TextProps) => { p.color = e.target.value; })}
        />
      </div>
      <div>
        <Label>Alignment</Label>
        <div className="flex gap-1">
          {(["left", "center", "right"] as const).map((a) => (
            <Button
              key={a}
              size="sm"
              variant={textAlign === a ? "default" : "outline"}
              onClick={() => setProp((p: TextProps) => { p.textAlign = a; })}
            >
              {a.charAt(0).toUpperCase() + a.slice(1)}
            </Button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>Padding Top</Label>
          <Input
            type="number"
            value={paddingTop}
            onChange={(e) => setProp((p: TextProps) => { p.paddingTop = Number(e.target.value); })}
          />
        </div>
        <div>
          <Label>Padding Bottom</Label>
          <Input
            type="number"
            value={paddingBottom}
            onChange={(e) => setProp((p: TextProps) => { p.paddingBottom = Number(e.target.value); })}
          />
        </div>
      </div>
    </div>
  );
}

EmailText.craft = {
  displayName: "Text",
  props: {
    text: "<p>Edit your text here</p>",
    fontSize: 16,
    color: "#44474c",
    textAlign: "left",
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 0,
    paddingRight: 0,
  },
  related: {
    settings: TextSettings,
  },
};
