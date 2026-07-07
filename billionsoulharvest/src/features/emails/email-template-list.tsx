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

function EmailThumbnail({ bodyHtml }: { bodyHtml: string }) {
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
        className="w-[360px] h-[420px] border-0 pointer-events-none"
        style={{ transform: "scale(0.333)", transformOrigin: "top left" }}
        title="Email preview"
        sandbox=""
        tabIndex={-1}
      />
    </div>
  );
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

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    function handleClick() { setMenuOpen(null); }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [menuOpen]);

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

            return (
              <div
                key={t.id}
                className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer flex items-stretch overflow-hidden"
                onClick={() => {
                  if (isOneOff) return;
                  router.push(`/admin/emails/${t.id}`);
                }}
              >
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
    </div>
  );
}
