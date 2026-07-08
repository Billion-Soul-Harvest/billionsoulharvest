"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, MoreVertical, Copy, Trash2, Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronDown, ChevronUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { EmailTemplateWithStats } from "@/shared/types/database";

interface TemplateCampaign {
  id: string;
  name: string;
  status: string;
  total_recipients: number;
  sent_count: number;
  delivered_count: number;
  opened_count: number;
  clicked_count: number;
  bounced_count: number;
  failed_count: number;
  started_at: string | null;
  completed_at: string | null;
}

interface Props {
  initialTemplates: EmailTemplateWithStats[];
  statusFilter: string;
  totalCount: number;
  page: number;
  pageSize: number;
}

function pct(num: number, total: number): string {
  if (total === 0) return "0%";
  return `${Math.round((num / total) * 100)}%`;
}

export function EmailThumbnail({ bodyHtml }: { bodyHtml: string }) {
  const previewHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@700;800&family=Work+Sans:wght@400&display=swap" rel="stylesheet"/>
      <style>
        body { margin: 0; font-family: 'Work Sans', sans-serif; background: #f3f3f4; }
      </style>
    </head>
    <body>
      <div style="max-width:600px;margin:0 auto;background:#fff;overflow:hidden;">
        <div style="background:#fff;padding:12px 16px;text-align:center;border-bottom:1px solid #c4c6cc;">
          <p style="color:#000;font-family:Manrope,sans-serif;font-size:10px;font-weight:800;letter-spacing:-0.02em;text-transform:uppercase;margin:0;">Billion Soul Harvest</p>
        </div>
        <div style="padding:16px;color:#44474c;font-size:9px;line-height:1.5;">
          ${bodyHtml || '<p style="color:#999;">No content yet</p>'}
        </div>
        <div style="background:#f3f3f4;border-top:1px solid #c4c6cc;padding:10px;text-align:center;">
          <p style="color:#1a1c1c;font-family:Manrope,sans-serif;font-size:6px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;margin:0;">Billion Soul Harvest</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return (
    <div className="w-[120px] h-[140px] rounded-lg border border-gray-200 overflow-hidden bg-gray-50 shrink-0">
      <iframe
        srcDoc={previewHtml}
        className="w-[600px] h-[700px] border-0 pointer-events-none"
        style={{ transform: "scale(0.2)", transformOrigin: "top left" }}
        title="Email preview"
        sandbox=""
        tabIndex={-1}
      />
    </div>
  );
}

export function EmailTemplateList({ initialTemplates, statusFilter, totalCount, page, pageSize }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [templates, setTemplates] = useState(initialTemplates);
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "single"; id: string } | { type: "bulk" } | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [campaignsCache, setCampaignsCache] = useState<Record<string, TemplateCampaign[]>>({});
  const [campaignsLoading, setCampaignsLoading] = useState<string | null>(null);

  useEffect(() => {
    setTemplates(initialTemplates);
    setSelectedIds(new Set());
  }, [initialTemplates]);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    function handleClick() { setMenuOpen(null); }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [menuOpen]);

  function navigate(updates: Record<string, string>) {
    const merged = { status: statusFilter, page: String(page), pageSize: String(pageSize), ...updates };
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) {
      if (v && v !== "all" && !(k === "page" && v === "1") && !(k === "pageSize" && v === "10")) {
        params.set(k, v);
      }
    }
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
  }

  const totalPages = Math.ceil(totalCount / pageSize);
  const startIndex = (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, totalCount);

  const filtered = search
    ? templates.filter(
        (t) =>
          t.name.toLowerCase().includes(search.toLowerCase()) ||
          t.subject.toLowerCase().includes(search.toLowerCase())
      )
    : templates;

  async function handleCopy(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    setMenuOpen(null);
    if (id.startsWith("campaign:")) return;
    try {
      const res = await fetch(`/api/email-templates/${id}`);
      const template = await res.json();
      const copyRes = await fetch("/api/email-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${template.name} (copy)`,
          subject: template.subject,
          body_html: template.body_html,
          preview_text: template.preview_text,
        }),
      });
      if (copyRes.ok) {
        router.refresh();
      }
    } catch (err) {
      console.error("Copy failed:", err);
    }
  }

  function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    setMenuOpen(null);
    if (id.startsWith("campaign:")) return;
    setDeleteConfirm({ type: "single", id });
  }

  // Selectable templates (exclude one-off campaigns)
  const selectableFiltered = filtered.filter((t) => !t.id.startsWith("campaign:"));

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === selectableFiltered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(selectableFiltered.map((t) => t.id)));
    }
  }

  function handleBulkDelete() {
    setDeleteConfirm({ type: "bulk" });
  }

  async function executeDelete() {
    if (!deleteConfirm) return;
    setBulkDeleting(true);
    try {
      if (deleteConfirm.type === "single") {
        await fetch(`/api/email-templates/${deleteConfirm.id}`, { method: "DELETE" });
      } else {
        await Promise.all(
          Array.from(selectedIds).map((id) =>
            fetch(`/api/email-templates/${id}`, { method: "DELETE" })
          )
        );
      }
      setSelectedIds(new Set());
      setDeleteConfirm(null);
      router.refresh();
    } catch (err) {
      console.error("Delete failed:", err);
      setDeleteConfirm(null);
    } finally {
      setBulkDeleting(false);
    }
  }

  async function toggleExpand(templateId: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (expandedId === templateId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(templateId);
    if (!campaignsCache[templateId]) {
      setCampaignsLoading(templateId);
      try {
        // For one-off campaigns (campaign:UUID), fetch that single campaign directly
        const isOneOff = templateId.startsWith("campaign:");
        const realId = isOneOff ? templateId.replace("campaign:", "") : templateId;
        const url = isOneOff
          ? `/api/campaigns/${realId}`
          : `/api/email-templates/${realId}/campaigns`;
        const res = await fetch(url);
        const data = await res.json();
        // Single campaign endpoint returns an object, wrap in array
        setCampaignsCache((prev) => ({
          ...prev,
          [templateId]: isOneOff ? [data] : data,
        }));
      } catch (err) {
        console.error("Failed to load campaigns:", err);
      } finally {
        setCampaignsLoading(null);
      }
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Emails</h1>
        <Link href="/admin/emails/new">
          <Button>+ Create an email</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search emails..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v: string | null) => { if (v) navigate({ status: v, page: "1" }); }}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="draft">Drafts</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-3 mb-3">
        {selectableFiltered.length > 0 && (
          <input
            type="checkbox"
            checked={selectedIds.size > 0 && selectedIds.size === selectableFiltered.length}
            ref={(el) => {
              if (el) el.indeterminate = selectedIds.size > 0 && selectedIds.size < selectableFiltered.length;
            }}
            onChange={toggleSelectAll}
            className="h-4 w-4 rounded border-gray-300 text-cyan-600 cursor-pointer"
          />
        )}
        {selectedIds.size > 0 ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-700 font-medium">
              {selectedIds.size} selected
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
            >
              {bulkDeleting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
              ) : (
                <Trash2 className="w-3.5 h-3.5 mr-1" />
              )}
              Delete
            </Button>
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            {totalCount} email{totalCount !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Email Cards */}
      <div className={`space-y-3 relative ${isPending ? "opacity-50 pointer-events-none" : ""}`}>
        {isPending && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-cyan-600" />
          </div>
        )}

        {filtered.length > 0 ? (
          filtered.map((t) => {
            const isOneOff = t.id.startsWith("campaign:");
            const isDraft = t.send_count === 0;
            const hasSends = t.total_sends > 0;
            const isExpanded = expandedId === t.id;
            const campaigns = campaignsCache[t.id];
            const isLoadingCampaigns = campaignsLoading === t.id;

            return (
              <div key={t.id} className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all overflow-hidden">
                <div
                  className="flex items-stretch cursor-pointer"
                  onClick={() => {
                    if (isOneOff) return;
                    router.push(`/admin/emails/${t.id}`);
                  }}
                >
                  {/* Checkbox */}
                  {!isOneOff && (
                    <div className="flex items-center pl-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(t.id)}
                        onChange={() => toggleSelect(t.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="h-4 w-4 rounded border-gray-300 text-cyan-600 cursor-pointer"
                      />
                    </div>
                  )}

                  {/* Thumbnail */}
                  <div className="p-3 flex items-center">
                    <EmailThumbnail bodyHtml={t.body_html} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 py-4 pr-4 flex flex-col justify-center min-w-0">
                    <div className="flex items-start gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">
                        {t.name}
                      </h3>
                      <Badge
                        variant="secondary"
                        className={`shrink-0 text-xs ${
                          isDraft
                            ? "bg-gray-100 text-gray-600"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {isDraft ? "Draft" : "Sent"}
                      </Badge>
                    </div>

                    {t.subject && (
                      <p className="text-xs text-gray-500 truncate mb-2">
                        {t.subject}
                      </p>
                    )}

                    {hasSends ? (
                      <div className="flex items-center gap-1">
                        <p className="text-xs text-gray-500">
                          <span className="font-medium text-gray-700">{t.total_sends.toLocaleString()}</span> sends
                          {" · "}
                          <span className="font-medium text-gray-700">{t.total_opened.toLocaleString()}</span>{" "}
                          ({pct(t.total_opened, t.total_delivered)}) opens
                          {" · "}
                          <span className="font-medium text-gray-700">{t.total_clicked.toLocaleString()}</span>{" "}
                          ({pct(t.total_clicked, t.total_delivered)}) clicks
                          {" · "}
                          <span className="font-medium text-gray-700">{t.total_bounced.toLocaleString()}</span>{" "}
                          ({pct(t.total_bounced, t.total_sends)}) bounces
                        </p>
                        <button
                          type="button"
                          className="p-0.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                          onClick={(e) => toggleExpand(t.id, e)}
                          title={isExpanded ? "Hide send history" : "Show send history"}
                        >
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400">Not sent yet</p>
                    )}
                  </div>

                  {/* Actions */}
                  {!isOneOff && (
                    <div className="flex items-center pr-3">
                      <div className="relative">
                        <button
                          type="button"
                          className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpen(menuOpen === t.id ? null : t.id);
                          }}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {menuOpen === t.id && (
                          <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
                            <button
                              type="button"
                              className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              onClick={(e) => handleCopy(t.id, e)}
                            >
                              <Copy className="w-3.5 h-3.5" /> Duplicate
                            </button>
                            <button
                              type="button"
                              className="w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              onClick={(e) => handleDelete(t.id, e)}
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Expandable send history */}
                {isExpanded && (
                  <div className="border-t border-gray-100 px-4 py-3">
                    {isLoadingCampaigns ? (
                      <div className="flex items-center justify-center py-3">
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                        <span className="ml-2 text-xs text-gray-400">Loading campaigns...</span>
                      </div>
                    ) : campaigns && campaigns.length > 0 ? (
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-gray-500 text-left">
                            <th className="pb-2 font-medium">Date</th>
                            <th className="pb-2 font-medium">Campaign</th>
                            <th className="pb-2 font-medium">Status</th>
                            <th className="pb-2 font-medium text-right">Recipients</th>
                            <th className="pb-2 font-medium text-right">Delivered</th>
                            <th className="pb-2 font-medium text-right">Opened</th>
                            <th className="pb-2 font-medium text-right">Clicked</th>
                          </tr>
                        </thead>
                        <tbody>
                          {campaigns.map((c: TemplateCampaign) => (
                            <tr
                              key={c.id}
                              className="hover:bg-gray-50 cursor-pointer border-t border-gray-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (t.id.startsWith("campaign:")) {
                                  router.push(`/admin/campaigns/${c.id}/report`);
                                } else {
                                  router.push(`/admin/emails/${t.id}`);
                                }
                              }}
                            >
                              <td className="py-1.5 text-gray-600">
                                {c.started_at
                                  ? new Date(c.started_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                                  : "--"}
                              </td>
                              <td className="py-1.5 text-gray-900 font-medium truncate max-w-[200px]">{c.name}</td>
                              <td className="py-1.5">
                                <Badge
                                  variant="secondary"
                                  className={`text-[10px] ${
                                    c.status === "sent"
                                      ? "bg-green-100 text-green-700"
                                      : c.status === "sending"
                                      ? "bg-blue-100 text-blue-700"
                                      : "bg-gray-100 text-gray-600"
                                  }`}
                                >
                                  {c.status === "sent" ? "Sent" : c.status === "sending" ? "Sending" : c.status}
                                </Badge>
                              </td>
                              <td className="py-1.5 text-right text-gray-700">{c.total_recipients}</td>
                              <td className="py-1.5 text-right text-gray-700">
                                {c.delivered_count} <span className="text-gray-400">({pct(c.delivered_count, c.sent_count)})</span>
                              </td>
                              <td className="py-1.5 text-right text-gray-700">
                                {c.opened_count} <span className="text-gray-400">({pct(c.opened_count, c.delivered_count)})</span>
                              </td>
                              <td className="py-1.5 text-right text-gray-700">
                                {c.clicked_count} <span className="text-gray-400">({pct(c.clicked_count, c.delivered_count)})</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="text-xs text-gray-400 text-center py-2">No campaigns found</p>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-400 mb-3">No emails found</p>
            <Link href="/admin/emails/new">
              <Button variant="outline" size="sm">Create your first email</Button>
            </Link>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalCount > 0 && (
        <div className="flex items-center justify-between border-t mt-4 pt-3">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              {startIndex}–{endIndex} of {totalCount}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Rows:</span>
              <Select
                value={String(pageSize)}
                onValueChange={(v: string | null) => {
                  if (v) navigate({ pageSize: v, page: "1" });
                }}
              >
                <SelectTrigger className="w-[70px] h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate({ page: "1" })}
              disabled={page <= 1}
            >
              <ChevronsLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate({ page: String(page - 1) })}
              disabled={page <= 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-gray-600 px-2">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate({ page: String(page + 1) })}
              disabled={page >= totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate({ page: String(totalPages) })}
              disabled={page >= totalPages}
            >
              <ChevronsRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={(open) => { if (!open) setDeleteConfirm(null); }}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>
              {deleteConfirm?.type === "bulk"
                ? `Delete ${selectedIds.size} email${selectedIds.size !== 1 ? "s" : ""}?`
                : "Delete email?"}
            </DialogTitle>
            <DialogDescription>
              {deleteConfirm?.type === "bulk"
                ? `This will permanently delete ${selectedIds.size} selected email${selectedIds.size !== 1 ? "s" : ""}. This action cannot be undone.`
                : "This will permanently delete this email. This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={executeDelete} disabled={bulkDeleting}>
              {bulkDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
