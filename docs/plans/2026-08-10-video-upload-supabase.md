# Video Upload via Supabase Storage — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Support video uploads in both the Gallery editor and Story Content editor, stored in Supabase Storage.

**Architecture:** Extend the existing `event-assets` bucket upload pattern to accept video files (mp4, webm, mov, up to 50MB). Gallery items gain a `type` field ("image" | "video"). A new TipTap node extension handles inline video in the rich text editor. Native `<video>` element used for playback everywhere.

**Tech Stack:** Supabase Storage, TipTap custom node, Next.js, React, Tailwind CSS

---

### Task 1: Update GalleryImage type to support video

**Files:**
- Modify: `src/features/stories/editor/gallery-editor.tsx:27-30`

**Step 1: Update the GalleryImage interface**

```typescript
export interface GalleryImage {
  url: string;
  caption?: string;
  type?: "image" | "video"; // undefined defaults to "image" for backward compat
}
```

**Step 2: Verify no type errors**

Run: `npx tsc --noEmit`
Expected: No new errors (type is optional, backward compatible)

**Step 3: Commit**

```bash
git add src/features/stories/editor/gallery-editor.tsx
git commit -m "feat: add type field to GalleryImage for video support"
```

---

### Task 2: Accept video uploads in GalleryEditor

**Files:**
- Modify: `src/features/stories/editor/gallery-editor.tsx`

**Step 1: Update accepted types and size constants**

Replace lines 38-39:
```typescript
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const IMAGE_MAX_SIZE = 5 * 1024 * 1024;
const VIDEO_MAX_SIZE = 50 * 1024 * 1024;
```

**Step 2: Update handleUpload to detect file type and set limits**

In the `handleUpload` callback, replace the type/size checks:
```typescript
const handleUpload = useCallback(
  async (files: FileList) => {
    setUploading(true);
    const supabase = createClient();
    const newImages: GalleryImage[] = [];

    for (const file of Array.from(files)) {
      const isVideo = ACCEPTED_VIDEO_TYPES.includes(file.type);
      const isImage = ACCEPTED_IMAGE_TYPES.includes(file.type);
      if (!isVideo && !isImage) continue;
      if (isImage && file.size > IMAGE_MAX_SIZE) continue;
      if (isVideo && file.size > VIDEO_MAX_SIZE) continue;

      const ext = file.name.split(".").pop() ?? (isVideo ? "mp4" : "jpg");
      const path = `${storyId}/gallery/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const { error } = await supabase.storage
        .from("event-assets")
        .upload(path, file, { upsert: false });

      if (error) continue;

      const {
        data: { publicUrl },
      } = supabase.storage.from("event-assets").getPublicUrl(path);

      newImages.push({ url: publicUrl, type: isVideo ? "video" : "image" });
    }

    if (newImages.length > 0) {
      onChange([...images, ...newImages]);
    }
    setUploading(false);
  },
  [images, onChange, storyId]
);
```

**Step 3: Update the file input accept attribute**

```typescript
<input
  ref={fileInputRef}
  type="file"
  accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
  multiple
  className="hidden"
  ...
/>
```

**Step 4: Update drop zone text**

```typescript
<p className="text-sm text-gray-500">
  Drop files here or <span className="text-[#29BDD6] font-medium">click to browse</span>
</p>
<p className="text-xs text-gray-400 mt-1">Images (JPEG, PNG, WebP) up to 5MB | Videos (MP4, WebM, MOV) up to 50MB</p>
```

**Step 5: Commit**

```bash
git add src/features/stories/editor/gallery-editor.tsx
git commit -m "feat: accept video uploads in gallery editor"
```

---

### Task 3: Render video items in GalleryEditor cards

**Files:**
- Modify: `src/features/stories/editor/gallery-editor.tsx` (SortableImageCard component)

**Step 1: Update SortableImageCard to render video or image**

Replace the `<img>` in the card (lines 84-89) with:
```tsx
{image.type === "video" ? (
  <div className="relative w-full h-full bg-black flex items-center justify-center">
    <video
      src={image.url}
      className="w-full h-full object-cover"
      muted
      preload="metadata"
    />
    {/* Play icon overlay */}
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center">
        <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
    </div>
  </div>
) : (
  <img
    src={image.url}
    alt={image.caption || `Gallery image ${index + 1}`}
    className="w-full h-full object-cover"
    draggable={false}
  />
)}
```

**Step 2: Verify in browser**

Upload a video to the gallery and confirm:
- Video thumbnail shows with play icon overlay
- Drag-to-reorder still works
- Remove button still works

**Step 3: Commit**

```bash
git add src/features/stories/editor/gallery-editor.tsx
git commit -m "feat: render video thumbnails with play overlay in gallery editor"
```

---

### Task 4: Update GalleryCarousel for video playback on public page

**Files:**
- Modify: `src/features/stories/gallery-carousel.tsx`

**Step 1: Update the GalleryImage interface**

```typescript
interface GalleryImage {
  url: string;
  caption?: string;
  type?: "image" | "video";
}
```

**Step 2: Update main display area to handle video**

Replace the `<img>` in the main display (line 34-38) with:
```tsx
<div className="aspect-[16/9] relative">
  {image.type === "video" ? (
    <video
      key={image.url}
      src={image.url}
      className="w-full h-full object-contain"
      controls
      preload="metadata"
    />
  ) : (
    <img
      src={image.url}
      alt={image.caption || `Gallery image ${current + 1}`}
      className="w-full h-full object-contain"
    />
  )}
</div>
```

**Step 3: Update thumbnail strip to handle video**

Replace the thumbnail `<img>` (lines 93-96) with:
```tsx
{img.type === "video" ? (
  <div className="relative w-full h-full">
    <video src={img.url} className="w-full h-full object-cover" muted preload="metadata" />
    <div className="absolute inset-0 flex items-center justify-center">
      <svg className="w-4 h-4 text-white drop-shadow" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z" />
      </svg>
    </div>
  </div>
) : (
  <img
    src={img.url}
    alt={img.caption || `Thumbnail ${i + 1}`}
    className="w-full h-full object-cover"
  />
)}
```

**Step 4: Commit**

```bash
git add src/features/stories/gallery-carousel.tsx
git commit -m "feat: support video playback in gallery carousel"
```

---

### Task 5: Create TipTap Video node extension for story content editor

**Files:**
- Create: `src/features/stories/editor/extensions/video-node.ts`

**Step 1: Create the extension**

Model after `google-drive-video.ts` but render a `<video>` tag:

```typescript
import { Node, mergeAttributes } from "@tiptap/react";

export interface VideoNodeOptions {
  HTMLAttributes: Record<string, string>;
}

declare module "@tiptap/react" {
  interface Commands<ReturnType> {
    videoNode: {
      setVideo: (options: { src: string }) => ReturnType;
    };
  }
}

export const VideoNode = Node.create<VideoNodeOptions>({
  name: "videoNode",

  group: "block",
  draggable: true,
  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      src: { default: null },
    };
  },

  parseHTML() {
    return [
      {
        tag: "video[src]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "video",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        controls: "true",
        preload: "metadata",
        style: "width: 100%; max-width: 100%; border-radius: 0.5rem;",
      }),
    ];
  },

  addCommands() {
    return {
      setVideo:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },
});
```

**Step 2: Commit**

```bash
git add src/features/stories/editor/extensions/video-node.ts
git commit -m "feat: add TipTap VideoNode extension"
```

---

### Task 6: Register VideoNode and add video upload to story content editor

**Files:**
- Modify: `src/features/stories/editor/story-content-editor.tsx`

**Step 1: Import VideoNode**

Add at top of file:
```typescript
import { VideoNode } from "./extensions/video-node";
```

**Step 2: Register extension**

Add `VideoNode` to the `extensions` array in `useEditor`:
```typescript
VideoNode.configure({
  HTMLAttributes: { class: "rounded-lg" },
}),
```

**Step 3: Add video upload state and ref**

Add alongside existing refs/state:
```typescript
const videoInputRef = useRef<HTMLInputElement>(null);
const [videoUploading, setVideoUploading] = useState(false);
```

**Step 4: Add handleVideoUpload callback**

```typescript
const handleVideoUpload = useCallback(
  async (file: File) => {
    if (!editor) return;
    const accepted = ["video/mp4", "video/webm", "video/quicktime"];
    if (!accepted.includes(file.type)) {
      alert("Only MP4, WebM, and MOV files are allowed.");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      alert("Video must be under 50MB.");
      return;
    }

    setVideoUploading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop() ?? "mp4";
    const path = `${storyId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error } = await supabase.storage
      .from("event-assets")
      .upload(path, file, { upsert: false });

    if (error) {
      alert(`Upload failed: ${error.message}`);
      setVideoUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("event-assets").getPublicUrl(path);

    editor.chain().focus().setVideo({ src: publicUrl }).run();
    setVideoUploading(false);
  },
  [editor, storyId]
);
```

**Step 5: Add toolbar button for video upload**

Add after the image upload ToolbarBtn (after the YouTube button):
```tsx
<ToolbarBtn
  active={false}
  onClick={() => videoInputRef.current?.click()}
  title="Upload Video"
>
  {videoUploading ? (
    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeWidth={2} d="M12 6V3m0 18v-3m9-6h-3M6 12H3m15.364 6.364l-2.121-2.121M8.757 8.757L6.636 6.636m12.728 0l-2.121 2.121M8.757 15.243l-2.121 2.121" />
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  )}
</ToolbarBtn>
```

**Step 6: Add hidden file input for video**

Add alongside existing hidden inputs:
```tsx
<input
  ref={videoInputRef}
  type="file"
  accept="video/mp4,video/webm,video/quicktime"
  className="hidden"
  onChange={(e) => {
    const file = e.target.files?.[0];
    if (file) handleVideoUpload(file);
    e.target.value = "";
  }}
/>
```

**Step 7: Commit**

```bash
git add src/features/stories/editor/story-content-editor.tsx
git commit -m "feat: add video upload button to story content editor toolbar"
```

---

### Task 7: Add prose video styling for public pages

**Files:**
- Modify: `src/app/globals.css`

**Step 1: Add video styling**

After the `.prose a` block:
```css
/* Ensure videos render properly in prose content */
.prose video {
  width: 100%;
  max-width: 100%;
  border-radius: 0.5rem;
}
```

**Step 2: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: add prose video styling for public story pages"
```

---

### Task 8: Manual testing

**Step 1: Test gallery video upload**
- Go to admin story editor, step 3 (Gallery)
- Upload a video file (MP4, under 50MB)
- Verify: thumbnail shows with play icon, caption field works, drag reorder works, remove works

**Step 2: Test story content video upload**
- Go to step 2 (Story Content)
- Click the video toolbar button, select a video
- Verify: video embeds in editor with controls

**Step 3: Test public page rendering**
- Preview the story on the public page
- Verify: gallery carousel plays videos with controls
- Verify: inline videos in content render with controls

**Step 4: Test backward compatibility**
- View an existing story with images only
- Verify: everything renders correctly (no `type` field = image)

**Step 5: Final commit**

```bash
git add -A
git commit -m "feat: complete video upload support for stories"
```
