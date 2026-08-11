"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Youtube from "@tiptap/extension-youtube";
import { GoogleDriveVideo } from "./extensions/google-drive-video";
import { VideoNode } from "./extensions/video-node";
import { useEffect, useCallback, useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { createClient } from "@/shared/utils/supabase/client";

interface Props {
  value: string;
  onChange: (html: string) => void;
  storyId: string;
}

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  createdTime: string;
  thumbnailLink?: string;
  embedUrl: string;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

export function StoryContentEditor({ value, onChange, storyId }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const [editorInView, setEditorInView] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [youtubeDialogOpen, setYoutubeDialogOpen] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [hasSelection, setHasSelection] = useState(false);
  const [driveDialogOpen, setDriveDialogOpen] = useState(false);
  const [driveUploading, setDriveUploading] = useState(false);
  const [driveUploadProgress, setDriveUploadProgress] = useState(0);
  const [driveUrl, setDriveUrl] = useState("");
  const [driveError, setDriveError] = useState<string | null>(null);
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [driveFilesLoading, setDriveFilesLoading] = useState(false);
  const driveFileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Youtube.configure({
        HTMLAttributes: {
          class: "rounded-lg",
          style: "width: 100%; aspect-ratio: 16/9;",
        },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
        validate: (url: string) => {
          // Don't auto-link YouTube URLs — let the YouTube extension handle them
          return !/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//.test(url);
        },
      }),
      Image.configure({
        HTMLAttributes: { class: "rounded-lg max-w-full h-auto" },
      }),
      GoogleDriveVideo.configure({
        HTMLAttributes: { class: "rounded-lg" },
      }),
      VideoNode.configure({
        HTMLAttributes: { class: "rounded-lg" },
      }),
    ],
    content: value,
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  useEffect(() => {
    const el = editorContainerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setEditorInView(entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const openLinkDialog = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href ?? "";
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, "");
    setHasSelection(from !== to);
    setLinkText(selectedText || "");
    setLinkUrl(prev || "https://");
    setLinkDialogOpen(true);
  }, [editor]);

  const handleLinkSubmit = useCallback(() => {
    if (!editor) return;
    if (!linkUrl || linkUrl === "https://") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else if (!hasSelection) {
      // No text selected — insert link text + URL
      const displayText = linkText.trim() || linkUrl;
      editor
        .chain()
        .focus()
        .insertContent(`<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${displayText}</a>`)
        .run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run();
    }
    setLinkDialogOpen(false);
    setLinkUrl("");
    setLinkText("");
  }, [editor, linkUrl, linkText, hasSelection]);

  const openYoutubeDialog = useCallback(() => {
    setYoutubeUrl("");
    setYoutubeDialogOpen(true);
  }, []);

  const handleYoutubeSubmit = useCallback(() => {
    if (!editor || !youtubeUrl) return;
    editor.chain().focus().setYoutubeVideo({ src: youtubeUrl }).run();
    setYoutubeDialogOpen(false);
    setYoutubeUrl("");
  }, [editor, youtubeUrl]);

  const handleDriveFileUpload = useCallback(
    async (file: File) => {
      if (!editor) return;
      if (file.size > 500 * 1024 * 1024) {
        setDriveError("File must be under 500MB.");
        return;
      }

      setDriveError(null);
      setDriveUploading(true);
      setDriveUploadProgress(0);

      try {
        // Step 1: Get resumable upload URL from our API
        const initRes = await fetch("/api/drive-upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            mimeType: file.type,
            fileSize: file.size,
          }),
        });
        if (!initRes.ok) {
          const err = await initRes.json();
          throw new Error(err.error || "Failed to start upload");
        }
        const { uploadUrl } = await initRes.json();

        // Step 2: Upload file directly to Google Drive with progress
        const fileId = await new Promise<string>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
              setDriveUploadProgress(Math.round((e.loaded / e.total) * 90));
            }
          });
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              const data = JSON.parse(xhr.responseText);
              resolve(data.id);
            } else {
              reject(new Error("Upload to Google Drive failed"));
            }
          };
          xhr.onerror = () => reject(new Error("Upload failed"));
          xhr.open("PUT", uploadUrl);
          xhr.setRequestHeader("Content-Type", file.type);
          xhr.send(file);
        });

        setDriveUploadProgress(95);

        // Step 3: Set public permissions via our API
        const permRes = await fetch("/api/drive-upload", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileId }),
        });
        if (!permRes.ok) {
          const err = await permRes.json();
          throw new Error(err.error || "Failed to set permissions");
        }
        const { embedUrl } = await permRes.json();

        editor.chain().focus().setGoogleDriveVideo({ src: embedUrl }).run();
        setDriveDialogOpen(false);
      } catch (err) {
        setDriveError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setDriveUploading(false);
        setDriveUploadProgress(0);
      }
    },
    [editor]
  );

  const handleDriveUrlSubmit = useCallback(() => {
    if (!editor || !driveUrl) return;
    const match = driveUrl.match(
      /https?:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/
    );
    if (!match) {
      setDriveError("Please enter a valid Google Drive file URL.");
      return;
    }
    const fileId = match[1];
    const src = `https://drive.google.com/file/d/${fileId}/preview`;
    editor.chain().focus().setGoogleDriveVideo({ src }).run();
    setDriveDialogOpen(false);
    setDriveUrl("");
  }, [editor, driveUrl]);

  const fetchDriveFiles = useCallback(async () => {
    setDriveFilesLoading(true);
    setDriveError(null);
    try {
      const res = await fetch("/api/drive-files");
      if (!res.ok) {
        const data = await res.json();
        setDriveError(data.error || "Failed to load files");
        return;
      }
      const data = await res.json();
      setDriveFiles(data.files);
    } catch {
      setDriveError("Failed to load files");
    } finally {
      setDriveFilesLoading(false);
    }
  }, []);

  const handleDriveFileSelect = useCallback(
    (file: DriveFile) => {
      if (!editor) return;
      editor.chain().focus().setGoogleDriveVideo({ src: file.embedUrl }).run();
      setDriveDialogOpen(false);
    },
    [editor]
  );

  const handleImageUpload = useCallback(
    async (file: File) => {
      if (!editor) return;
      if (!ACCEPTED_TYPES.includes(file.type)) {
        alert("Only JPEG, PNG, and WebP files are allowed.");
        return;
      }
      if (file.size > MAX_SIZE) {
        alert("File must be under 5MB.");
        return;
      }

      setUploading(true);
      const supabase = createClient();
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${storyId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const { error } = await supabase.storage
        .from("event-assets")
        .upload(path, file, { upsert: false });

      if (error) {
        alert(`Upload failed: ${error.message}`);
        setUploading(false);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("event-assets").getPublicUrl(path);

      editor.chain().focus().setImage({ src: publicUrl }).run();
      setUploading(false);
    },
    [editor, storyId]
  );

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
      setVideoUploadProgress(0);

      const ext = file.name.split(".").pop() ?? "mp4";
      const path = `${storyId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const url = `${supabaseUrl}/storage/v1/object/event-assets/${path}`;

      try {
        const publicUrl = await new Promise<string>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
              setVideoUploadProgress(Math.round((e.loaded / e.total) * 100));
            }
          });
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              const supabase = createClient();
              const { data: { publicUrl: pUrl } } = supabase.storage.from("event-assets").getPublicUrl(path);
              resolve(pUrl);
            } else {
              reject(new Error("Upload failed"));
            }
          };
          xhr.onerror = () => reject(new Error("Upload failed"));
          xhr.open("POST", url);
          xhr.setRequestHeader("Authorization", `Bearer ${supabaseKey}`);
          xhr.setRequestHeader("apikey", supabaseKey);
          xhr.send(file);
        });

        editor.chain().focus().setVideo({ src: publicUrl }).run();
      } catch {
        alert("Video upload failed.");
      } finally {
        setVideoUploading(false);
        setVideoUploadProgress(0);
      }
    },
    [editor, storyId]
  );

  if (!editor) return null;

  return (
    <>
      <div ref={editorContainerRef} className="border rounded-lg bg-white">
        {/* Toolbar: inline scrollable on mobile, floating pill on desktop */}
        <div className="flex flex-nowrap gap-0.5 border-b bg-gray-50 p-1 overflow-x-auto sm:fixed sm:bottom-24 sm:left-1/2 sm:-translate-x-1/2 sm:z-50 sm:bg-white sm:border sm:shadow-lg sm:rounded-full sm:px-3 sm:py-1.5 sm:border-b-0 sm:overflow-visible sm:flex-wrap sm:justify-center">
          <ToolbarBtn
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Bold"
          >
            <strong>B</strong>
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Italic"
          >
            <em>I</em>
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive("underline")}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            title="Underline"
          >
            <u>U</u>
          </ToolbarBtn>

          <Divider />

          <ToolbarBtn
            active={editor.isActive("heading", { level: 1 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            title="Heading 1"
          >
            H1
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive("heading", { level: 2 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            title="Heading 2"
          >
            H2
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive("heading", { level: 3 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            title="Heading 3"
          >
            H3
          </ToolbarBtn>

          <Divider />

          <ToolbarBtn
            active={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Bullet List"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="Ordered List"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6h11M10 12h11M10 18h11M4 6h1M4 12h1M4 18h1" />
            </svg>
          </ToolbarBtn>

          <Divider />

          <ToolbarBtn
            active={editor.isActive({ textAlign: "left" })}
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            title="Align Left"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeWidth={2} d="M3 6h18M3 12h12M3 18h18" />
            </svg>
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive({ textAlign: "center" })}
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            title="Align Center"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeWidth={2} d="M3 6h18M6 12h12M3 18h18" />
            </svg>
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive({ textAlign: "right" })}
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            title="Align Right"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeWidth={2} d="M3 6h18M9 12h12M3 18h18" />
            </svg>
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive({ textAlign: "justify" })}
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            title="Justify"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeWidth={2} d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </ToolbarBtn>

          <Divider />

          <ToolbarBtn
            active={editor.isActive("link")}
            onClick={openLinkDialog}
            title="Link"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive("blockquote")}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            title="Blockquote"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 17h3l2-4V7H5v6h3l-2 4zm8 0h3l2-4V7h-6v6h3l-2 4z" />
            </svg>
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive("horizontalRule")}
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Horizontal Rule"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeWidth={2} d="M3 12h18" />
            </svg>
          </ToolbarBtn>

          <Divider />

          <ToolbarBtn
            active={false}
            onClick={() => fileInputRef.current?.click()}
            title="Insert Image"
          >
            {uploading ? (
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeWidth={2} d="M12 6V3m0 18v-3m9-6h-3M6 12H3m15.364 6.364l-2.121-2.121M8.757 8.757L6.636 6.636m12.728 0l-2.121 2.121M8.757 15.243l-2.121 2.121" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
          </ToolbarBtn>
          <ToolbarBtn
            active={false}
            onClick={openYoutubeDialog}
            title="YouTube Video"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0C.488 3.45.029 5.804 0 12c.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0C23.512 20.55 23.971 18.196 24 12c-.029-6.185-.484-8.549-4.385-8.816zM9 16V8l8 3.993L9 16z" />
            </svg>
          </ToolbarBtn>
          {videoUploading ? (
            <div className="flex items-center gap-1.5 px-2 shrink-0" title={`Uploading ${videoUploadProgress}%`}>
              <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#29BDD6] rounded-full transition-all duration-300"
                  style={{ width: `${videoUploadProgress}%` }}
                />
              </div>
              <span className="text-[10px] text-gray-500">{videoUploadProgress}%</span>
            </div>
          ) : (
            <ToolbarBtn
              active={false}
              onClick={() => videoInputRef.current?.click()}
              title="Upload Video"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </ToolbarBtn>
          )}
          <ToolbarBtn
            active={false}
            onClick={() => { setDriveDialogOpen(true); fetchDriveFiles(); }}
            title="Google Drive File"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7.71 3.5L1.15 15l3.43 5.99L11.14 9.5 7.71 3.5zm1.14 0l6.86 12H22.8l-3.43-6-3.43-6H8.85zM15.96 16.5H2.28L5.71 22.5h13.72l-3.47-6z" />
            </svg>
          </ToolbarBtn>
        </div>

        {/* Editor */}
        <EditorContent
          editor={editor}
          className="prose prose-lg max-w-none p-4 min-h-[400px] focus-within:outline-none [&_.tiptap]:outline-none [&_.tiptap]:min-h-[380px]"
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageUpload(file);
            e.target.value = "";
          }}
        />
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
      </div>

      {/* YouTube Dialog */}
      <Dialog open={youtubeDialogOpen} onOpenChange={setYoutubeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0C.488 3.45.029 5.804 0 12c.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0C23.512 20.55 23.971 18.196 24 12c-.029-6.185-.484-8.549-4.385-8.816zM9 16V8l8 3.993L9 16z" />
              </svg>
              Embed YouTube Video
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleYoutubeSubmit();
            }}
          >
            <div className="space-y-3 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="youtube-url">Video URL</Label>
                <Input
                  id="youtube-url"
                  value={youtubeUrl}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  autoFocus
                />
                <p className="text-xs text-gray-400">
                  Paste a YouTube URL (e.g. youtube.com/watch?v=... or youtu.be/...)
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setYoutubeDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!youtubeUrl.trim()}>
                Embed Video
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Google Drive Dialog */}
      <Dialog open={driveDialogOpen} onOpenChange={(open) => { setDriveDialogOpen(open); if (open) fetchDriveFiles(); if (!open) setDriveError(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7.71 3.5L1.15 15l3.43 5.99L11.14 9.5 7.71 3.5zm1.14 0l6.86 12H22.8l-3.43-6-3.43-6H8.85zM15.96 16.5H2.28L5.71 22.5h13.72l-3.47-6z" />
              </svg>
              Google Drive File
            </DialogTitle>
          </DialogHeader>
          {driveError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-md">
              {driveError}
            </div>
          )}
          <Tabs defaultValue="browse" className="w-full" onValueChange={(v) => { if (v === "browse" && driveFiles.length === 0) fetchDriveFiles(); }}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="browse">Browse</TabsTrigger>
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="url">Paste URL</TabsTrigger>
            </TabsList>
            <TabsContent value="browse" className="space-y-3 pt-2">
              {driveFilesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <svg className="w-5 h-5 animate-spin text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeWidth={2} d="M12 6V3m0 18v-3m9-6h-3M6 12H3m15.364 6.364l-2.121-2.121M8.757 8.757L6.636 6.636m12.728 0l-2.121 2.121M8.757 15.243l-2.121 2.121" />
                  </svg>
                </div>
              ) : driveFiles.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">No files found in the Drive folder.</p>
              ) : (
                <div className="max-h-64 overflow-y-auto space-y-1">
                  {driveFiles.map((file) => (
                    <button
                      key={file.id}
                      type="button"
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 text-left text-sm transition-colors"
                      onClick={() => handleDriveFileSelect(file)}
                    >
                      <span className="shrink-0 w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                        {file.mimeType?.startsWith("video/") ? "🎬" : file.mimeType?.startsWith("audio/") ? "🎵" : file.mimeType === "application/pdf" ? "📄" : "📁"}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block truncate font-medium">{file.name}</span>
                        <span className="block text-xs text-gray-400">
                          {file.size > 0 ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : ""}
                          {file.createdTime ? ` · ${new Date(file.createdTime).toLocaleDateString()}` : ""}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="upload" className="space-y-3 pt-2">
              <p className="text-sm text-gray-500">
                Upload a file to Google Drive. It will be shared publicly for embedding.
              </p>
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={driveUploading}
                  onClick={() => driveFileInputRef.current?.click()}
                >
                  {driveUploading
                    ? driveUploadProgress >= 90
                      ? "Processing..."
                      : "Uploading..."
                    : "Choose File"}
                </Button>
                {driveUploading && (
                  <div className="space-y-1">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${driveUploadProgress >= 90 ? "bg-amber-500 animate-pulse" : "bg-blue-600"}`}
                        style={{ width: `${driveUploadProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 text-center">
                      {driveUploadProgress >= 90 ? "Uploading to Google Drive..." : `${driveUploadProgress}%`}
                    </p>
                  </div>
                )}
              </div>
              <input
                ref={driveFileInputRef}
                type="file"
                className="hidden"
                accept="video/*,audio/*,application/pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleDriveFileUpload(file);
                  e.target.value = "";
                }}
              />
            </TabsContent>
            <TabsContent value="url" className="space-y-3 pt-2">
              <p className="text-sm text-gray-500">
                Paste a Google Drive file URL. The file must be shared as &quot;Anyone with the link&quot; to be viewable.
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleDriveUrlSubmit();
                }}
              >
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="drive-url">Google Drive URL</Label>
                    <Input
                      id="drive-url"
                      value={driveUrl}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setDriveUrl(e.target.value)
                      }
                      placeholder="https://drive.google.com/file/d/..."
                      autoFocus
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDriveDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={!driveUrl.trim()}>
                      Embed
                    </Button>
                  </DialogFooter>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Link Dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Insert Link
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLinkSubmit();
            }}
          >
            <div className="space-y-3 py-2">
              {!hasSelection && (
                <div className="space-y-1.5">
                  <Label htmlFor="link-text">Link Text</Label>
                  <Input
                    id="link-text"
                    value={linkText}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLinkText(e.target.value)}
                    placeholder="Display text (optional, defaults to URL)"
                    autoFocus
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="link-url">URL</Label>
                <Input
                  id="link-url"
                  value={linkUrl}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLinkUrl(e.target.value)}
                  placeholder="https://..."
                  autoFocus={hasSelection}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setLinkDialogOpen(false)}>
                Cancel
              </Button>
              {editor?.getAttributes("link").href && (
                <Button
                  type="button"
                  variant="ghost"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => {
                    editor?.chain().focus().extendMarkRange("link").unsetLink().run();
                    setLinkDialogOpen(false);
                  }}
                >
                  Remove Link
                </Button>
              )}
              <Button type="submit">
                Apply
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ToolbarBtn({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      title={title}
      className={`h-7 w-7 p-0 text-xs shrink-0 ${active ? "bg-gray-200 text-gray-900" : "text-gray-600"}`}
    >
      {children}
    </Button>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-gray-200 mx-0.5 self-center shrink-0" />;
}
