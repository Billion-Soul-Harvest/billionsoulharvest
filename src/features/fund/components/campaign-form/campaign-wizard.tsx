"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BasicInfoStep } from "./basic-info-step";
import { StoryStep } from "./story-step";
import { MediaStep } from "./media-step";
import { PreviewStep } from "./preview-step";
import type { FundCampaignCategory } from "../../types";

export interface CampaignFormData {
  title: string;
  category: FundCampaignCategory;
  goal_cents: number;
  end_date: string;
  story_html: string;
  banner_url: string;
  gallery_images: string[];
}

const STEPS = ["Basic Info", "Story", "Media", "Preview"];

export function CampaignWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CampaignFormData>({
    title: "",
    category: "other",
    goal_cents: 0,
    end_date: "",
    story_html: "",
    banner_url: "",
    gallery_images: [],
  });

  function updateForm(updates: Partial<CampaignFormData>) {
    setForm((prev) => ({ ...prev, ...updates }));
  }

  async function handleSave(publish: boolean) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/fund/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create campaign");
      }

      const campaign = await res.json();

      if (publish) {
        await fetch(`/api/fund/campaigns/${campaign.id}/publish`, { method: "POST" });
      }

      router.push("/fund/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Step indicator — mobile: current step big circle with prev/next small numbers */}
      <div className="sm:hidden flex items-center justify-center gap-4 mb-6">
        {step > 0 && (
          <button onClick={() => setStep(step - 1)} className="text-xs text-gray-400 font-medium">
            {step}
          </button>
        )}
        <div className="flex flex-col items-center gap-1">
          <span className="w-12 h-12 rounded-full bg-cyan-600 text-white flex items-center justify-center text-lg font-bold">
            {step + 1}
          </span>
          <span className="text-xs font-medium text-cyan-700">{STEPS[step]}</span>
          <span className="text-[10px] text-gray-400">{step + 1} of {STEPS.length}</span>
        </div>
        {step < STEPS.length - 1 && (
          <button onClick={() => step > 0 || form.title ? setStep(step + 1) : undefined} className="text-xs text-gray-400 font-medium">
            {step + 2}
          </button>
        )}
      </div>

      {/* Step indicator — desktop: full horizontal steps */}
      <div className="hidden sm:flex items-center gap-2 mb-8">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <button
              onClick={() => i < step && setStep(i)}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                i === step
                  ? "text-cyan-700"
                  : i < step
                  ? "text-gray-600 cursor-pointer hover:text-cyan-600"
                  : "text-gray-400"
              }`}
            >
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                  i === step
                    ? "bg-cyan-600 text-white"
                    : i < step
                    ? "bg-cyan-100 text-cyan-700"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {i < step ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </span>
              <span>{label}</span>
            </button>
            {i < STEPS.length - 1 && (
              <div className={`w-8 h-px ${i < step ? "bg-cyan-300" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      {/* Step content */}
      <div className="bg-white rounded-xl sm:rounded-2xl border shadow-sm p-4 sm:p-6 md:p-8">
        {step === 0 && <BasicInfoStep form={form} updateForm={updateForm} />}
        {step === 1 && <StoryStep form={form} updateForm={updateForm} />}
        {step === 2 && <MediaStep form={form} updateForm={updateForm} />}
        {step === 3 && <PreviewStep form={form} />}
      </div>

      {/* Navigation */}
      <div className="mt-4 sm:mt-6">
        {step < STEPS.length - 1 ? (
          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStep(step - 1)}
              disabled={step === 0}
              className="w-full sm:w-auto"
            >
              Back
            </Button>
            <Button
              type="button"
              onClick={() => setStep(step + 1)}
              disabled={step === 0 && !form.title}
              className="w-full sm:w-auto bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              Continue
            </Button>
          </div>
        ) : (
          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStep(step - 1)}
              className="w-full sm:w-auto"
            >
              Back
            </Button>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSave(false)}
                disabled={saving}
                className="w-full sm:w-auto"
              >
                Save as Draft
              </Button>
              <Button
                type="button"
                onClick={() => handleSave(true)}
                disabled={saving}
                className="w-full sm:w-auto bg-cyan-600 hover:bg-cyan-700 text-white"
              >
                {saving ? "Submitting..." : "Submit for Review"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
