"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Send,
  Mail,
  MousePointerClick,
  Eye,
  AlertTriangle,
  BarChart3,
} from "lucide-react";
import type { Campaign, CampaignStatus } from "@/shared/types/database";

const PAGE_SIZE = 20;

const statusColors: Record<CampaignStatus, string> = {
  draft: "bg-gray-100 text-gray-700",
  sending: "bg-blue-100 text-blue-700",
  sent: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  scheduled: "bg-amber-100 text-amber-700",
  cancelled: "bg-gray-100 text-gray-500",
};

type StatusFilter = "all" | CampaignStatus;

const filterTabs: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "sending", label: "Sending" },
  { value: "sent", label: "Sent" },
  { value: "failed", label: "Failed" },
  { value: "draft", label: "Draft" },
  { value: "scheduled", label: "Scheduled" },
];

// ── Metric card ──────────────────────────────────────────────────────

function MetricCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border p-4 flex items-start gap-3">
      <div className={`rounded-lg p-2 ${color}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-xl font-bold text-gray-900 mt-0.5 leading-tight">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5 truncate">{sub}</p>}
      </div>
    </div>
  );
}

// ── Inline progress bar for sending campaigns ────────────────────────

function ProgressBar({ campaign }: { campaign: Campaign }) {
  const processed = campaign.sent_count + campaign.failed_count;
  const total = campaign.total_recipients;
  const pct = total > 0 ? Math.round((processed / total) * 100) : 0;

  return (
    <div className="flex items-center gap-3 min-w-0">
      <div className="flex-1 bg-blue-100 rounded-full h-2 min-w-[80px]">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-blue-600 whitespace-nowrap font-medium">
        {processed}/{total} ({pct}%)
      </span>
    </div>
  );
}

// ── Micro bar chart for open/click in table rows ─────────────────────

function MiniRateBar({ rate, color }: { rate: number; color: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-12 bg-gray-100 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full ${color}`}
          style={{ width: `${Math.min(rate, 100)}%` }}
        />
      </div>
      <span className="text-xs text-gray-600 tabular-nums">{rate.toFixed(0)}%</span>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────

interface Props {
  initialCampaigns: Campaign[];
}

export function CampaignQueue({ initialCampaigns }: Props) {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");

  const hasSending = campaigns.some((c) => c.status === "sending");

  const fetchCampaigns = useCallback(async () => {
    try {
      const res = await fetch("/api/campaigns");
      if (!res.ok) return;
      const data = await res.json();
      setCampaigns(data);
    } catch {
      // ignore polling errors
    }
  }, []);

  useEffect(() => {
    if (!hasSending) return;
    const interval = setInterval(fetchCampaigns, 5000);
    return () => clearInterval(interval);
  }, [hasSending, fetchCampaigns]);

  // ── Aggregate metrics (computed over ALL campaigns, ignoring filter) ─

  const metrics = useMemo(() => {
    const completed = campaigns.filter((c) => c.status === "sent" || c.status === "failed");
    const totalSent = campaigns.reduce((s, c) => s + c.sent_count, 0);
    const totalDelivered = campaigns.reduce((s, c) => s + c.delivered_count, 0);
    const totalOpened = campaigns.reduce((s, c) => s + c.opened_count, 0);
    const totalClicked = campaigns.reduce((s, c) => s + c.clicked_count, 0);
    const totalBounced = campaigns.reduce((s, c) => s + c.bounced_count, 0);
    const totalFailed = campaigns.reduce((s, c) => s + c.failed_count, 0);
    const totalRecipients = campaigns.reduce((s, c) => s + c.total_recipients, 0);

    const avgOpenRate = totalDelivered > 0 ? (totalOpened / totalDelivered) * 100 : 0;
    const avgClickRate = totalDelivered > 0 ? (totalClicked / totalDelivered) * 100 : 0;
    const bounceRate = totalSent > 0 ? (totalBounced / totalSent) * 100 : 0;

    return {
      totalCampaigns: campaigns.length,
      activeSending: campaigns.filter((c) => c.status === "sending").length,
      completed: completed.length,
      totalRecipients,
      totalSent,
      totalDelivered,
      totalOpened,
      totalClicked,
      totalBounced,
      totalFailed,
      avgOpenRate,
      avgClickRate,
      bounceRate,
    };
  }, [campaigns]);

  // ── Filter + search ─────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let list = campaigns;
    if (statusFilter !== "all") {
      list = list.filter((c) => c.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.subject && c.subject.toLowerCase().includes(q))
      );
    }
    return list;
  }, [campaigns, statusFilter, search]);

  // Reset page when filter/search changes
  useEffect(() => {
    setPage(1);
  }, [statusFilter, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Count per status for filter tab badges
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: campaigns.length };
    for (const c of campaigns) {
      counts[c.status] = (counts[c.status] || 0) + 1;
    }
    return counts;
  }, [campaigns]);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
        <p className="text-sm text-gray-500 mt-1">
          Track email campaign performance and delivery
          {hasSending && (
            <span className="ml-2 inline-flex items-center gap-1.5 text-blue-600">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
              Sending in progress
            </span>
          )}
        </p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <MetricCard
          icon={<Send className="w-4 h-4 text-blue-600" />}
          label="Total Sent"
          value={metrics.totalSent.toLocaleString()}
          sub={`${metrics.totalRecipients.toLocaleString()} recipients total`}
          color="bg-blue-50"
        />
        <MetricCard
          icon={<Mail className="w-4 h-4 text-green-600" />}
          label="Delivered"
          value={metrics.totalDelivered.toLocaleString()}
          sub={metrics.totalSent > 0 ? `${((metrics.totalDelivered / metrics.totalSent) * 100).toFixed(1)}% delivery rate` : "—"}
          color="bg-green-50"
        />
        <MetricCard
          icon={<Eye className="w-4 h-4 text-cyan-600" />}
          label="Avg Open Rate"
          value={`${metrics.avgOpenRate.toFixed(1)}%`}
          sub={`${metrics.totalOpened.toLocaleString()} opens`}
          color="bg-cyan-50"
        />
        <MetricCard
          icon={<MousePointerClick className="w-4 h-4 text-purple-600" />}
          label="Avg Click Rate"
          value={`${metrics.avgClickRate.toFixed(1)}%`}
          sub={`${metrics.totalClicked.toLocaleString()} clicks`}
          color="bg-purple-50"
        />
        <MetricCard
          icon={<AlertTriangle className="w-4 h-4 text-amber-600" />}
          label="Bounce Rate"
          value={`${metrics.bounceRate.toFixed(1)}%`}
          sub={`${metrics.totalBounced.toLocaleString()} bounced`}
          color="bg-amber-50"
        />
        <MetricCard
          icon={<BarChart3 className="w-4 h-4 text-gray-600" />}
          label="Campaigns"
          value={metrics.totalCampaigns.toLocaleString()}
          sub={
            metrics.activeSending > 0
              ? `${metrics.activeSending} sending now`
              : `${metrics.completed} completed`
          }
          color="bg-gray-100"
        />
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        {/* Status tabs */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 overflow-x-auto">
          {filterTabs.map((tab) => {
            const count = statusCounts[tab.value] || 0;
            if (tab.value !== "all" && count === 0) return null;
            return (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  statusFilter === tab.value
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
                <span className="ml-1.5 text-gray-400">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative sm:ml-auto">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9 w-full sm:w-64 text-sm"
          />
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <p className="text-gray-500">
            {campaigns.length === 0
              ? "No campaigns yet. Send your first campaign from the Contacts page."
              : "No campaigns match your filters."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Campaign</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Recipients</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Open Rate</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Click Rate</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 min-w-[180px]">
                    Delivery
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paginated.map((c) => {
                  const openRate =
                    c.delivered_count > 0
                      ? (c.opened_count / c.delivered_count) * 100
                      : 0;
                  const clickRate =
                    c.delivered_count > 0
                      ? (c.clicked_count / c.delivered_count) * 100
                      : 0;

                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-gray-50/50 cursor-pointer group"
                      onClick={() => router.push(`/admin/campaigns/${c.id}/report`)}
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 truncate max-w-xs group-hover:text-cyan-700 transition-colors">
                          {c.name}
                        </p>
                        {c.subject && c.subject !== c.name && (
                          <p className="text-xs text-gray-500 truncate max-w-xs mt-0.5">
                            {c.subject}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
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
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-right tabular-nums">
                        {c.total_recipients.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        {c.status === "sending" ? (
                          <span className="text-xs text-gray-400">—</span>
                        ) : c.delivered_count > 0 ? (
                          <MiniRateBar rate={openRate} color="bg-cyan-500" />
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {c.status === "sending" ? (
                          <span className="text-xs text-gray-400">—</span>
                        ) : c.delivered_count > 0 ? (
                          <MiniRateBar rate={clickRate} color="bg-purple-500" />
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {c.status === "sending" ? (
                          <ProgressBar campaign={c} />
                        ) : c.status === "sent" || c.status === "failed" ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-600">
                              {c.sent_count} sent
                            </span>
                            {c.failed_count > 0 && (
                              <span className="text-xs text-red-500">
                                {c.failed_count} failed
                              </span>
                            )}
                            {c.bounced_count > 0 && (
                              <span className="text-xs text-amber-500">
                                {c.bounced_count} bounced
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                        {c.started_at
                          ? new Date(c.started_at).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : new Date(c.created_at).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
              <span className="text-xs text-gray-500">
                {((page - 1) * PAGE_SIZE + 1).toLocaleString()}–
                {Math.min(page * PAGE_SIZE, filtered.length).toLocaleString()} of{" "}
                {filtered.length.toLocaleString()}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPage((p) => p - 1);
                  }}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                <span className="text-xs text-gray-600 px-1">
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPage((p) => p + 1);
                  }}
                  disabled={page >= totalPages}
                >
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
