"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { createClient } from "@/shared/utils/supabase/client";
import type { Audience, AudienceType, SegmentFilter } from "@/shared/types/database";

const PAGE_SIZE_OPTIONS = [25, 50, 100];

interface Props {
  audiences: Audience[];
  contactCounts: Record<string, number>;
  emailCounts: Record<string, number>;
  totalCount: number;
  page: number;
  pageSize: number;
  search: string;
  typeFilter: string;
  stats: {
    newLast30Days: number;
    subscribed: number;
    unsubscribed: number;
  };
}

const emptyFilter: SegmentFilter = {};

export function AudiencesClient({
  audiences,
  contactCounts,
  emailCounts,
  totalCount,
  page,
  pageSize,
  search,
  typeFilter,
  stats,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<Audience | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [typePickerOpen, setTypePickerOpen] = useState(false);
  const [typePickerChoice, setTypePickerChoice] = useState<"segment" | "list">("segment");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  // Clear selection when page/filters change
  useEffect(() => {
    setSelected(new Set());
  }, [page, pageSize, search, typeFilter]);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = () => setMenuOpen(null);
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [menuOpen]);

  const allSelected = audiences.length > 0 && selected.size === audiences.length;
  const someSelected = selected.size > 0 && selected.size < audiences.length;

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(audiences.map((a) => a.id)));
    }
  }

  async function handleBulkDelete() {
    setBulkDeleting(true);
    const supabase = createClient();
    const toDelete = audiences.filter((a) => selected.has(a.id));

    // Remove list names from contacts for list-type audiences
    const listNames = toDelete.filter((a) => a.type === "list").map((a) => a.name);
    for (const name of listNames) {
      await supabase.rpc("remove_audience_list", { p_name: name });
    }

    // Delete all selected audiences
    const ids = toDelete.map((a) => a.id);
    await supabase.from("audiences").delete().in("id", ids);

    setBulkDeleting(false);
    setBulkDeleteOpen(false);
    setSelected(new Set());
    router.refresh();
  }

  const [form, setForm] = useState({
    name: "",
    description: "",
    type: "list" as AudienceType,
    segment_filter: { ...emptyFilter } as SegmentFilter,
  });

  const navigate = useCallback(
    (updates: Record<string, string>) => {
      const merged = {
        page: String(page),
        pageSize: String(pageSize),
        search,
        type: typeFilter,
        ...updates,
      };
      const params = new URLSearchParams();
      for (const [k, v] of Object.entries(merged)) {
        if (
          v &&
          v !== "all" &&
          v !== "1" &&
          !(k === "pageSize" && v === "25") &&
          !(k === "search" && v === "")
        ) {
          params.set(k, v);
        }
      }
      const qs = params.toString();
      startTransition(() => {
        router.push(qs ? `${pathname}?${qs}` : pathname);
      });
    },
    [router, pathname, page, pageSize, search, typeFilter, startTransition]
  );

  const totalPages = Math.ceil(totalCount / pageSize);
  const startIndex = totalCount > 0 ? (page - 1) * pageSize + 1 : 0;
  const endIndex = Math.min(page * pageSize, totalCount);

  function openCreate() {
    setTypePickerChoice("segment");
    setTypePickerOpen(true);
  }

  function handleTypeContinue() {
    setTypePickerOpen(false);
    if (typePickerChoice === "segment") {
      router.push("/admin/audiences/segments/new");
    } else {
      setEditingId(null);
      setForm({ name: "", description: "", type: "list", segment_filter: { ...emptyFilter } });
      setDialogOpen(true);
    }
  }

  function openEdit(audience: Audience) {
    if (audience.type === "segment") {
      router.push(`/admin/audiences/segments/${audience.id}`);
      return;
    }
    setEditingId(audience.id);
    setForm({
      name: audience.name,
      description: audience.description ?? "",
      type: audience.type,
      segment_filter: audience.segment_filter ?? { ...emptyFilter },
    });
    setDialogOpen(true);
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);

    const supabase = createClient();
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      type: form.type,
      segment_filter: form.type === "segment" ? form.segment_filter : null,
    };

    if (editingId) {
      const original = audiences.find((a) => a.id === editingId);
      if (original && original.type === "list" && original.name !== payload.name) {
        await supabase.rpc("rename_audience_list", {
          p_old: original.name,
          p_new: payload.name,
        });
      }
      await supabase.from("audiences").update(payload).eq("id", editingId);
      setSaving(false);
      setDialogOpen(false);
      router.refresh();
    } else {
      const { error: insertError } = await supabase.from("audiences").insert(payload);
      if (insertError) {
        setSaving(false);
        alert(insertError.message);
        return;
      }
      // Query back to get the ID (insert+select may not return due to RLS)
      const { data: created } = await supabase
        .from("audiences")
        .select("id, type")
        .eq("name", payload.name)
        .single();
      setSaving(false);
      setDialogOpen(false);
      if (created && created.type === "list") {
        router.push(`/admin/audiences/lists/${created.id}`);
      } else {
        router.refresh();
      }
    }
  }

  async function handleDelete(audience: Audience) {
    setDeleting(true);
    const supabase = createClient();

    if (audience.type === "list") {
      await supabase.rpc("remove_audience_list", { p_name: audience.name });
    }
    await supabase.from("audiences").delete().eq("id", audience.id);

    setDeleting(false);
    setDeleteDialog(null);
    router.refresh();
  }

  async function toggleFavorite(audience: Audience) {
    const supabase = createClient();
    await supabase
      .from("audiences")
      .update({ is_favorite: !audience.is_favorite })
      .eq("id", audience.id);
    router.refresh();
  }

  function handleSendEmail(audience: Audience) {
    // Navigate to campaigns with this audience pre-selected
    router.push(`/admin/campaigns/new?audience=${encodeURIComponent(audience.name)}`);
  }

  async function handleCopy(audience: Audience) {
    const supabase = createClient();
    const copyName = `${audience.name} (copy)`;
    await supabase.from("audiences").insert({
      name: copyName,
      description: audience.description,
      type: audience.type,
      segment_filter: audience.segment_filter,
      is_favorite: false,
    });
    router.refresh();
  }

  async function handleExport(audience: Audience) {
    const supabase = createClient();
    const { data: contacts } = await supabase
      .from("contacts")
      .select("first_name, last_name, email, phone, contact_type, church_name, city, country")
      .contains("email_lists", [audience.name]);

    if (!contacts || contacts.length === 0) return;

    const headers = ["First Name", "Last Name", "Email", "Phone", "Type", "Church", "City", "Country"];
    const rows = contacts.map((c) => [
      c.first_name, c.last_name, c.email ?? "", c.phone ?? "",
      c.contact_type, c.church_name ?? "", c.city ?? "", c.country ?? "",
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${audience.name}-contacts-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Audiences</h1>
        <Button onClick={openCreate}>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Audience
        </Button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="New Subscribers (30d)" value={stats.newLast30Days} />
        <StatCard label="Subscribed" value={stats.subscribed} />
        <StatCard label="Unsubscribed" value={stats.unsubscribed} />
      </div>

      {/* Filter Bar — matches CC layout */}
      <div className="bg-white rounded-xl border p-4 mb-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {selected.size > 0 ? (
              <>
                <span className="text-sm font-semibold text-gray-900">Selected lists</span>
                <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-cyan-100 text-xs font-medium text-cyan-700">
                  {selected.size}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                  onClick={() => setBulkDeleteOpen(true)}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500"
                  onClick={() => setSelected(new Set())}
                >
                  Clear
                </Button>
              </>
            ) : (
              <>
                <span className="text-sm font-semibold text-gray-900">Your lists</span>
                <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-gray-100 text-xs font-medium text-gray-700">
                  {totalCount}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            <SearchInput
              defaultValue={search}
              onSearch={(v) => navigate({ search: v, page: "1" })}
              placeholder="Search by list name"
            />
            <div className="flex items-center border rounded-full overflow-hidden">
              {(["all", "list", "segment"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => navigate({ type: tab, page: "1" })}
                  className={`px-4 py-1.5 text-sm font-medium ${
                    typeFilter === tab
                      ? "bg-cyan-600 text-white"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {tab === "all" ? "All" : tab === "list" ? "Lists" : "Segments"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      {audiences.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          {totalCount === 0 && !search && typeFilter === "all"
            ? "No audiences yet. Create one to get started."
            : "No audiences match your filters."}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-t-0 rounded-t-none overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-3 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => { if (el) el.indeterminate = someSelected; }}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                  />
                </th>
                <th className="px-3 py-3 w-10">
                  <span className="sr-only">Favorite</span>
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Contacts</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">SMS</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">List type</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Date created</th>
                <th className="px-3 py-3 w-10">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {audiences.map((audience) => {
                const count = contactCounts[audience.id] ?? 0;
                const emailCount = emailCounts[audience.id] ?? 0;
                const isSelected = selected.has(audience.id);
                return (
                  <tr key={audience.id} className={`group/row ${isSelected ? "bg-cyan-50/50" : "hover:bg-gray-50/50"}`}>
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(audience.id)}
                        className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <button
                        onClick={() => toggleFavorite(audience)}
                        className="text-gray-300 hover:text-amber-500 transition-colors"
                        title={audience.is_favorite ? "Remove from favorites" : "Add to favorites"}
                      >
                        {audience.is_favorite ? (
                          <svg className="w-5 h-5 text-amber-500 fill-amber-500" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => {
                          if (audience.type === "list") {
                            router.push(`/admin/audiences/lists/${audience.id}`);
                          } else {
                            router.push(`/admin/audiences/segments/${audience.id}`);
                          }
                        }}
                        className="font-medium text-gray-900 hover:text-cyan-600 hover:underline text-left"
                      >
                        {audience.name}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{count.toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-700">{emailCount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-700">0</td>
                    <td className="px-4 py-3">
                      <Badge variant={audience.type === "list" ? "secondary" : "outline"}>
                        {audience.type === "list" ? "List" : "Segment"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(audience.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-3 py-3 relative">
                      <button
                        onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === audience.id ? null : audience.id); }}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <circle cx="12" cy="5" r="1.5" />
                          <circle cx="12" cy="12" r="1.5" />
                          <circle cx="12" cy="19" r="1.5" />
                        </svg>
                      </button>
                      {menuOpen === audience.id && (
                        <div className="absolute right-4 mt-1 bg-white border rounded-lg shadow-lg py-1 z-10 min-w-[180px]">
                          <button
                            onClick={() => { setMenuOpen(null); handleSendEmail(audience); }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            Send an email
                          </button>
                          <button
                            onClick={() => { setMenuOpen(null); openEdit(audience); }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            Rename
                          </button>
                          <button
                            onClick={() => { setMenuOpen(null); handleCopy(audience); }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            Copy
                          </button>
                          <button
                            onClick={() => { setMenuOpen(null); /* TODO: add contacts to list */ }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            Add contacts to list
                          </button>
                          <button
                            onClick={() => { setMenuOpen(null); handleExport(audience); }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            Export
                          </button>
                          <div className="border-t my-1" />
                          <button
                            onClick={() => { setMenuOpen(null); setDeleteDialog(audience); }}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete list
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

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
      )}

      {/* Type Picker Dialog */}
      <Dialog open={typePickerOpen} onOpenChange={setTypePickerOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create an audience</DialogTitle>
            <DialogDescription>Choose the type of audience you want to create.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-2">
            {([
              {
                type: "segment" as const,
                label: "Segment",
                desc: "Create a list from a set of criteria that updates contacts automatically.",
                icon: (
                  <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ),
              },
              {
                type: "list" as const,
                label: "List",
                desc: "Manually add contacts to a list that can only be updated by you.",
                icon: (
                  <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                ),
              },
            ]).map((opt) => (
              <button
                key={opt.type}
                type="button"
                onClick={() => setTypePickerChoice(opt.type)}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-colors ${
                  typePickerChoice === opt.type
                    ? "border-cyan-600 bg-cyan-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center">
                  {opt.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-gray-900 block">{opt.label}</span>
                  <span className="text-xs text-gray-500 leading-snug">{opt.desc}</span>
                </div>
                {typePickerChoice === opt.type && (
                  <svg className="w-5 h-5 text-cyan-600 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                )}
              </button>
            ))}
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button onClick={handleTypeContinue}>Continue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* List Name Dialog (CC-style) */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Rename list" : "Name your list"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Input
                value={form.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm({ ...form, name: e.target.value.slice(0, 255) })
                }
                required
                placeholder="Untitled list"
                autoFocus
              />
              <p className="text-xs text-gray-400 text-right">{form.name.length}/255</p>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDialogOpen(false);
                  if (!editingId) setTypePickerOpen(true);
                }}
              >
                {editingId ? "Cancel" : "Back"}
              </Button>
              <Button type="submit" disabled={saving || !form.name.trim()}>
                {saving ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteDialog(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Audience</DialogTitle>
            <DialogDescription>
              {deleteDialog?.type === "list"
                ? `Are you sure? This will remove "${deleteDialog.name}" from all contacts' email lists.`
                : "Are you sure you want to delete this segment? This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button
              variant="destructive"
              onClick={() => deleteDialog && handleDelete(deleteDialog)}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete {selected.size} audience{selected.size !== 1 ? "s" : ""}?</DialogTitle>
            <DialogDescription>
              This will permanently delete the selected audiences.
              {audiences.filter((a) => selected.has(a.id) && a.type === "list").length > 0 &&
                " List-type audiences will also be removed from all contacts' email lists."}
              {" "}This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
            >
              {bulkDeleting ? "Deleting..." : `Delete ${selected.size} audience${selected.size !== 1 ? "s" : ""}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SearchInput({
  defaultValue,
  onSearch,
  placeholder = "Search audiences...",
}: {
  defaultValue: string;
  onSearch: (value: string) => void;
  placeholder?: string;
}) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div className="relative">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <Input
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === "Enter") onSearch(value);
        }}
        onBlur={() => {
          if (value !== defaultValue) onSearch(value);
        }}
        placeholder={placeholder}
        className="pl-9 w-[200px]"
      />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl border p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value.toLocaleString()}</p>
    </div>
  );
}

