"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Campaign, CampaignSend, CampaignStatus, CampaignSendStatus, SegmentFilter } from "@/shared/types/database";

const SENDS_PAGE_SIZE = 50;

interface Props {
  campaign: Campaign;
  sends: CampaignSend[];
  templateName: string | null;
}

const contactTypeLabels: Record<string, string> = {
  pastor: "Pastor",
  leader: "Leader",
  donor: "Donor",
  attendee: "Attendee",
  subscriber: "Subscriber",
  other: "Other",
};

const statusColors: Record<CampaignStatus, string> = {
  draft: "bg-gray-100 text-gray-700",
  sending: "bg-blue-100 text-blue-700",
  sent: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  scheduled: "bg-amber-100 text-amber-700",
  cancelled: "bg-gray-100 text-gray-500",
};

const sendStatusColors: Record<CampaignSendStatus, string> = {
  queued: "bg-gray-100 text-gray-600",
  sent: "bg-blue-100 text-blue-700",
  delivered: "bg-green-100 text-green-700",
  opened: "bg-cyan-100 text-cyan-700",
  clicked: "bg-purple-100 text-purple-700",
  bounced: "bg-red-100 text-red-700",
  complained: "bg-orange-100 text-orange-700",
  failed: "bg-red-100 text-red-700",
  unsubscribed: "bg-gray-100 text-gray-500",
};

function describeSegmentFilter(filter: SegmentFilter | null): string[] {
  if (!filter) return ["All contacts"];

  const parts: string[] = [];

  // Handle new criteria array format
  if (filter.criteria && filter.criteria.length > 0) {
    for (const c of filter.criteria) {
      const val = Array.isArray(c.value) ? c.value.join(", ") : c.value;
      parts.push(`${c.field} ${c.operator} ${val}`);
    }
  }

  // Handle legacy flat fields
  if (filter.contact_type && filter.contact_type.length > 0) {
    const labels = filter.contact_type.map((t) => contactTypeLabels[t] || t);
    parts.push(`Type: ${labels.join(", ")}`);
  }
  if (filter.region_id) {
    parts.push(`Region: ${filter.region_id}`);
  }
  if (filter.language) {
    parts.push(`Language: ${filter.language}`);
  }
  if (filter.country) {
    parts.push(`Country: ${filter.country}`);
  }
  if (filter.tags_include && filter.tags_include.length > 0) {
    parts.push(`Tags: ${filter.tags_include.join(", ")}`);
  }
  if (filter.email_lists && filter.email_lists.length > 0) {
    parts.push(`Lists: ${filter.email_lists.length} selected`);
  }
  if (filter.contact_ids && filter.contact_ids.length > 0) {
    parts.push(`${filter.contact_ids.length} specific contacts`);
  }

  return parts.length > 0 ? parts : ["All contacts"];
}

function StatCard({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="bg-white border rounded-xl p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value.toLocaleString()}</p>
      {total > 0 && (
        <p className="text-xs text-gray-400 mt-1">{pct}% of {total.toLocaleString()}</p>
      )}
    </div>
  );
}

function SendingProgress({ campaign }: { campaign: Campaign }) {
  const processed = campaign.sent_count + campaign.failed_count;
  const total = campaign.total_recipients;
  const pct = total > 0 ? Math.round((processed / total) * 100) : 0;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
        <span className="text-sm font-medium text-blue-700">
          Sending in progress...
        </span>
        <span className="text-sm text-blue-600 ml-auto">
          {processed.toLocaleString()} / {total.toLocaleString()} ({pct}%)
        </span>
      </div>
      <div className="w-full bg-blue-100 rounded-full h-2.5">
        <div
          className="bg-blue-500 h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm text-gray-900 text-right max-w-[60%]">{value}</span>
    </div>
  );
}

function DetailsTab({ campaign, templateName }: { campaign: Campaign; templateName: string | null }) {
  const c = campaign;
  const audience = describeSegmentFilter(c.segment_filter);

  return (
    <div className="space-y-6">
      <div className="bg-white border rounded-xl p-5">
        <h3 className="text-base font-semibold text-gray-900 mb-3">Campaign Details</h3>
        <DetailRow label="Subject" value={c.subject || "—"} />
        <DetailRow label="Pre-header" value={c.preview_text || "None"} />
        <DetailRow label="From Name" value={c.from_name || "Billion Soul Harvest"} />
        <DetailRow label="From Address" value={c.from_email || "noreply@billionsoulharvest.org"} />
        <DetailRow label="Reply-to" value={c.reply_to || "Same as from address"} />
        <DetailRow label="Template" value={templateName || "None (one-off)"} />
        <DetailRow
          label="Sent"
          value={c.started_at ? new Date(c.started_at).toLocaleString() : "—"}
        />
        <DetailRow
          label="Completed"
          value={c.completed_at ? new Date(c.completed_at).toLocaleString() : "In progress"}
        />
        <DetailRow label="Audience" value={audience.join(" · ")} />

        {c.body_html && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <Dialog>
              <DialogTrigger
                render={<Button variant="outline" size="sm" />}
              >
                Preview Email
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl max-h-[80vh]">
                <DialogHeader>
                  <DialogTitle>Email Preview</DialogTitle>
                </DialogHeader>
                <iframe
                  srcDoc={c.body_html}
                  className="w-full h-[60vh] border rounded-lg bg-white"
                  sandbox="allow-same-origin"
                  title="Email preview"
                />
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </div>
  );
}

function HeadlineMetric({ label, value, subtext }: { label: string; value: string; subtext: string }) {
  return (
    <div className="bg-white border rounded-xl p-5">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-400 mt-1">{subtext}</p>
    </div>
  );
}

export function CampaignReport({ campaign: initialCampaign, sends: initialSends, templateName }: Props) {
  const router = useRouter();
  const [campaign, setCampaign] = useState(initialCampaign);
  const [sends, setSends] = useState(initialSends);
  const [sendsPage, setSendsPage] = useState(1);
  const isSending = campaign.status === "sending";
  const totalSendsPages = Math.ceil(sends.length / SENDS_PAGE_SIZE);
  const paginatedSends = useMemo(
    () => sends.slice((sendsPage - 1) * SENDS_PAGE_SIZE, sendsPage * SENDS_PAGE_SIZE),
    [sends, sendsPage]
  );

  const fetchLatest = useCallback(async () => {
    try {
      const res = await fetch(`/api/campaigns/${campaign.id}/status`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.campaign) setCampaign(data.campaign);
      if (data.sends) { setSends(data.sends); setSendsPage(1); }
    } catch {
      // Silently ignore polling errors
    }
  }, [campaign.id]);

  useEffect(() => {
    if (!isSending) return;
    const interval = setInterval(fetchLatest, 5000);
    return () => clearInterval(interval);
  }, [isSending, fetchLatest]);

  const c = campaign;

  const openRate = c.delivered_count > 0
    ? (c.opened_count / c.delivered_count * 100).toFixed(1)
    : "0.0";
  const clickRate = c.delivered_count > 0
    ? (c.clicked_count / c.delivered_count * 100).toFixed(1)
    : "0.0";

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/admin/campaigns")}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{c.name}</h1>
            {c.subject && (
              <p className="text-sm text-gray-500 mt-0.5">Subject: {c.subject}</p>
            )}
          </div>
        </div>
        <Badge variant="secondary" className={statusColors[c.status]}>
          {c.status === "sending" ? (
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
              Sending
            </span>
          ) : (
            c.status.charAt(0).toUpperCase() + c.status.slice(1)
          )}
        </Badge>
      </div>

      {/* Progress bar when sending */}
      {isSending && <SendingProgress campaign={c} />}

      {/* Tabs */}
      <Tabs defaultValue={0}>
        <TabsList variant="line" className="mb-6 border-b pb-0">
          <TabsTrigger value={0}>Reporting</TabsTrigger>
          <TabsTrigger value={1}>Details</TabsTrigger>
        </TabsList>

        {/* Reporting Tab */}
        <TabsContent value={0}>
          {/* Headline Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <HeadlineMetric
              label="Sent"
              value={c.sent_count.toLocaleString()}
              subtext={`of ${c.total_recipients.toLocaleString()} recipients`}
            />
            <HeadlineMetric
              label="Open Rate"
              value={`${openRate}%`}
              subtext={`${c.opened_count.toLocaleString()} of ${c.delivered_count.toLocaleString()} delivered`}
            />
            <HeadlineMetric
              label="Click Rate"
              value={`${clickRate}%`}
              subtext={`${c.clicked_count.toLocaleString()} of ${c.delivered_count.toLocaleString()} delivered`}
            />
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
            <StatCard label="Sent" value={c.sent_count} total={c.total_recipients} color="text-blue-600" />
            <StatCard label="Delivered" value={c.delivered_count} total={c.sent_count} color="text-green-600" />
            <StatCard label="Opened" value={c.opened_count} total={c.delivered_count} color="text-cyan-600" />
            <StatCard label="Clicked" value={c.clicked_count} total={c.delivered_count} color="text-purple-600" />
            <StatCard label="Bounced" value={c.bounced_count} total={c.sent_count} color="text-red-600" />
            <StatCard label="Complained" value={c.complained_count} total={c.sent_count} color="text-orange-600" />
            <StatCard label="Failed" value={c.failed_count} total={c.total_recipients} color="text-red-600" />
          </div>

          {/* Individual Sends Table */}
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Individual Sends</h2>
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Opened</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Clicked</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Error</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {paginatedSends.length > 0 ? (
                    paginatedSends.map((s) => (
                      <tr key={s.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 text-gray-900">{s.email}</td>
                        <td className="px-4 py-3">
                          <Badge variant="secondary" className={sendStatusColors[s.status]}>
                            {s.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {s.opened_at ? new Date(s.opened_at).toLocaleString() : "\u2014"}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {s.clicked_at ? new Date(s.clicked_at).toLocaleString() : "\u2014"}
                        </td>
                        <td className="px-4 py-3 text-red-600 text-xs max-w-xs truncate">
                          {s.error_message || "\u2014"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                        No sends recorded yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {totalSendsPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
                <span className="text-xs text-gray-500">
                  {((sendsPage - 1) * SENDS_PAGE_SIZE + 1).toLocaleString()}–{Math.min(sendsPage * SENDS_PAGE_SIZE, sends.length).toLocaleString()} of {sends.length.toLocaleString()}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                    onClick={() => setSendsPage((p) => p - 1)}
                    disabled={sendsPage <= 1}
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                  </button>
                  <span className="text-xs text-gray-600 px-1">
                    {sendsPage} / {totalSendsPages}
                  </span>
                  <button
                    type="button"
                    className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                    onClick={() => setSendsPage((p) => p + 1)}
                    disabled={sendsPage >= totalSendsPages}
                  >
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value={1}>
          <DetailsTab campaign={c} templateName={templateName} />
        </TabsContent>
      </Tabs>

      <div className="mt-6">
        <Button variant="outline" onClick={() => router.push("/admin/campaigns")}>
          Back to Campaigns
        </Button>
      </div>
    </div>
  );
}
