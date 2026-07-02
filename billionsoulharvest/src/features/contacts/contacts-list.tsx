"use client";

import { useState } from "react";
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
  initialContacts: ContactRow[];
  regions: Region[];
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

export function ContactsListClient({ initialContacts, regions }: Props) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");

  const filtered = initialContacts.filter((c) => {
    const matchesSearch =
      !search ||
      `${c.first_name} ${c.last_name} ${c.email} ${c.church_name}`
        .toLowerCase()
        .includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || c.contact_type === typeFilter;
    const matchesRegion =
      regionFilter === "all" || c.region?.id === regionFilter;
    return matchesSearch && matchesType && matchesRegion;
  });

  function exportCSV() {
    const headers = ["First Name", "Last Name", "Email", "Phone", "Type", "Church", "City", "Country", "Region", "Tags"];
    const rows = filtered.map((c) => [
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
        <Input
          placeholder="Search by name, email, church..."
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={typeFilter} onValueChange={(v: string | null) => { if (v) setTypeFilter(v); }}>
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
        <Select value={regionFilter} onValueChange={(v: string | null) => { if (v) setRegionFilter(v); }}>
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
        {filtered.length} contact{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
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
              {filtered.length > 0 ? (
                filtered.map((c) => (
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
      </div>
    </div>
  );
}
