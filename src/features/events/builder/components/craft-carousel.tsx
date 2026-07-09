"use client";

import { useState } from "react";
import { useNode } from "@craftjs/core";
import { craftRef } from "../craft-utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/shared/components/image-upload";

interface CraftCarouselProps {
  images?: string[];
  width?: number;
  height?: number;
  borderRadius?: number;
  autoPlay?: boolean;
  interval?: number;
}

export function CraftCarousel({
  images = [],
  width = 600,
  height = 400,
  borderRadius = 8,
}: CraftCarouselProps) {
  const {
    connectors: { connect, drag },
  } = useNode();
  const [current, setCurrent] = useState(0);

  const hasImages = images.length > 0;
  const safeIndex = hasImages ? current % images.length : 0;

  return (
    <div
      ref={craftRef(connect, drag)}
      style={{
        width,
        maxWidth: "100%",
        aspectRatio: `${width} / ${height}`,
        cursor: "grab",
        position: "relative",
        borderRadius,
        overflow: "hidden",
      }}
    >
      {hasImages ? (
        <>
          <img
            src={images[safeIndex]}
            alt={`Slide ${safeIndex + 1}`}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
          {images.length > 1 && (
            <>
              {/* Prev */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrent((c) => (c - 1 + images.length) % images.length);
                }}
                style={{
                  position: "absolute",
                  left: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  backgroundColor: "rgba(0,0,0,0.5)",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                }}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              {/* Next */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrent((c) => (c + 1) % images.length);
                }}
                style={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  backgroundColor: "rgba(0,0,0,0.5)",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                }}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              {/* Dots */}
              <div
                style={{
                  position: "absolute",
                  bottom: 12,
                  left: "50%",
                  transform: "translateX(-50%)",
                  display: "flex",
                  gap: 6,
                }}
              >
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => { e.stopPropagation(); setCurrent(idx); }}
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: idx === safeIndex ? "#ffffff" : "rgba(255,255,255,0.5)",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </>
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            border: "2px dashed #d1d5db",
            backgroundColor: "#f9fafb",
            borderRadius,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <svg width="32" height="32" fill="none" stroke="#9ca3af" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span style={{ fontSize: 13, color: "#9ca3af" }}>Add images to create a carousel</span>
        </div>
      )}
    </div>
  );
}

function CraftCarouselSettings() {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as CraftCarouselProps,
  }));

  const images = props.images ?? [];

  const handleAddImage = (url: string) => {
    if (!url) return;
    setProp((p: CraftCarouselProps) => {
      p.images = [...(p.images ?? []), url];
    });
  };

  const handleRemoveImage = (idx: number) => {
    setProp((p: CraftCarouselProps) => {
      p.images = (p.images ?? []).filter((_, i) => i !== idx);
    });
  };

  return (
    <div className="space-y-3">
      <div>
        <Label>Images ({images.length})</Label>
        <div className="space-y-2 mt-1">
          {images.map((img, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-gray-50 rounded-md p-1.5">
              <img
                src={img}
                alt={`Slide ${idx + 1}`}
                className="w-12 h-12 rounded object-cover shrink-0"
              />
              <span className="text-[10px] text-gray-500 truncate flex-1">
                Slide {idx + 1}
              </span>
              <button
                onClick={() => handleRemoveImage(idx)}
                className="text-gray-400 hover:text-red-500 shrink-0 p-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
        <div className="mt-2">
          <ImageUpload
            value=""
            onChange={handleAddImage}
            folder="builder"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>Width</Label>
          <Input
            type="number"
            value={props.width}
            min={200}
            onChange={(e) =>
              setProp((p: CraftCarouselProps) => { p.width = Number(e.target.value); })
            }
          />
        </div>
        <div>
          <Label>Height</Label>
          <Input
            type="number"
            value={props.height}
            min={150}
            onChange={(e) =>
              setProp((p: CraftCarouselProps) => { p.height = Number(e.target.value); })
            }
          />
        </div>
      </div>
      <div>
        <Label>Border Radius</Label>
        <Input
          type="number"
          value={props.borderRadius}
          min={0}
          onChange={(e) =>
            setProp((p: CraftCarouselProps) => { p.borderRadius = Number(e.target.value); })
          }
        />
      </div>
    </div>
  );
}

CraftCarousel.craft = {
  displayName: "Image Carousel",
  props: {
    images: [],
    width: 600,
    height: 400,
    borderRadius: 8,
    autoPlay: false,
    interval: 5000,
  } satisfies CraftCarouselProps,
  related: {
    settings: CraftCarouselSettings,
  },
};
