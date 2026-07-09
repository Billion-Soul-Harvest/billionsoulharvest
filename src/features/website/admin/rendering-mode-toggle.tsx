"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/shared/utils/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

interface Props {
  initialMode: string;
}

export function RenderingModeToggle({ initialMode }: Props) {
  const [mode, setMode] = useState(initialMode);
  const [saving, setSaving] = useState(false);
  const [pendingMode, setPendingMode] = useState<string | null>(null);
  const router = useRouter();

  function handleToggle(newMode: string) {
    if (newMode === mode) return;
    setPendingMode(newMode);
  }

  async function handleConfirm() {
    if (!pendingMode) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("site_settings").upsert(
      { key: "rendering_mode", value: { mode: pendingMode } },
      { onConflict: "key" }
    );
    setMode(pendingMode);
    setSaving(false);
    setPendingMode(null);
    router.refresh();
  }

  return (
    <div className="bg-white rounded-xl border p-5 mb-6">
      <h2 className="text-sm font-semibold text-gray-900 mb-1">
        Rendering Mode
      </h2>
      <p className="text-xs text-gray-500 mb-4">
        Choose how your public website pages are rendered.
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => handleToggle("builder")}
          disabled={saving}
          className={`flex-1 rounded-lg border-2 p-4 text-left transition-all ${
            mode === "builder"
              ? "border-[#29BDD6] bg-[#29BDD6]/5"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                mode === "builder"
                  ? "border-[#29BDD6]"
                  : "border-gray-300"
              }`}
            >
              {mode === "builder" && (
                <div className="w-2 h-2 rounded-full bg-[#29BDD6]" />
              )}
            </div>
            <span className="text-sm font-medium text-gray-900">
              Page Builder
            </span>
          </div>
          <p className="text-xs text-gray-500 ml-6">
            Pages are rendered using the Craft.js drag-and-drop builder.
          </p>
        </button>

        <button
          onClick={() => handleToggle("static")}
          disabled={saving}
          className={`flex-1 rounded-lg border-2 p-4 text-left transition-all ${
            mode === "static"
              ? "border-[#29BDD6] bg-[#29BDD6]/5"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                mode === "static"
                  ? "border-[#29BDD6]"
                  : "border-gray-300"
              }`}
            >
              {mode === "static" && (
                <div className="w-2 h-2 rounded-full bg-[#29BDD6]" />
              )}
            </div>
            <span className="text-sm font-medium text-gray-900">
              Static Site
            </span>
          </div>
          <p className="text-xs text-gray-500 ml-6">
            Pages are rendered from custom-coded React components.
          </p>
        </button>
      </div>

      <Dialog open={pendingMode !== null} onOpenChange={(open) => { if (!open) setPendingMode(null); }}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Change Rendering Mode</DialogTitle>
            <DialogDescription>
              Switch to{" "}
              <span className="font-medium text-gray-900">
                {pendingMode === "static" ? "Static Site" : "Page Builder"}
              </span>
              ? This will change how your public website pages are rendered.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button onClick={handleConfirm} disabled={saving}>
              {saving ? "Switching..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
