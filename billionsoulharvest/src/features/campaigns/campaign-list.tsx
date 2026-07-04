"use client";

import { useRouter, usePathname } from "next/navigation";
import { useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Campaign, CampaignStatus } from "@/shared/types/database";

interface Props {
  campaigns: Campaign[];
  statusFilter: string;
}

const statusLabels: Record<CampaignStatus, string> = {
  draft: "Draft",
  sending: "Sending",
  sent: "Sent",
  failed: "Failed",
  scheduled: "Scheduled",
  cancelled: "Cancelled",
};

const statusColors: Record<CampaignStatus, string> = {
  draft: "bg-gray-100 text-gray-700",
  sending: "bg-blue-100 text-blue-700",
  sent: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  scheduled: "bg-amber-100 text-amber-700",
  cancelled: "bg-gray-100 text-gray-500",
};

function pct(num: number, total: number): string {
  if (total === 0) return "0%";
  return `${Math.round((num / total) * 100)}%`;
}

export function CampaignListClient({ campaigns, statusFilter }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function navigate(status: string) {
    const params = new URLSearchParams();
    if (status !== "all") params.set("status", status);
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
        <Link href="/admin/campaigns/new">
          <Button>New Campaign</Button>
        </Link>
      </div>

      {/* Status Filter */}
      <div className="mb-4">
        <Select value={statusFilter} onValueChange={(v: string | null) => { if (v) navigate(v); }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.entries(statusLabels).map(([val, label]) => (
              <SelectItem key={val} value={val}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-gray-500 mb-3">
        {campaigns.length} campaign{campaigns.length !== 1 ? "s" : ""}
      </p>

      {/* Table */}
      <div className={`bg-white rounded-xl border overflow-hidden relative ${isPending ? "opacity-50 pointer-events-none" : ""}`}>
        {isPending && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-cyan-600" />
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Recipients</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Sent</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Delivered</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Opened</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {campaigns.length > 0 ? (
                campaigns.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-gray-50/50 cursor-pointer"
                    onClick={() => {
                      if (c.status === "draft") {
                        router.push(`/admin/campaigns/${c.id}`);
                      } else {
                        router.push(`/admin/campaigns/${c.id}/report`);
                      }
                    }}
                  >
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-900">{c.name}</span>
                      {c.subject && (
                        <span className="block text-xs text-gray-500 mt-0.5 truncate max-w-xs">
                          {c.subject}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className={statusColors[c.status]}>
                        {statusLabels[c.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {c.total_recipients.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {c.sent_count > 0 ? `${c.sent_count.toLocaleString()} (${pct(c.sent_count, c.total_recipients)})` : "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {c.delivered_count > 0 ? `${c.delivered_count.toLocaleString()} (${pct(c.delivered_count, c.sent_count)})` : "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {c.opened_count > 0 ? `${c.opened_count.toLocaleString()} (${pct(c.opened_count, c.delivered_count)})` : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    No campaigns found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
