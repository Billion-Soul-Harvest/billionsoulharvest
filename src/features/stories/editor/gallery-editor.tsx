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
  type?: "image" | "video";
}

interface Props {
  images: GalleryImage[];
  onChange: (images: GalleryImage[]) => void;
  storyId: string;
}

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const IMAGE_MAX_SIZE = 5 * 1024 * 1024;
const VIDEO_MAX_SIZE = 50 * 1024 * 1024;

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
        {image.type === "video" ? (
          <>
            <video
              src={image.url}
              muted
              preload="metadata"
              className="w-full h-full object-cover"
              draggable={false}
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center">
                <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </>
        ) : (
          <img
            src={image.url}
            alt={image.caption || `Gallery image ${index + 1}`}
            className="w-full h-full object-cover"
            draggable={false}
          />
        )}
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadCurrent, setUploadCurrent] = useState(0);
  const [uploadTotal, setUploadTotal] = useState(0);
  const [activeImage, setActiveImage] = useState<GalleryImage | null>(null);
  const activeIndex = activeImage ? images.findIndex((img) => img.url === activeImage.url) : -1;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const uploadFileWithProgress = useCallback(
    (file: File, path: string): Promise<string | null> => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const url = `${supabaseUrl}/storage/v1/object/event-assets/${path}`;

      return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            setUploadProgress(Math.round((e.loaded / e.total) * 100));
          }
        });
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const supabase = createClient();
            const { data: { publicUrl } } = supabase.storage.from("event-assets").getPublicUrl(path);
            resolve(publicUrl);
          } else {
            resolve(null);
          }
        };
        xhr.onerror = () => resolve(null);
        xhr.open("POST", url);
        xhr.setRequestHeader("Authorization", `Bearer ${supabaseKey}`);
        xhr.setRequestHeader("apikey", supabaseKey);
        xhr.send(file);
      });
    },
    []
  );

  const handleUpload = useCallback(
    async (files: FileList) => {
      const validFiles = Array.from(files).filter((file) => {
        const isImage = ACCEPTED_IMAGE_TYPES.includes(file.type);
        const isVideo = ACCEPTED_VIDEO_TYPES.includes(file.type);
        if (!isImage && !isVideo) return false;
        if (isImage && file.size > IMAGE_MAX_SIZE) return false;
        if (isVideo && file.size > VIDEO_MAX_SIZE) return false;
        return true;
      });

      if (validFiles.length === 0) return;

      setUploading(true);
      setUploadTotal(validFiles.length);
      const newImages: GalleryImage[] = [];

      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        setUploadCurrent(i + 1);
        setUploadProgress(0);

        const isVideo = ACCEPTED_VIDEO_TYPES.includes(file.type);
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `${storyId}/gallery/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

        const publicUrl = await uploadFileWithProgress(file, path);
        if (publicUrl) {
          newImages.push({ url: publicUrl, type: isVideo ? "video" : "image" });
        }
      }

      if (newImages.length > 0) {
        onChange([...images, ...newImages]);
      }
      setUploading(false);
      setUploadProgress(0);
      setUploadCurrent(0);
      setUploadTotal(0);
    },
    [images, onChange, storyId, uploadFileWithProgress]
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
          <div className="space-y-2">
            <p className="text-sm text-gray-500">
              Uploading {uploadCurrent} of {uploadTotal}...
            </p>
            <div className="w-48 mx-auto h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#29BDD6] rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs text-gray-400">{uploadProgress}%</p>
          </div>
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
              Drop files here or <span className="text-[#29BDD6] font-medium">click to browse</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">Images (JPEG, PNG, WebP) up to 5MB | Videos (MP4, WebM, MOV) up to 50MB</p>
          </>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
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
