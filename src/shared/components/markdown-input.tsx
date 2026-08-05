"use client";

import { useRef, useState } from "react";
import { RichText } from "./rich-text";

interface MarkdownInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function MarkdownInput({ value, onChange, placeholder, className }: MarkdownInputProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkPopover, setShowLinkPopover] = useState(false);
  const [savedSelection, setSavedSelection] = useState<{ start: number; end: number } | null>(null);

  function wrapSelection(before: string, after: string) {
    const ta = ref.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const text = value;
    const selected = text.slice(start, end) || "text";
    const newText = text.slice(0, start) + before + selected + after + text.slice(end);
    onChange(newText);
    requestAnimationFrame(() => {
      ta.focus();
      const cursorPos = start + before.length + selected.length + after.length;
      ta.setSelectionRange(cursorPos, cursorPos);
    });
  }

  function handleBold() {
    wrapSelection("**", "**");
  }

  function handleItalic() {
    wrapSelection("*", "*");
  }

  function handleLinkClick() {
    const ta = ref.current;
    if (!ta) return;
    setSavedSelection({ start: ta.selectionStart, end: ta.selectionEnd });
    setLinkUrl("");
    setShowLinkPopover(true);
  }

  function insertLink() {
    const ta = ref.current;
    if (!ta || !savedSelection) return;
    const { start, end } = savedSelection;
    const text = value;
    const selected = text.slice(start, end) || "link text";
    const url = linkUrl.trim() || "https://";
    const newText = text.slice(0, start) + `[${selected}](${url})` + text.slice(end);
    onChange(newText);
    setShowLinkPopover(false);
    setLinkUrl("");
    setSavedSelection(null);
    requestAnimationFrame(() => ta.focus());
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-1 border border-b-0 rounded-t-md px-1.5 py-1 bg-gray-50">
        <button
          type="button"
          onClick={handleBold}
          className="px-1.5 py-0.5 rounded text-xs font-bold text-gray-600 hover:bg-gray-200 hover:text-gray-900"
          title="Bold"
        >
          B
        </button>
        <button
          type="button"
          onClick={handleItalic}
          className="px-1.5 py-0.5 rounded text-xs italic text-gray-600 hover:bg-gray-200 hover:text-gray-900"
          title="Italic"
        >
          I
        </button>
        <button
          type="button"
          onClick={handleLinkClick}
          className="px-1.5 py-0.5 rounded text-xs text-gray-600 hover:bg-gray-200 hover:text-gray-900"
          title="Insert link"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </button>
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className={`px-1.5 py-0.5 rounded text-[10px] ${showPreview ? "bg-gray-200 text-gray-900" : "text-gray-500 hover:bg-gray-200 hover:text-gray-900"}`}
        >
          {showPreview ? "Edit" : "Preview"}
        </button>
      </div>

      {showPreview ? (
        <div className="border rounded-b-md px-3 py-2 min-h-[60px] text-sm text-gray-700 bg-white">
          {value ? (
            <RichText className="text-sm text-gray-700">{value}</RichText>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </div>
      ) : (
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`border rounded-b-md rounded-t-none px-3 py-2 min-h-[60px] text-sm w-full resize-y focus:outline-none focus:ring-1 focus:ring-blue-300 ${className ?? ""}`}
        />
      )}

      {showLinkPopover && (
        <div className="absolute z-10 top-8 left-0 bg-white border rounded-lg shadow-lg p-2 flex items-center gap-2">
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://example.com"
            className="text-xs border rounded px-2 py-1 w-52 focus:outline-none focus:ring-1 focus:ring-blue-300"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); insertLink(); }
              if (e.key === "Escape") setShowLinkPopover(false);
            }}
          />
          <button
            type="button"
            onClick={insertLink}
            className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
          >
            Insert
          </button>
          <button
            type="button"
            onClick={() => setShowLinkPopover(false)}
            className="text-xs text-gray-400 hover:text-gray-600 px-1"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
