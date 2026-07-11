"use client";

import { useState, useCallback } from "react";

interface Props {
  buttonText: string;
  bgColor: string;
  textColor: string;
  fontSize: number;
  paddingX: number;
  paddingY: number;
  borderRadius: number;
  buttonWidth: number;
  dialogWidth: number;
  dialogBgColor: string;
  contentType: "youtube" | "image" | "video";
  contentUrl: string;
}

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/);
  return match ? match[1] : null;
}

export function RenderDialog({
  buttonText,
  bgColor,
  textColor,
  fontSize,
  paddingX,
  paddingY,
  borderRadius,
  buttonWidth,
  dialogWidth,
  dialogBgColor,
  contentType,
  contentUrl,
}: Props) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: "inline-block",
          width: buttonWidth,
          maxWidth: "100%",
          backgroundColor: bgColor,
          color: textColor,
          fontFamily: "var(--font-jakarta), ui-sans-serif, system-ui, sans-serif",
          fontSize: `clamp(${Math.max(12, Math.round(fontSize * 0.5))}px, ${(fontSize / 12).toFixed(1)}vw, ${fontSize}px)`,
          paddingLeft: `clamp(8px, 2vw, ${paddingX}px)`,
          paddingRight: `clamp(8px, 2vw, ${paddingX}px)`,
          paddingTop: `clamp(6px, 1.5vw, ${paddingY}px)`,
          paddingBottom: `clamp(6px, 1.5vw, ${paddingY}px)`,
          borderRadius,
          textAlign: "center",
          fontWeight: 500,
          cursor: "pointer",
          border: "none",
        }}
      >
        {buttonText}
      </button>

      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.7)",
          }}
          onClick={close}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: dialogWidth,
              maxWidth: "95vw",
              maxHeight: "90vh",
              overflow: "auto",
              backgroundColor: dialogBgColor,
              borderRadius: 12,
              padding: contentType === "image" ? 0 : 24,
              position: "relative",
            }}
          >
            <button
              onClick={close}
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                background: "rgba(0,0,0,0.5)",
                border: "none",
                borderRadius: "50%",
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#ffffff",
                fontSize: 18,
                zIndex: 1,
              }}
              aria-label="Close dialog"
            >
              ×
            </button>

            <DialogContent contentType={contentType} contentUrl={contentUrl} dialogWidth={dialogWidth} />
          </div>
        </div>
      )}
    </>
  );
}

function DialogContent({
  contentType,
  contentUrl,
  dialogWidth,
}: {
  contentType: string;
  contentUrl: string;
  dialogWidth: number;
}) {
  if (!contentUrl) {
    return <p style={{ color: "#9ca3af", textAlign: "center", padding: 40 }}>No content configured</p>;
  }

  if (contentType === "youtube") {
    const videoId = getYouTubeId(contentUrl);
    if (!videoId) return <p style={{ color: "#9ca3af", textAlign: "center", padding: 40 }}>Invalid YouTube URL</p>;
    return (
      <div style={{ width: "100%", aspectRatio: "16 / 9" }}>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          style={{ width: "100%", height: "100%", border: "none", borderRadius: 8 }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  if (contentType === "video") {
    return (
      <video
        src={contentUrl}
        controls
        autoPlay
        style={{ width: "100%", borderRadius: 8 }}
      />
    );
  }

  if (contentType === "image") {
    return (
      <img
        src={contentUrl}
        alt=""
        style={{ width: "100%", display: "block", borderRadius: 12 }}
      />
    );
  }

  return null;
}
