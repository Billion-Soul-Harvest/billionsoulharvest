import React from "react";

/**
 * Renders a simple markdown-like string with support for:
 * - Links: [text](url)
 * - Bold: **text**
 * - Italic: *text*
 * - Newlines: \n → <br>
 */
export function RichText({
  children,
  className,
  style,
}: {
  children: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const html = toHtml(children);
  return (
    <span
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function toHtml(text: string): string {
  let result = escapeHtml(text);

  // Links: [text](url)
  result = result.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline hover:text-blue-800">$1</a>'
  );

  // Bold: **text**
  result = result.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  // Italic: *text*
  result = result.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Newlines
  result = result.replace(/\n/g, "<br>");

  return result;
}
