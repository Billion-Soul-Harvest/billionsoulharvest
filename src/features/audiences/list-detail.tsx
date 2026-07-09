"use client";

import { useCallback, useState, useTransition } from "react";
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
import { sanitizeSearch } from "@/shared/utils/sanitize-search";
import type { Audience } from "@/shared/types/database";

const PAGE_SIZE_OPTIONS = [25, 50, 100];

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  contact_type: string;
  church_name: string | null;
  city: string | null;
  country: string | null;
  created_at: string;
}

interface Props {
  audience: Audience;
  contacts: Contact[];
  totalCount: number;
  page: number;
  pageSize: number;
  search: string;
}

export function ListDetailPage({
  audience,
  contacts,
  totalCount,
  page,
  pageSize,
  search,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(search);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [addContactsOpen, setAddContactsOpen] = useState(false);
  const [contactSearch, setContactSearch] = useState("");
  const [contactResults, setContactResults] = useState<Contact[]>([]);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);

  const totalPages = Math.ceil(totalCount / pageSize);
  const startIndex = totalCount > 0 ? (page - 1) * pageSize + 1 : 0;
  const endIndex = Math.min(page * pageSize, totalCount);

  const navigate = useCallback(
    (updates: Record<string, string>) => {
      const merged = {
        page: String(page),
        pageSize: String(pageSize),
        search,
        ...updates,
      };
      const params = new URLSearchParams();
      for (const [k, v] of Object.entries(merged)) {
        if (v && !(k === "page" && v === "1") && !(k === "pageSize" && v === "25") && !(k === "search" && v === "")) {
          params.set(k, v);
        }
      }
      const qs = params.toString();
      startTransition(() => {
        router.push(qs ? `${pathname}?${qs}` : pathname);
      });
    },
    [router, pathname, page, pageSize, search, startTransition]
  );

  async function handleDelete() {
    setDeleting(true);
    const supabase = createClient();
    await supabase.rpc("remove_audience_list", { p_name: audience.name });
    await supabase.from("audiences").delete().eq("id", audience.id);
    setDeleting(false);
    setDeleteDialog(false);
    router.push("/admin/audiences");
  }

  async function handleRemoveContact(contactId: string) {
    const supabase = createClient();
    const { data: contact } = await supabase
      .from("contacts")
      .select("email_lists")
      .eq("id", contactId)
      .single();

    if (contact) {
      const updatedLists = (contact.email_lists ?? []).filter(
        (l: string) => l !== audience.name
      );
      await supabase
        .from("contacts")
        .update({ email_lists: updatedLists })
        .eq("id", contactId);
      router.refresh();
    }
  }

  async function searchContacts() {
    if (!contactSearch.trim()) return;
    setSearching(true);
    const supabase = createClient();
    const s = sanitizeSearch(contactSearch);
    const { data } = await supabase
      .from("contacts")
      .select("id, first_name, last_name, email, phone, contact_type, church_name, city, country, created_at")
      .or(
        `first_name.ilike.%${s}%,last_name.ilike.%${s}%,email.ilike.%${s}%`
      )
      .limit(20);
    setContactResults((data ?? []) as Contact[]);
    setSearching(false);
  }

  async function addContactToList(contactId: string) {
    setAdding(contactId);
    const supabase = createClient();
    const { data: contact } = await supabase
      .from("contacts")
      .select("email_lists")
      .eq("id", contactId)
      .single();

    if (contact) {
      const lists = contact.email_lists ?? [];
      if (!lists.includes(audience.name)) {
        await supabase
          .from("contacts")
          .update({ email_lists: [...lists, audience.name] })
          .eq("id", contactId);
      }
    }
    setAdding(null);
    router.refresh();
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-1">
        <button
          onClick={() => router.push("/admin/audiences")}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{audience.name}</h1>
        <Badge variant="secondary">List</Badge>
      </div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500 ml-8">
          Created{" "}
          {new Date(audience.created_at).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setDeleteDialog(true)}>
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </Button>
        </div>
      </div>

      {totalCount === 0 && !search ? (
        /* Empty state */
        <div className="bg-white rounded-xl border p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No contacts in this list yet
          </h3>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
            Add contacts to this list to start organizing your audience.
          </p>
          <div className="flex flex-col items-center gap-3">
            <Button onClick={() => setAddContactsOpen(true)}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Select existing contacts
            </Button>
          </div>
        </div>
      ) : (
        /* Contacts table */
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900">Contacts</span>
              <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-gray-100 text-xs font-medium text-gray-700">
                {totalCount}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <Input
                  value={searchValue}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchValue(e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key === "Enter") navigate({ search: searchValue, page: "1" });
                  }}
                  onBlur={() => {
                    if (searchValue !== search) navigate({ search: searchValue, page: "1" });
                  }}
                  placeholder="Search contacts..."
                  className="pl-9 w-[200px]"
                />
              </div>
              <Button size="sm" onClick={() => setAddContactsOpen(true)}>
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add contacts
              </Button>
            </div>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-4 py-3 font-medium text-gray-500">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Phone</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Type</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Church</th>
                <th className="px-3 py-3 w-10">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {contacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {contact.first_name} {contact.last_name}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{contact.email ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-700">{contact.phone ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary">{contact.contact_type}</Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{contact.church_name ?? "—"}</td>
                  <td className="px-3 py-3">
                    <button
                      onClick={() => handleRemoveContact(contact.id)}
                      className="text-gray-400 hover:text-red-500 p-1"
                      title="Remove from list"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalCount > pageSize && (
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
                <Button variant="outline" size="sm" onClick={() => navigate({ page: "1" })} disabled={page <= 1}>
                  First
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate({ page: String(page - 1) })} disabled={page <= 1}>
                  Prev
                </Button>
                <span className="px-3 text-sm text-gray-600">{page} / {totalPages}</span>
                <Button variant="outline" size="sm" onClick={() => navigate({ page: String(page + 1) })} disabled={page >= totalPages}>
                  Next
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate({ page: String(totalPages) })} disabled={page >= totalPages}>
                  Last
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Contacts Dialog */}
      <Dialog open={addContactsOpen} onOpenChange={setAddContactsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add contacts to {audience.name}</DialogTitle>
            <DialogDescription>Search for existing contacts to add to this list.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="flex gap-2">
              <Input
                value={contactSearch}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContactSearch(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent) => {
                  if (e.key === "Enter") searchContacts();
                }}
                placeholder="Search by name or email..."
                autoFocus
              />
              <Button onClick={searchContacts} disabled={searching}>
                {searching ? "..." : "Search"}
              </Button>
            </div>
            {contactResults.length > 0 && (
              <div className="max-h-[300px] overflow-y-auto border rounded-lg divide-y">
                {contactResults.map((c) => {
                  const alreadyInList = contacts.some((existing) => existing.id === c.id);
                  return (
                    <div
                      key={c.id}
                      className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {c.first_name} {c.last_name}
                        </p>
                        <p className="text-xs text-gray-500">{c.email ?? "No email"}</p>
                      </div>
                      {alreadyInList ? (
                        <span className="text-xs text-gray-400">Already in list</span>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addContactToList(c.id)}
                          disabled={adding === c.id}
                        >
                          {adding === c.id ? "Adding..." : "Add"}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete List</DialogTitle>
            <DialogDescription>
              Are you sure? This will remove &quot;{audience.name}&quot; from all contacts&apos; email lists.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
