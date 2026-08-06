"use client";

import { useState } from "react";
import { createClient } from "@/shared/utils/supabase/client";
import { useRouter } from "next/navigation";

interface EventPageCardProps {
  eventId: string;
  externalUrl: string | null;
}

export function EventPageCard({ eventId, externalUrl }: EventPageCardProps) {
  const router = useRouter();
  const [url, setUrl] = useState(externalUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const hasUrl = !!externalUrl;

  async function saveUrl() {
    setSaving(true);
    const supabase = createClient();
    await supabase
      .from("events")
      .update({ external_url: url || null, is_external: !!url })
      .eq("id", eventId);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

  return (
    <div className="bg-white rounded-xl border p-6 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Gathering Page</h2>
          <p className="text-sm text-gray-500 mt-1">
            {hasUrl
              ? "Your gathering page is hosted on Google Sites."
              : "Create a Google Sites page for this gathering."}
          </p>
        </div>
        <div className="flex gap-3">
          {hasUrl ? (
            <>
              <a
                href={externalUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Preview
              </a>
              <a
                href={externalUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#29BDD6] rounded-lg hover:bg-[#29BDD6]/90 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Gathering Page
              </a>
            </>
          ) : (
            <a
              href="https://sites.google.com/new"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#29BDD6] rounded-lg hover:bg-[#29BDD6]/90 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
              Create Gathering Page
            </a>
          )}
        </div>
      </div>

      {/* Event Page URL input */}
      <div className="mt-4 pt-4 border-t">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Gathering Page URL <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://sites.google.com/view/your-event"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#29BDD6] focus:border-transparent"
          />
          <button
            onClick={saveUrl}
            disabled={saving || url === (externalUrl ?? "")}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : saved ? "Saved!" : "Save"}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Paste your published Google Sites URL here. Visitors will be redirected to this page.
        </p>
      </div>
    </div>
  );
}
