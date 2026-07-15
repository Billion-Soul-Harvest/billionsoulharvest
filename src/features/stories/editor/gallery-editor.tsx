"use client";

import { useState, useRef, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/shared/utils/supabase/client";

export interface GalleryImage {
  url: string;
  caption?: string;
}

interface Props {
  images: GalleryImage[];
  onChange: (images: GalleryImage[]) => void;
  storyId: string;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

function SortableImageCard({
  image,
  index,
  onCaptionChange,
  onRemove,
  isDragOverlay,
}: {
  image: GalleryImage;
  index: number;
  onCaptionChange: (index: number, caption: string) => void;
  onRemove: (index: number) => void;
  isDragOverlay?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.url });

  const style = isDragOverlay
    ? undefined
    : {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg border overflow-hidden group ${
        isDragOverlay ? "shadow-2xl ring-2 ring-blue-400" : ""
      }`}
    >
      <div
        className="relative aspect-[4/3] cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <img
          src={image.url}
          alt={image.caption || `Gallery image ${index + 1}`}
          className="w-full h-full object-cover"
          draggable={false}
        />
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="p-2">
        <Input
          value={image.caption ?? ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onCaptionChange(index, e.target.value)}
          placeholder="Caption (optional)"
          className="text-xs h-7"
        />
      </div>
    </div>
  );
}

export function GalleryEditor({ images, onChange, storyId }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [activeImage, setActiveImage] = useState<GalleryImage | null>(null);
  const activeIndex = activeImage ? images.findIndex((img) => img.url === activeImage.url) : -1;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleUpload = useCallback(
    async (files: FileList) => {
      setUploading(true);
      const supabase = createClient();
      const newImages: GalleryImage[] = [];

      for (const file of Array.from(files)) {
        if (!ACCEPTED_TYPES.includes(file.type)) continue;
        if (file.size > MAX_SIZE) continue;

        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `${storyId}/gallery/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

        const { error } = await supabase.storage
          .from("event-assets")
          .upload(path, file, { upsert: false });

        if (error) continue;

        const {
          data: { publicUrl },
        } = supabase.storage.from("event-assets").getPublicUrl(path);

        newImages.push({ url: publicUrl });
      }

      if (newImages.length > 0) {
        onChange([...images, ...newImages]);
      }
      setUploading(false);
    },
    [images, onChange, storyId]
  );

  function handleCaptionChange(index: number, caption: string) {
    const updated = [...images];
    updated[index] = { ...updated[index], caption };
    onChange(updated);
  }

  function handleRemove(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveImage(images.find((img) => img.url === event.active.id) ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveImage(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = images.findIndex((img) => img.url === active.id);
    const newIndex = images.findIndex((img) => img.url === over.id);
    onChange(arrayMove(images, oldIndex, newIndex));
  }

  return (
    <div className="space-y-4">
      {images.length > 0 && (
        <DndContext
          id="gallery-editor-dnd"
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={images.map((img) => img.url)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <SortableImageCard
                  key={image.url}
                  image={image}
                  index={index}
                  onCaptionChange={handleCaptionChange}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeImage && activeIndex >= 0 ? (
              <SortableImageCard
                image={activeImage}
                index={activeIndex}
                onCaptionChange={() => {}}
                onRemove={() => {}}
                isDragOverlay
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      <div
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors border-gray-300 hover:border-gray-400 bg-gray-50`}
      >
        {uploading ? (
          <p className="text-sm text-gray-500">Uploading...</p>
        ) : (
          <>
            <svg
              className="w-8 h-8 text-gray-400 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm text-gray-500">
              Drop images here or <span className="text-[#29BDD6] font-medium">click to browse</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP up to 5MB each</p>
          </>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleUpload(e.target.files);
          }
          e.target.value = "";
        }}
      />
    </div>
  );
}
