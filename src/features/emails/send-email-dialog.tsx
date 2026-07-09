"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { WysiwygEditor } from "@/shared/components/wysiwyg-editor";
import { Check, ArrowLeft, Loader2, ExternalLink } from "lucide-react";
import type { SegmentFilter, CampaignTemplate } from "@/shared/types/database";
import { EmailThumbnail } from "./email-template-list";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactIds: string[];
  selectAllMode: boolean;
  selectAllFilter?: SegmentFilter;
  recipientCount: number;
  onSuccess?: () => void;
}

type Step = "compose" | "confirm" | "sending" | "done";

export function SendEmailDialog({
  open,
  onOpenChange,
  contactIds,
  selectAllMode,
  selectAllFilter,
  recipientCount,
  onSuccess,
}: Props) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("compose");
  const [templates, setTemplates] = useState<CampaignTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // Template selection
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

  // Compose new
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);

  // Which tab is active
  const [activeTab, setActiveTab] = useState(0);

  // Sending state
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Snapshot the count when dialog opens so it survives selection clearing
  const [snapshotCount, setSnapshotCount] = useState(0);

  // Fetch templates when dialog opens
  useEffect(() => {
    if (open) {
      setStep("compose");
      setSelectedTemplateId(null);
      setComposeSubject("");
      setComposeBody("");
      setSaveAsTemplate(false);
      setActiveTab(0);
      setError(null);
      setSnapshotCount(recipientCount);
      fetchTemplates();
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchTemplates() {
    setLoadingTemplates(true);
    try {
      const res = await fetch("/api/email-templates?status=all");
      const data = await res.json();
      // Filter to only actual templates (not one-off campaigns)
      setTemplates(
        (data as CampaignTemplate[]).filter((t) => !(t.id as string).startsWith("campaign:"))
      );
    } catch {
      setTemplates([]);
    } finally {
      setLoadingTemplates(false);
    }
  }

  const canProceed =
    activeTab === 0
      ? !!selectedTemplateId
      : composeSubject.trim() && composeBody.trim();

  function handleNext() {
    if (!canProceed) return;
    setStep("confirm");
  }

  const handleSend = useCallback(async () => {
    setStep("sending");
    setError(null);

    const payload: Record<string, unknown> = {};

    if (activeTab === 0 && selectedTemplateId) {
      payload.template_id = selectedTemplateId;
    } else {
      payload.subject = composeSubject;
      payload.body_html = composeBody;
      payload.save_as_template = saveAsTemplate;
    }

    if (selectAllMode && selectAllFilter) {
      payload.select_all_filter = selectAllFilter;
    } else {
      payload.contact_ids = contactIds;
    }

    try {
      const res = await fetch("/api/email-templates/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Send failed");
      }

      const data = await res.json();
      setCampaignId(data.campaign_id);
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Send failed");
      setStep("confirm");
    }
  }, [activeTab, selectedTemplateId, composeSubject, composeBody, saveAsTemplate, selectAllMode, selectAllFilter, contactIds]);

  const emailSubject = activeTab === 0 ? selectedTemplate?.subject : composeSubject;
  const emailBodyHtml = activeTab === 0 ? selectedTemplate?.body_html : composeBody;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={step === "confirm" && emailBodyHtml ? "sm:max-w-3xl" : "sm:max-w-lg"}>
        <DialogHeader>
          <DialogTitle>
            {step === "done" ? "Campaign started!" : step === "confirm" ? "Confirm send" : "Send Campaign"}
          </DialogTitle>
          {step === "compose" && (
            <DialogDescription>
              Send to {snapshotCount.toLocaleString()} contact{snapshotCount !== 1 ? "s" : ""}
            </DialogDescription>
          )}
        </DialogHeader>

        {/* Step 1: Compose */}
        {step === "compose" && (
          <div>
            <Tabs defaultValue={0} onValueChange={(v: number) => setActiveTab(v)}>
              <TabsList variant="line" className="mb-4 border-b pb-0">
                <TabsTrigger value={0}>Pick a Template</TabsTrigger>
                <TabsTrigger value={1}>Compose New</TabsTrigger>
              </TabsList>

              <TabsContent value={0}>
                {loadingTemplates ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                  </div>
                ) : templates.length === 0 ? (
                  <p className="text-sm text-gray-500 py-6 text-center">
                    No templates yet. Create one from the Emails page or compose a new email below.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {templates.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        className={`w-full text-left p-2.5 rounded-lg border transition-colors flex items-center gap-3 ${
                          selectedTemplateId === t.id
                            ? "border-cyan-500 bg-cyan-50"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                        onClick={() => setSelectedTemplateId(t.id)}
                      >
                        <EmailThumbnail bodyHtml={t.body_html} />
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 text-sm">{t.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5 truncate">{t.subject}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value={1}>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="send-subject">Subject</Label>
                    <Input
                      id="send-subject"
                      value={composeSubject}
                      onChange={(e) => setComposeSubject(e.target.value)}
                      placeholder="Email subject line"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Body</Label>
                    <p className="text-xs text-gray-500 mb-1">
                      Merge fields: {"{{first_name}}"}, {"{{last_name}}"}
                    </p>
                    <WysiwygEditor value={composeBody} onChange={setComposeBody} />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={saveAsTemplate}
                      onChange={(e) => setSaveAsTemplate(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    Save as template
                  </label>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleNext} disabled={!canProceed}>
                Next
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* Step 2: Confirm */}
        {step === "confirm" && (
          <div>
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Subject</p>
                <p className="text-sm text-gray-900 mt-0.5">{emailSubject}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Recipients</p>
                <p className="text-sm text-gray-900 mt-0.5">
                  {snapshotCount.toLocaleString()} contact{snapshotCount !== 1 ? "s" : ""}
                </p>
              </div>

              {/* Email preview */}
              {emailBodyHtml && (
                <div className="bg-[#f3f3f4] rounded-lg border overflow-hidden">
                  <iframe
                    srcDoc={emailBodyHtml}
                    title="Email preview"
                    className="w-full border-0"
                    style={{ height: "400px" }}
                    sandbox=""
                  />
                </div>
              )}

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-800">
                  Emails send immediately and can&apos;t be unscheduled!
                </p>
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
            </div>

            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setStep("compose")}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button onClick={handleSend}>
                Send now
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* Sending */}
        {step === "sending" && (
          <div className="flex flex-col items-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-600 mb-3" />
            <p className="text-sm text-gray-600">Sending emails...</p>
          </div>
        )}

        {/* Done */}
        {step === "done" && (
          <div>
            <div className="flex flex-col items-center py-6">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1">Campaign started!</p>
              <p className="text-sm text-gray-600">
                Sending to {snapshotCount.toLocaleString()} contact{snapshotCount !== 1 ? "s" : ""} in the background.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { onOpenChange(false); onSuccess?.(); }}>Close</Button>
              <Button onClick={() => { onOpenChange(false); onSuccess?.(); router.push("/admin/campaigns"); }}>
                <ExternalLink className="w-4 h-4 mr-1.5" />
                View Progress
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
