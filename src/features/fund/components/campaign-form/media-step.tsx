"use client";

import { useState } from "react";
import { createClient } from "@/shared/utils/supabase/client";
import type { CampaignFormData } from "./campaign-wizard";

interface Props {
  form: CampaignFormData;
  updateForm: (updates: Partial<CampaignFormData>) => void;
}

export function MediaStep({ form, updateForm }: Props) {
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>, type: "banner" | "gallery") {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const path = `${crypto.randomUUID()}.${ext}`;

      const { error } = await supabase.storage.from("fund-images").upload(path, file);
      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage.from("fund-images").getPublicUrl(path);

      if (type === "banner") {
        updateForm({ banner_url: publicUrl });
      } else {
        updateForm({ gallery_images: [...form.gallery_images, publicUrl] });
      }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Campaign Media</h2>
        <p className="text-sm text-gray-500 mt-1">Add a banner image and gallery photos</p>
      </div>

      {/* Banner */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Banner Image</label>
        {form.banner_url ? (
          <div className="relative">
            <img src={form.banner_url} alt="Banner" className="w-full h-48 object-cover rounded-lg" />
            <button
              onClick={() => updateForm({ banner_url: "" })}
              className="absolute top-2 right-2 bg-white/90 rounded-full p-1 hover:bg-white"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-cyan-400 hover:bg-cyan-50/50 transition-colors">
            <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm text-gray-500">{uploading ? "Uploading..." : "Click to upload banner"}</span>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, "banner")} disabled={uploading} />
          </label>
        )}
      </div>

      {/* Gallery */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Gallery Images</label>
        <div className="grid grid-cols-3 gap-3">
          {form.gallery_images.map((url, i) => (
            <div key={i} className="relative">
              <img src={url} alt={`Gallery ${i + 1}`} className="w-full h-24 object-cover rounded-lg" />
              <button
                onClick={() => updateForm({ gallery_images: form.gallery_images.filter((_, j) => j !== i) })}
                className="absolute top-1 right-1 bg-white/90 rounded-full p-0.5 hover:bg-white"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-cyan-400 transition-colors">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, "gallery")} disabled={uploading} />
          </label>
        </div>
      </div>
    </div>
  );
}
