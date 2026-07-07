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
import { Search, MoreVertical, Copy, Trash2 } from "lucide-react";
import type { EmailTemplateWithStats } from "@/shared/types/database";

interface Props {
  initialTemplates: EmailTemplateWithStats[];
  statusFilter: string;
}

function pct(num: number, total: number): string {
  if (total === 0) return "0%";
  return `${Math.round((num / total) * 100)}%`;
}

export function EmailTemplateList({ initialTemplates, statusFilter }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [templates, setTemplates] = useState(initialTemplates);
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  useEffect(() => {
    setTemplates(initialTemplates);
  }, [initialTemplates]);

  function navigate(status: string) {
    const params = new URLSearchParams();
    if (status !== "all") params.set("status", status);
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
  }

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
    // For one-off sends (campaign:xxx), skip copy
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

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    setMenuOpen(null);
    if (id.startsWith("campaign:")) return;
    if (!confirm("Delete this email template?")) return;
    try {
      await fetch(`/api/email-templates/${id}`, { method: "DELETE" });
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
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
        <Select value={statusFilter} onValueChange={(v: string | null) => { if (v) navigate(v); }}>
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

      <p className="text-sm text-gray-500 mb-3">
        {filtered.length} email{filtered.length !== 1 ? "s" : ""}
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
                <th className="text-right px-4 py-3 font-medium text-gray-600">Sends</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Opens</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Clicks</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Bounces</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Last sent</th>
                <th className="w-10 px-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.length > 0 ? (
                filtered.map((t) => {
                  const isOneOff = t.id.startsWith("campaign:");
                  const isDraft = t.send_count === 0;

                  return (
                    <tr
                      key={t.id}
                      className="hover:bg-gray-50/50 cursor-pointer"
                      onClick={() => {
                        if (isOneOff) return;
                        router.push(`/admin/emails/${t.id}`);
                      }}
                    >
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-900">{t.name}</span>
                        {t.subject && (
                          <span className="block text-xs text-gray-500 mt-0.5 truncate max-w-xs">
                            {t.subject}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="secondary"
                          className={isDraft ? "bg-gray-100 text-gray-700" : "bg-green-100 text-green-700"}
                        >
                          {isDraft ? "Draft" : "Sent"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        {t.total_sends > 0 ? t.total_sends.toLocaleString() : "—"}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        {t.total_opened > 0 ? `${t.total_opened.toLocaleString()} (${pct(t.total_opened, t.total_delivered)})` : "—"}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        {t.total_clicked > 0 ? `${t.total_clicked.toLocaleString()} (${pct(t.total_clicked, t.total_delivered)})` : "—"}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        {t.total_bounced > 0 ? `${t.total_bounced.toLocaleString()} (${pct(t.total_bounced, t.total_sends)})` : "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {t.last_sent_at ? new Date(t.last_sent_at).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-2 py-3">
                        {!isOneOff && (
                          <div className="relative">
                            <button
                              type="button"
                              className="p-1 rounded hover:bg-gray-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                setMenuOpen(menuOpen === t.id ? null : t.id);
                              }}
                            >
                              <MoreVertical className="w-4 h-4 text-gray-400" />
                            </button>
                            {menuOpen === t.id && (
                              <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
                                <button
                                  type="button"
                                  className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                  onClick={(e) => handleCopy(t.id, e)}
                                >
                                  <Copy className="w-3.5 h-3.5" /> Copy
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
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                    No emails found
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
