"use client";

import { useRouter, usePathname } from "next/navigation";
import { useCallback, useTransition } from "react";
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
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const navigate = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams();
      const merged = { page: String(page), pageSize: String(pageSize), search, type: typeFilter, region: regionFilter, ...updates };
      for (const [k, v] of Object.entries(merged)) {
        if (v && v !== "all" && v !== "1" && !(k === "pageSize" && v === "25")) {
          params.set(k, v);
        }
      }
      const qs = params.toString();
      startTransition(() => {
        router.push(qs ? `${pathname}?${qs}` : pathname);
      });
    },
    [router, pathname, page, pageSize, search, typeFilter, regionFilter, startTransition]
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
      </div>

      <p className="text-sm text-gray-500 mb-3">
        {totalCount} contact{totalCount !== 1 ? "s" : ""}
      </p>

      {/* Table */}
      <div className={`bg-white rounded-xl border overflow-hidden relative ${isPending ? "opacity-50 pointer-events-none" : ""}`}>
        {isPending && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-emerald-600" />
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Phone</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Church</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Language</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Region</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Tags</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {contacts.length > 0 ? (
                contacts.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/contacts/${c.id}`}
                        className="font-medium text-gray-900 hover:text-emerald-700"
                      >
                        {c.first_name} {c.last_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{c.email ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{c.phone ?? "—"}</td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className={contactTypeColors[c.contact_type]}>
                        {contactTypeLabels[c.contact_type]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{c.church_name ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{c.language ?? "—"}</td>
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
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {c.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                        {c.tags.length > 3 && (
                          <span className="text-gray-400 text-xs">+{c.tags.length - 3}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
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
    </div>
  );
}
