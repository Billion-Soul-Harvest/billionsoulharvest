"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Campaign, CampaignSend, CampaignStatus, CampaignSendStatus } from "@/shared/types/database";

interface Props {
  campaign: Campaign;
  sends: CampaignSend[];
}

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

export function CampaignReport({ campaign: initialCampaign, sends: initialSends }: Props) {
  const router = useRouter();
  const [campaign, setCampaign] = useState(initialCampaign);
  const [sends, setSends] = useState(initialSends);
  const isSending = campaign.status === "sending";

  const fetchLatest = useCallback(async () => {
    try {
      const res = await fetch(`/api/campaigns/${campaign.id}/status`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.campaign) setCampaign(data.campaign);
      if (data.sends) setSends(data.sends);
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

      {/* Timestamps */}
      <div className="flex gap-6 text-sm text-gray-500 mb-6">
        {c.started_at && (
          <span>Started: {new Date(c.started_at).toLocaleString()}</span>
        )}
        {c.completed_at && (
          <span>Completed: {new Date(c.completed_at).toLocaleString()}</span>
        )}
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
              {sends.length > 0 ? (
                sends.map((s) => (
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
      </div>

      <div className="mt-6">
        <Button variant="outline" onClick={() => router.push("/admin/campaigns")}>
          Back to Campaigns
        </Button>
      </div>
    </div>
  );
}
