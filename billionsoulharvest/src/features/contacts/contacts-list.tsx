"use client";

import { useRouter, usePathname } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, Pencil, Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { createClient } from "@/shared/utils/supabase/client";
import type { ContactType } from "@/shared/types/database";

interface ContactRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  contact_type: ContactType;
  tags: string[];
  church_name: string | null;
  city: string | null;
  country: string | null;
  language: string | null;
  gender: string | null;
  region: { id: string; name: string; color: string } | null;
  created_at: string;
}

interface Region {
  id: string;
  name: string;
  color: string;
}

interface Props {
  contacts: ContactRow[];
  regions: Region[];
  totalCount: number;
  page: number;
  pageSize: number;
  search: string;
  typeFilter: string;
  regionFilter: string;
  languageFilter: string;
  languages: string[];
  sort: string;
  dir: string;
}

const contactTypeLabels: Record<ContactType, string> = {
  pastor: "Pastor",
  leader: "Leader",
  donor: "Donor",
  attendee: "Attendee",
  subscriber: "Subscriber",
  other: "Other",
};

const contactTypeColors: Record<ContactType, string> = {
  pastor: "bg-purple-100 text-purple-800",
  leader: "bg-blue-100 text-blue-800",
  donor: "bg-green-100 text-green-800",
  attendee: "bg-amber-100 text-amber-800",
  subscriber: "bg-gray-100 text-gray-700",
  other: "bg-gray-100 text-gray-600",
};

const PAGE_SIZE_OPTIONS = [25, 50, 100];

export function ContactsListClient({
  contacts,
  regions,
  totalCount,
  page,
  pageSize,
  search,
  typeFilter,
  regionFilter,
  languageFilter,
  languages,
  sort,
  dir,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [expandedTags, setExpandedTags] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDialog, setBulkDialog] = useState<"tags" | "region" | "type" | "delete" | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkTagInput, setBulkTagInput] = useState("");
  const [bulkTagMode, setBulkTagMode] = useState<"add" | "replace">("add");
  const [bulkRegion, setBulkRegion] = useState("");
  const [bulkType, setBulkType] = useState<ContactType | "">("");

  const allOnPageSelected = contacts.length > 0 && contacts.every((c) => selected.has(c.id));
  const someSelected = selected.size > 0;

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (allOnPageSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        contacts.forEach((c) => next.delete(c.id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        contacts.forEach((c) => next.add(c.id));
        return next;
      });
    }
  }

  async function executeBulk(action: () => Promise<void>) {
    setBulkLoading(true);
    try {
      await action();
      setSelected(new Set());
      setBulkDialog(null);
      router.refresh();
    } finally {
      setBulkLoading(false);
    }
  }

  async function bulkAssignTags() {
    const supabase = createClient();
    const newTags = bulkTagInput.split(",").map((t) => t.trim()).filter(Boolean);
    if (newTags.length === 0) return;
    const ids = [...selected];

    if (bulkTagMode === "replace") {
      await supabase.from("contacts").update({ tags: newTags }).in("id", ids);
    } else {
      const { data } = await supabase.from("contacts").select("id, tags").in("id", ids);
      for (const contact of data ?? []) {
        const merged = [...new Set([...(contact.tags ?? []), ...newTags])];
        await supabase.from("contacts").update({ tags: merged }).eq("id", contact.id);
      }
    }
  }

  async function bulkAssignRegion() {
    const supabase = createClient();
    await supabase.from("contacts").update({ region_id: bulkRegion || null }).in("id", [...selected]);
  }

  async function bulkChangeType() {
    const supabase = createClient();
    await supabase.from("contacts").update({ contact_type: bulkType as ContactType }).in("id", [...selected]);
  }

  async function bulkDelete() {
    const supabase = createClient();
    await supabase.from("contacts").delete().in("id", [...selected]);
  }

  function exportSelectedCSV() {
    const selectedContacts = contacts.filter((c) => selected.has(c.id));
    const headers = ["First Name", "Last Name", "Email", "Phone", "Type", "Church", "City", "Country", "Region", "Tags"];
    const rows = selectedContacts.map((c) => [
      c.first_name, c.last_name, c.email ?? "", c.phone ?? "",
      c.contact_type, c.church_name ?? "", c.city ?? "", c.country ?? "",
      c.region?.name ?? "", c.tags.join("; "),
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `contacts-selected-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const navigate = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams();
      const merged = { page: String(page), pageSize: String(pageSize), search, type: typeFilter, region: regionFilter, language: languageFilter, sort, dir, ...updates };
      for (const [k, v] of Object.entries(merged)) {
        if (v && v !== "all" && v !== "1" && !(k === "pageSize" && v === "25") && !(k === "sort" && v === "created_at") && !(k === "dir" && v === "desc")) {
          params.set(k, v);
        }
      }
      const qs = params.toString();
      startTransition(() => {
        router.push(qs ? `${pathname}?${qs}` : pathname);
      });
    },
    [router, pathname, page, pageSize, search, typeFilter, regionFilter, sort, dir, startTransition]
  );

  const totalPages = Math.ceil(totalCount / pageSize);
  const startIndex = (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, totalCount);

  function exportCSV() {
    const headers = ["First Name", "Last Name", "Email", "Phone", "Type", "Church", "City", "Country", "Region", "Tags"];
    const rows = contacts.map((c) => [
      c.first_name, c.last_name, c.email ?? "", c.phone ?? "",
      c.contact_type, c.church_name ?? "", c.city ?? "", c.country ?? "",
      c.region?.name ?? "", c.tags.join("; "),
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `contacts-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function sortHeader(label: string, column: string) {
    const isActive = sort === column;
    return (
      <button
        type="button"
        className="inline-flex items-center gap-1 hover:text-gray-900"
        onClick={() => navigate({
          sort: column,
          dir: isActive && dir === "asc" ? "desc" : "asc",
          page: "1",
        })}
      >
        {label}
        {isActive ? (
          <span className="text-cyan-600">{dir === "asc" ? "▲" : "▼"}</span>
        ) : (
          <span className="text-gray-300">▲</span>
        )}
      </button>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
        <Button variant="outline" onClick={exportCSV}>
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            navigate({ search: formData.get("search") as string, page: "1" });
          }}
          className="flex gap-2 max-w-sm"
        >
          <Input
            name="search"
            placeholder="Search by name, email, church..."
            defaultValue={search}
          />
          <Button type="submit" variant="outline" size="sm">
            Search
          </Button>
        </form>
        <Select value={typeFilter} onValueChange={(v: string | null) => { if (v) navigate({ type: v, page: "1" }); }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(contactTypeLabels).map(([val, label]) => (
              <SelectItem key={val} value={val}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={regionFilter} onValueChange={(v: string | null) => { if (v) navigate({ region: v, page: "1" }); }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Regions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            {regions.map((r) => (
              <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={languageFilter} onValueChange={(v: string | null) => { if (v) navigate({ language: v, page: "1" }); }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Languages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Languages</SelectItem>
            {languages.map((lang) => (
              <SelectItem key={lang} value={lang}>{lang}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-gray-500 mb-3">
        {totalCount} contact{totalCount !== 1 ? "s" : ""}
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
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allOnPageSelected}
                    onChange={toggleAll}
                    className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                  />
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">{sortHeader("Name", "first_name")}</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">{sortHeader("Email", "email")}</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Phone</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">{sortHeader("Type", "contact_type")}</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">{sortHeader("Church", "church_name")}</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Language</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Region</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Tags</th>
                <th className="px-4 py-3 w-24"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {contacts.length > 0 ? (
                contacts.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 group/row">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(c.id)}
                        onChange={() => toggleOne(c.id)}
                        className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/contacts/${c.id}`}
                        className="font-medium text-gray-900 hover:text-cyan-700"
                      >
                        {c.first_name} {c.last_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{c.email}</td>
                    <td className="px-4 py-3 text-gray-600">{c.phone}</td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className={contactTypeColors[c.contact_type]}>
                        {contactTypeLabels[c.contact_type]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{c.church_name}</td>
                    <td className="px-4 py-3 text-gray-600">{c.language}</td>
                    <td className="px-4 py-3">
                      {c.region ? (
                        <span className="inline-flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: c.region.color }}
                          />
                          <span className="text-gray-700">{c.region.name}</span>
                        </span>
                      ) : (
                        null
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(expandedTags.has(c.id) ? c.tags : c.tags.slice(0, 2)).map((tag) => (
                          <span key={tag} className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                        {c.tags.length > 2 && (
                          <button
                            type="button"
                            onClick={() => {
                              setExpandedTags((prev) => {
                                const next = new Set(prev);
                                if (next.has(c.id)) next.delete(c.id);
                                else next.add(c.id);
                                return next;
                              });
                            }}
                            className="text-cyan-600 hover:text-cyan-800 text-xs font-medium px-1"
                          >
                            {expandedTags.has(c.id) ? "show less" : `+${c.tags.length - 2}`}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
                        <Link
                          href={`/admin/contacts/${c.id}`}
                          className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/contacts/${c.id}?edit=true`}
                          className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        {c.email && (
                          <a
                            href={`mailto:${c.email}`}
                            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700"
                            title="Email"
                          >
                            <Mail className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-gray-400">
                    No contacts found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalCount > 0 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
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
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <SelectItem key={size} value={String(size)}>
                        {size}
                      </SelectItem>
                    ))}
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
                First
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate({ page: String(page - 1) })}
                disabled={page <= 1}
              >
                Prev
              </Button>
              <span className="px-3 text-sm text-gray-600">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate({ page: String(page + 1) })}
                disabled={page >= totalPages}
              >
                Next
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate({ page: String(totalPages) })}
                disabled={page >= totalPages}
              >
                Last
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Action Bar */}
      {someSelected && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white rounded-xl shadow-2xl px-6 py-3 flex items-center gap-3">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <div className="w-px h-5 bg-gray-600" />
          <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700" onClick={exportSelectedCSV}>
            Export
          </Button>
          <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700" onClick={() => { setBulkTagInput(""); setBulkTagMode("add"); setBulkDialog("tags"); }}>
            Tags
          </Button>
          <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700" onClick={() => { setBulkRegion(""); setBulkDialog("region"); }}>
            Region
          </Button>
          <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700" onClick={() => { setBulkType(""); setBulkDialog("type"); }}>
            Type
          </Button>
          <Button variant="ghost" size="sm" className="text-red-400 hover:bg-gray-700 hover:text-red-300" onClick={() => setBulkDialog("delete")}>
            Delete
          </Button>
          <div className="w-px h-5 bg-gray-600" />
          <Button variant="ghost" size="sm" className="text-gray-400 hover:bg-gray-700 hover:text-white" onClick={() => setSelected(new Set())}>
            Clear
          </Button>
        </div>
      )}

      {/* Assign Tags Dialog */}
      <Dialog open={bulkDialog === "tags"} onOpenChange={(open) => { if (!open) setBulkDialog(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Tags to {selected.size} contacts</DialogTitle>
            <DialogDescription>Enter tags separated by commas.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Tag 1, Tag 2, ..."
              value={bulkTagInput}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBulkTagInput(e.target.value)}
            />
            <div className="flex gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="tagMode" checked={bulkTagMode === "add"} onChange={() => setBulkTagMode("add")} />
                Add to existing
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="tagMode" checked={bulkTagMode === "replace"} onChange={() => setBulkTagMode("replace")} />
                Replace all
              </label>
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button onClick={() => executeBulk(bulkAssignTags)} disabled={bulkLoading}>
              {bulkLoading ? "Applying..." : "Apply"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Region Dialog */}
      <Dialog open={bulkDialog === "region"} onOpenChange={(open) => { if (!open) setBulkDialog(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Region to {selected.size} contacts</DialogTitle>
          </DialogHeader>
          <Select value={bulkRegion} onValueChange={(v: string | null) => setBulkRegion(v ?? "")}>
            <SelectTrigger>
              <SelectValue placeholder="Select region..." />
            </SelectTrigger>
            <SelectContent>
              {regions.map((r) => (
                <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button onClick={() => executeBulk(bulkAssignRegion)} disabled={bulkLoading || !bulkRegion}>
              {bulkLoading ? "Applying..." : "Apply"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Type Dialog */}
      <Dialog open={bulkDialog === "type"} onOpenChange={(open) => { if (!open) setBulkDialog(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Type for {selected.size} contacts</DialogTitle>
          </DialogHeader>
          <Select value={bulkType} onValueChange={(v: string | null) => setBulkType((v ?? "") as ContactType | "")}>
            <SelectTrigger>
              <SelectValue placeholder="Select type..." />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(contactTypeLabels).map(([val, label]) => (
                <SelectItem key={val} value={val}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button onClick={() => executeBulk(bulkChangeType)} disabled={bulkLoading || !bulkType}>
              {bulkLoading ? "Applying..." : "Apply"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={bulkDialog === "delete"} onOpenChange={(open) => { if (!open) setBulkDialog(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete {selected.size} contacts?</DialogTitle>
            <DialogDescription>This action cannot be undone. These contacts and all their associated data will be permanently deleted.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button variant="destructive" onClick={() => executeBulk(bulkDelete)} disabled={bulkLoading}>
              {bulkLoading ? "Deleting..." : `Delete ${selected.size} contacts`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
